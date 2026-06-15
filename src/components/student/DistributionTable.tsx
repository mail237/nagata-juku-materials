"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/storage";
import type { Material } from "@/lib/types";

type DistributionTableProps = {
  materials: Material[];
  getDistributedAt: (materialId: string) => string | null;
  onMarkDistributed: (materialId: string) => void;
  onClearDistribution: (materialId: string) => void;
};

export function DistributionTable({
  materials,
  getDistributedAt,
  onMarkDistributed,
  onClearDistribution,
}: DistributionTableProps) {
  const [pendingClearId, setPendingClearId] = useState<string | null>(null);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">教材配布</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {materials.map((material) => {
            const distributedAt = getDistributedAt(material.id);
            const checked = Boolean(distributedAt);

            return (
              <div
                key={material.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
              >
                <p className="text-sm text-slate-800">{material.name}</p>
                <span className="min-w-20 text-right text-sm text-slate-500">
                  {formatDate(distributedAt)}
                </span>
                <Checkbox
                  checked={checked}
                  onChange={(next) => {
                    if (next) {
                      onMarkDistributed(material.id);
                    } else {
                      setPendingClearId(material.id);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={pendingClearId !== null}
        title="配布記録をクリア"
        message="配布日を削除しますか？"
        confirmLabel="削除する"
        onCancel={() => setPendingClearId(null)}
        onConfirm={() => {
          if (pendingClearId) {
            onClearDistribution(pendingClearId);
          }
          setPendingClearId(null);
        }}
      />
    </>
  );
}
