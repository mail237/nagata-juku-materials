import type { Material } from "./types";

const AIKYAN_SUBJECTS = ["国語", "算数"] as const;

export function createAikyanMaterials(): Material[] {
  return AIKYAN_SUBJECTS.flatMap((subject) => [
    {
      id: `aikyan-${subject}-prep1`,
      name: `あいきゃん ${subject} 準備級1`,
      price: 700,
    },
    {
      id: `aikyan-${subject}-prep2`,
      name: `あいきゃん ${subject} 準備級2`,
      price: 700,
    },
    ...Array.from({ length: 42 }, (_, i) => ({
      id: `aikyan-${subject}-${i + 1}`,
      name: `あいきゃん ${subject} ${i + 1}級`,
      price: 700,
    })),
  ]);
}

/** フォレスタは教科単位（級なし） */
const FORESTA_SUBJECTS = ["国語", "算数", "数学", "英語", "理科", "社会"] as const;

export function createForestaMaterials(): Material[] {
  return FORESTA_SUBJECTS.map((subject) => ({
    id: `foresta-${subject}`,
    name: `フォレスタ ${subject}`,
    price: 700,
  }));
}

export function createInitialMaterials(): Material[] {
  return [...createAikyanMaterials(), ...createForestaMaterials()];
}

/** 旧ID（国語-prep1 など）を新IDへ寄せる */
export function migrateMaterialId(id: string): string {
  if (id.startsWith("aikyan-") || id.startsWith("foresta-")) {
    return id;
  }
  const match = id.match(/^(国語|算数)-(.+)$/);
  if (match) {
    return `aikyan-${match[1]}-${match[2]}`;
  }
  return id;
}

export function migrateMaterials(materials: Material[]): Material[] {
  return materials.map((m) => ({
    ...m,
    id: migrateMaterialId(m.id),
  }));
}
