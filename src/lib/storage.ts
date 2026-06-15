import { STORAGE_KEYS } from "./constants";
import {
  createForestaMaterials,
  createInitialMaterials,
  migrateMaterialId,
  migrateMaterials,
} from "./initial-data";
import { createInitialStudents } from "./initial-students";
import { readIndexedDb, writeIndexedDb } from "./indexed-db";
import { LOCAL_BACKUP_KEY, type StoredAppData } from "./storage-types";
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

function buildAppDataFromParts(input: {
  rawMaterials: Material[];
  students: Student[];
  rawDistributions: Distribution[];
  rawPayments: Payment[];
  rawWorkbooks: WorkbookAssignment[];
  orderMemos: OrderMemo[];
  studentSeries: StudentSeries[];
}): { data: AppData; needsMigration: boolean } {
  const materials = ensureMaterials(input.rawMaterials);
  let students = input.students;

  if (students.length === 0) {
    students = createInitialStudents();
  }

  const distributions = migrateMaterialReferences(input.rawDistributions);
  const payments = migrateMaterialReferences(input.rawPayments);
  const workbookAssignments = migrateMaterialReferences(input.rawWorkbooks);

  const needsMigration =
    input.rawMaterials.some((m) => m.id !== migrateMaterialId(m.id)) ||
    (input.rawMaterials.length > 0 &&
      !input.rawMaterials.some((m) => m.name.startsWith("フォレスタ"))) ||
    input.rawDistributions.some((d) => d.materialId !== migrateMaterialId(d.materialId)) ||
    input.rawPayments.some((p) => p.materialId !== migrateMaterialId(p.materialId)) ||
    input.rawWorkbooks.some((w) => w.materialId !== migrateMaterialId(w.materialId));

  return {
    data: {
      students,
      materials,
      distributions,
      payments,
      orderMemos: input.orderMemos,
      workbookAssignments,
      studentSeries: input.studentSeries,
    },
    needsMigration,
  };
}

function ensureMaterials(raw: Material[]): Material[] {
  let materials = migrateMaterials(raw);

  if (materials.length === 0) {
    return createInitialMaterials();
  }

  if (!materials.some((m) => m.name.startsWith("フォレスタ"))) {
    materials = [...materials, ...createForestaMaterials()];
  }

  return materials;
}

function loadFromLegacyLocalStorage(): StoredAppData {
  const rawMaterials = readJson<Material[]>(STORAGE_KEYS.materials, []);
  const { data, needsMigration } = buildAppDataFromParts({
    rawMaterials,
    students: readJson<Student[]>(STORAGE_KEYS.students, []),
    rawDistributions: readJson<Distribution[]>(STORAGE_KEYS.distributions, []),
    rawPayments: readJson<Payment[]>(STORAGE_KEYS.payments, []),
    rawWorkbooks: readJson<WorkbookAssignment[]>(STORAGE_KEYS.workbookAssignments, []),
    orderMemos: readJson<OrderMemo[]>(STORAGE_KEYS.orderMemos, []),
    studentSeries: readJson<StudentSeries[]>(STORAGE_KEYS.studentSeries, []),
  });

  const payload: StoredAppData = {
    data,
    updatedAt: needsMigration ? new Date().toISOString() : readBackupTimestamp(),
  };

  return payload;
}

function loadFromBackupSnapshot(): StoredAppData | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAppData;
  } catch {
    return null;
  }
}

function readBackupTimestamp(): string {
  const backup = loadFromBackupSnapshot();
  return backup?.updatedAt ?? new Date(0).toISOString();
}

export function createStoredPayload(data: AppData): StoredAppData {
  return {
    data,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadStoredAppData(): Promise<StoredAppData> {
  const indexed = await readIndexedDb();
  const backup = typeof window !== "undefined" ? loadFromBackupSnapshot() : null;
  const legacy = typeof window !== "undefined" ? loadFromLegacyLocalStorage() : null;

  const candidates = [indexed, backup, legacy].filter(Boolean) as StoredAppData[];
  if (candidates.length === 0) {
    const initial = createStoredPayload(
      buildAppDataFromParts({
        rawMaterials: [],
        students: [],
        rawDistributions: [],
        rawPayments: [],
        rawWorkbooks: [],
        orderMemos: [],
        studentSeries: [],
      }).data,
    );
    await saveStoredAppData(initial);
    return initial;
  }

  const newest = candidates.reduce((best, current) =>
    new Date(current.updatedAt) > new Date(best.updatedAt) ? current : best,
  );

  await saveStoredAppData(newest);
  return newest;
}

export async function saveStoredAppData(payload: StoredAppData): Promise<void> {
  await writeIndexedDb(payload);
  writeLegacyLocalStorage(payload.data);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(payload));
  }
}

function writeLegacyLocalStorage(data: AppData): void {
  writeJson(STORAGE_KEYS.students, data.students);
  writeJson(STORAGE_KEYS.materials, data.materials);
  writeJson(STORAGE_KEYS.distributions, data.distributions);
  writeJson(STORAGE_KEYS.payments, data.payments);
  writeJson(STORAGE_KEYS.orderMemos, data.orderMemos);
  writeJson(STORAGE_KEYS.workbookAssignments, data.workbookAssignments);
  writeJson(STORAGE_KEYS.studentSeries, data.studentSeries);
}

/** @deprecated use loadStoredAppData */
export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return buildAppDataFromParts({
      rawMaterials: [],
      students: [],
      rawDistributions: [],
      rawPayments: [],
      rawWorkbooks: [],
      orderMemos: [],
      studentSeries: [],
    }).data;
  }
  return loadFromLegacyLocalStorage().data;
}

export async function saveAppData(data: AppData): Promise<StoredAppData> {
  const payload = createStoredPayload(data);
  await saveStoredAppData(payload);
  return payload;
}

export function importRosterStudents(): Student[] {
  const students = createInitialStudents();
  return students;
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
