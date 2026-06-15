export const GRADES = [
  "小1",
  "小2",
  "小3",
  "小4",
  "小5",
  "小6",
  "中1",
  "中2",
  "中3",
  "高1",
  "高2",
  "高3",
] as const;

export type Grade = (typeof GRADES)[number];

export const STORAGE_KEYS = {
  students: "nagata_students",
  materials: "nagata_materials",
  distributions: "nagata_distributions",
  payments: "nagata_payments",
  orderMemos: "nagata_order_memos",
  workbookAssignments: "nagata_workbook_assignments",
} as const;

export const BRAND_COLOR = "#2563EB";
