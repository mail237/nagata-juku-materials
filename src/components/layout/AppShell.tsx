"use client";

import { SyncStatusBar } from "@/components/layout/SyncStatusBar";
import { useAppData } from "@/hooks/useAppData";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { syncStatus } = useAppData();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex-1">{children}</div>
      <SyncStatusBar status={syncStatus} />
    </div>
  );
}
