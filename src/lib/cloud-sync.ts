import type { StoredAppData } from "./storage-types";

function getSyncKey(): string {
  return process.env.NEXT_PUBLIC_DATA_SYNC_KEY?.trim() ?? "";
}

export type SyncStatus = "idle" | "syncing" | "synced" | "pending" | "offline" | "error";

export function mergeStored(
  local: StoredAppData,
  remote: StoredAppData,
): StoredAppData {
  return new Date(remote.updatedAt) > new Date(local.updatedAt) ? remote : local;
}

export async function fetchCloudData(): Promise<StoredAppData | null> {
  const syncKey = getSyncKey();
  if (!syncKey) return null;

  try {
    const res = await fetch("/api/data", {
      method: "GET",
      headers: { "x-sync-key": syncKey },
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as StoredAppData;
  } catch {
    return null;
  }
}

export async function pushCloudData(payload: StoredAppData): Promise<boolean> {
  const syncKey = getSyncKey();
  if (!syncKey) return false;

  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-key": syncKey,
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: StoredAppData | null = null;

export function scheduleCloudSync(
  payload: StoredAppData,
  onStatus?: (status: SyncStatus) => void,
): void {
  pendingPayload = payload;
  onStatus?.("pending");

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(async () => {
    const toSync = pendingPayload;
    if (!toSync) return;

    onStatus?.("syncing");
    const ok = await pushCloudData(toSync);
    if (ok) {
      pendingPayload = null;
      onStatus?.("synced");
    } else if (!getSyncKey()) {
      onStatus?.("offline");
    } else {
      onStatus?.("error");
    }
  }, 800);
}
