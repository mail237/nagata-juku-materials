import type { Material } from "./types";

export type WorkbookSeries = "あいきゃん" | "フォレスタ";
export type WorkbookSubject = "国語" | "算数" | "数学" | "英語" | "理科" | "社会";

const LEVEL_ORDER: Record<string, number> = {
  prep1: 0,
  prep2: 1,
};

const AIKYAN_SUBJECTS: WorkbookSubject[] = ["国語", "算数"];

const FORESTA_BY_GRADE: Record<string, WorkbookSubject[]> = {
  小1: ["国語", "算数"],
  小2: ["国語", "算数"],
  小3: ["国語", "算数"],
  小4: ["国語", "算数"],
  小5: ["国語", "算数"],
  小6: ["国語", "算数"],
  中1: ["国語", "数学", "英語", "理科", "社会"],
  中2: ["国語", "数学", "英語", "理科", "社会"],
  中3: ["国語", "数学", "英語", "理科", "社会"],
  高1: ["国語", "数学", "英語", "理科", "社会"],
  高2: ["国語", "数学", "英語", "理科", "社会"],
  高3: ["国語", "数学", "英語", "理科", "社会"],
};

export function getWorkbookSeries(material: Material): WorkbookSeries | null {
  if (material.name.startsWith("あいきゃん")) return "あいきゃん";
  if (material.name.startsWith("フォレスタ")) return "フォレスタ";
  return null;
}

export function getWorkbookSubject(material: Material): WorkbookSubject | null {
  for (const subject of ["国語", "算数", "数学", "英語", "理科", "社会"] as const) {
    if (material.name.includes(subject)) return subject;
  }
  return null;
}

export function getSubjectsForGrade(
  series: WorkbookSeries,
  grade: string,
): WorkbookSubject[] {
  if (series === "あいきゃん") {
    return AIKYAN_SUBJECTS;
  }
  return FORESTA_BY_GRADE[grade] ?? ["国語", "数学", "英語", "理科", "社会"];
}

export function filterMaterialsBySeries(
  materials: Material[],
  series: WorkbookSeries,
): Material[] {
  return materials.filter((m) => getWorkbookSeries(m) === series);
}

export function filterMaterialsBySeriesAndSubject(
  materials: Material[],
  series: WorkbookSeries,
  subject: WorkbookSubject,
): Material[] {
  return materials.filter(
    (m) => getWorkbookSeries(m) === series && getWorkbookSubject(m) === subject,
  );
}

export function filterMaterialsForStudent(
  materials: Material[],
  series: WorkbookSeries,
  grade: string,
): Material[] {
  const subjects = new Set(getSubjectsForGrade(series, grade));
  return materials.filter((m) => {
    if (getWorkbookSeries(m) !== series) return false;
    const subject = getWorkbookSubject(m);
    return subject ? subjects.has(subject) : false;
  });
}

export function sortMaterialsByLevel(materials: Material[]): Material[] {
  return [...materials].sort((a, b) => {
    const seriesCmp = (getWorkbookSeries(a) ?? "").localeCompare(
      getWorkbookSeries(b) ?? "",
      "ja",
    );
    if (seriesCmp !== 0) return seriesCmp;

    const subjectCmp = (getWorkbookSubject(a) ?? "").localeCompare(
      getWorkbookSubject(b) ?? "",
      "ja",
    );
    if (subjectCmp !== 0) return subjectCmp;

    return levelSortKey(a.id) - levelSortKey(b.id);
  });
}

function levelSortKey(materialId: string): number {
  const level = materialId.split("-").pop() ?? "";
  if (level in LEVEL_ORDER) return LEVEL_ORDER[level];
  const num = Number(level);
  return Number.isFinite(num) ? num + 2 : 999;
}

export function getLevelLabel(material: Material): string {
  if (getWorkbookSeries(material) === "フォレスタ") {
    return getWorkbookSubject(material) ?? material.name;
  }

  const level = material.id.split("-").pop() ?? "";
  if (level === "prep1") return "準備級1";
  if (level === "prep2") return "準備級2";
  const num = Number(level);
  if (Number.isFinite(num)) return `${num}級`;
  return material.name;
}

/** @deprecated use filterMaterialsBySeriesAndSubject */
export function filterMaterialsBySubject(
  materials: Material[],
  subject: WorkbookSubject,
): Material[] {
  return sortMaterialsByLevel(
    materials.filter((m) => getWorkbookSubject(m) === subject),
  );
}
