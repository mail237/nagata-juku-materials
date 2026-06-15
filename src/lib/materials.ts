import type { Material } from "./types";

export type WorkbookSubject = "国語" | "算数";

const LEVEL_ORDER: Record<string, number> = {
  "prep1": 0,
  "prep2": 1,
};

export function getWorkbookSubject(material: Material): WorkbookSubject | null {
  if (material.name.includes("国語")) return "国語";
  if (material.name.includes("算数")) return "算数";
  return null;
}

export function sortMaterialsByLevel(materials: Material[]): Material[] {
  return [...materials].sort((a, b) => {
    const subject = a.name.localeCompare(b.name, "ja");
    if (subject !== 0) return subject;
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
  const level = material.id.split("-").pop() ?? "";
  if (level === "prep1") return "準備級1";
  if (level === "prep2") return "準備級2";
  const num = Number(level);
  if (Number.isFinite(num)) return `${num}級`;
  return material.name;
}

export function filterMaterialsBySubject(
  materials: Material[],
  subject: WorkbookSubject,
): Material[] {
  return sortMaterialsByLevel(
    materials.filter((m) => getWorkbookSubject(m) === subject),
  );
}
