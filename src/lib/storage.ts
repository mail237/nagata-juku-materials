import { STORAGE_KEYS } from "./constants";
import {
  createForestaMaterials,
  createInitialMaterials,
  migrateMaterialId,
  migrateMaterials,
} from "./initial-data";
import { createInitialStudents } from "./initial-students";
import type {
  AppData,
  Distribution,
  Material,
  OrderMemo,
  Payment,
  Student,
  StudentSeries,
  WorkbookAssignment,
} from "./types";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function migrateMaterialReferences<T extends { materialId: string }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    materialId: migrateMaterialId(item.materialId),
  }));
}

function ensureMaterials(raw: Material[]): Material[] {
  let materials = migrateMaterials(raw);

  if (materials.length === 0) {
    materials = createInitialMaterials();
    writeJson(STORAGE_KEYS.materials, materials);
    return materials;
  }

  if (!materials.some((m) => m.name.startsWith("フォレスタ"))) {
    materials = [...materials, ...createForestaMaterials()];
    writeJson(STORAGE_KEYS.materials, materials);
  }

  return materials;
}

export function loadAppData(): AppData {
  const rawMaterials = readJson<Material[]>(STORAGE_KEYS.materials, []);
  const materials = ensureMaterials(rawMaterials);
  let students = readJson<Student[]>(STORAGE_KEYS.students, []);

  if (students.length === 0) {
    students = createInitialStudents();
    writeJson(STORAGE_KEYS.students, students);
  }

  const rawDistributions = readJson<Distribution[]>(STORAGE_KEYS.distributions, []);
  const rawPayments = readJson<Payment[]>(STORAGE_KEYS.payments, []);
  const rawWorkbooks = readJson<WorkbookAssignment[]>(
    STORAGE_KEYS.workbookAssignments,
    [],
  );

  const distributions = migrateMaterialReferences(rawDistributions);
  const payments = migrateMaterialReferences(rawPayments);
  const workbookAssignments = migrateMaterialReferences(rawWorkbooks);

  const needsMigration =
    rawMaterials.some((m) => m.id !== migrateMaterialId(m.id)) ||
    !rawMaterials.some((m) => m.name.startsWith("フォレスタ")) && rawMaterials.length > 0 ||
    rawDistributions.some((d) => d.materialId !== migrateMaterialId(d.materialId)) ||
    rawPayments.some((p) => p.materialId !== migrateMaterialId(p.materialId)) ||
    rawWorkbooks.some((w) => w.materialId !== migrateMaterialId(w.materialId));

  const result: AppData = {
    students,
    materials,
    distributions,
    payments,
    orderMemos: readJson<OrderMemo[]>(STORAGE_KEYS.orderMemos, []),
    workbookAssignments,
    studentSeries: readJson<StudentSeries[]>(STORAGE_KEYS.studentSeries, []),
  };

  if (needsMigration) {
    saveAppData(result);
  }

  return result;
}

export function importRosterStudents(): Student[] {
  const students = createInitialStudents();
  writeJson(STORAGE_KEYS.students, students);
  return students;
}

export function saveAppData(data: AppData): void {
  writeJson(STORAGE_KEYS.students, data.students);
  writeJson(STORAGE_KEYS.materials, data.materials);
  writeJson(STORAGE_KEYS.distributions, data.distributions);
  writeJson(STORAGE_KEYS.payments, data.payments);
  writeJson(STORAGE_KEYS.orderMemos, data.orderMemos);
  writeJson(STORAGE_KEYS.workbookAssignments, data.workbookAssignments);
  writeJson(STORAGE_KEYS.studentSeries, data.studentSeries);
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) {
    return "─";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "─";
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createId(): string {
  return crypto.randomUUID();
}
