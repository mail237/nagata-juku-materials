"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
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
          <p className="mt-1 text-xs text-slate-500">
            選択中のワークの配布記録
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {materials.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              上でワークを選んで「配布する」を押してください
            </p>
          ) : (
            materials.map((material) => {
              const distributedAt = getDistributedAt(material.id);
              const distributed = Boolean(distributedAt);

              return (
                <div key={material.id} className="space-y-3 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{material.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        配布日: {formatDate(distributedAt)}
                      </p>
                    </div>
                  </div>
                  {distributed ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setPendingClearId(material.id)}
                    >
                      配布記録を削除
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => onMarkDistributed(material.id)}
                    >
                      配布する
                    </Button>
                  )}
                </div>
              );
            })
          )}
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
