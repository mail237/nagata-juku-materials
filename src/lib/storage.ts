import { STORAGE_KEYS } from "./constants";
import { createInitialMaterials } from "./initial-data";
import { createInitialStudents } from "./initial-students";
import type {
  AppData,
  Distribution,
  Material,
  OrderMemo,
  Payment,
  Student,
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

export function loadAppData(): AppData {
  let materials = readJson<Material[]>(STORAGE_KEYS.materials, []);
  let students = readJson<Student[]>(STORAGE_KEYS.students, []);

  if (materials.length === 0) {
    materials = createInitialMaterials();
    writeJson(STORAGE_KEYS.materials, materials);
  }

  if (students.length === 0) {
    students = createInitialStudents();
    writeJson(STORAGE_KEYS.students, students);
  }

  return {
    students,
    materials,
    distributions: readJson<Distribution[]>(STORAGE_KEYS.distributions, []),
    payments: readJson<Payment[]>(STORAGE_KEYS.payments, []),
    orderMemos: readJson<OrderMemo[]>(STORAGE_KEYS.orderMemos, []),
    workbookAssignments: readJson<WorkbookAssignment[]>(
      STORAGE_KEYS.workbookAssignments,
      [],
    ),
  };
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
