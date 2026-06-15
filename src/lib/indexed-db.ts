import { openDB, type IDBPDatabase } from "idb";
import {
  DB_NAME,
  DB_VERSION,
  STORE_KEY,
  STORE_NAME,
  type StoredAppData,
} from "./storage-types";

type AppDB = IDBPDatabase<{
  app: {
    key: string;
    value: StoredAppData;
  };
}>;

let dbPromise: Promise<AppDB> | null = null;

function getDb(): Promise<AppDB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function readIndexedDb(): Promise<StoredAppData | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await getDb();
    return (await db.get(STORE_NAME, STORE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function writeIndexedDb(payload: StoredAppData): Promise<void> {
  if (typeof window === "undefined") return;
  const db = await getDb();
  await db.put(STORE_NAME, payload, STORE_KEY);
}
