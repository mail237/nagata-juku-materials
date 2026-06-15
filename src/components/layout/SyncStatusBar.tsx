"use client";

import type { SyncStatus } from "@/lib/cloud-sync";

const LABELS: Record<SyncStatus, string> = {
  idle: "",
  syncing: "クラウド保存中…",
  synced: "クラウド保存済み",
  pending: "同期待ち…",
  offline: "端末内のみ保存",
  error: "クラウド同期エラー（端末内は保存済み）",
};

const STYLES: Record<SyncStatus, string> = {
  idle: "",
  syncing: "text-blue-600",
  synced: "text-emerald-600",
  pending: "text-slate-500",
  offline: "text-amber-700",
  error: "text-red-600",
};

type SyncStatusBarProps = {
  status: SyncStatus;
};

export function SyncStatusBar({ status }: SyncStatusBarProps) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <div
      className={`border-t border-slate-100 bg-white/95 px-4 py-2 text-center text-xs ${STYLES[status]}`}
    >
      {label}
    </div>
  );
}
