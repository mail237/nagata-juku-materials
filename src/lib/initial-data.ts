import type { Material } from "./types";

const SUBJECTS = ["国語", "算数"] as const;

export function createInitialMaterials(): Material[] {
  return SUBJECTS.flatMap((subject) => [
    {
      id: `${subject}-prep1`,
      name: `あいきゃん ${subject} 準備級1`,
      price: 700,
    },
    {
      id: `${subject}-prep2`,
      name: `あいきゃん ${subject} 準備級2`,
      price: 700,
    },
    ...Array.from({ length: 42 }, (_, i) => ({
      id: `${subject}-${i + 1}`,
      name: `あいきゃん ${subject} ${i + 1}級`,
      price: 700,
    })),
  ]);
}
