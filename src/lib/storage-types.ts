import type { AppData } from "./types";

export type StoredAppData = {
  data: AppData;
  updatedAt: string;
};

export const DB_NAME = "nagata-materials-db";
export const DB_VERSION = 1;
export const STORE_NAME = "app";
export const STORE_KEY = "main";
export const LOCAL_BACKUP_KEY = "nagata_full_backup";
