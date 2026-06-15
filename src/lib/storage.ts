import { STORAGE_KEYS } from "./constants";
import { createInitialMaterials } from "./initial-data";
import type {
  AppData,
  Distribution,
  Material,
  Payment,
  Student,
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
  const materials = readJson<Material[]>(STORAGE_KEYS.materials, []);

  if (materials.length === 0) {
    const initialMaterials = createInitialMaterials();
    writeJson(STORAGE_KEYS.materials, initialMaterials);
    return {
      students: readJson<Student[]>(STORAGE_KEYS.students, []),
      materials: initialMaterials,
      distributions: readJson<Distribution[]>(STORAGE_KEYS.distributions, []),
      payments: readJson<Payment[]>(STORAGE_KEYS.payments, []),
    };
  }

  return {
    students: readJson<Student[]>(STORAGE_KEYS.students, []),
    materials,
    distributions: readJson<Distribution[]>(STORAGE_KEYS.distributions, []),
    payments: readJson<Payment[]>(STORAGE_KEYS.payments, []),
  };
}

export function saveAppData(data: AppData): void {
  writeJson(STORAGE_KEYS.students, data.students);
  writeJson(STORAGE_KEYS.materials, data.materials);
  writeJson(STORAGE_KEYS.distributions, data.distributions);
  writeJson(STORAGE_KEYS.payments, data.payments);
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
