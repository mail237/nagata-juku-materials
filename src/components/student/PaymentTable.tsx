"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import type { Material } from "@/lib/types";

type PaymentRow = {
  amount: number;
  billed: boolean;
  received: boolean;
};

type PaymentTableProps = {
  materials: Material[];
  getPayment: (materialId: string) => PaymentRow;
  onUpdatePayment: (
    materialId: string,
    updates: Partial<Pick<PaymentRow, "amount" | "billed" | "received">>,
  ) => void;
};

export function PaymentTable({
  materials,
  getPayment,
  onUpdatePayment,
}: PaymentTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">支払い状況</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {materials.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            上でワークを選ぶと、ここに支払い状況が表示されます
          </p>
        ) : (
          materials.map((material) => {
          const payment = getPayment(material.id);

          return (
            <div key={material.id} className="space-y-3 px-4 py-3">
              <p className="text-sm font-medium text-slate-800">{material.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">金額</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-500">¥</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={payment.amount}
                    onChange={(e) =>
                      onUpdatePayment(material.id, {
                        amount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Checkbox
                  label="請求済み"
                  checked={payment.billed}
                  onChange={(billed) => onUpdatePayment(material.id, { billed })}
                />
                <Checkbox
                  label="領収済み"
                  checked={payment.received}
                  onChange={(received) => onUpdatePayment(material.id, { received })}
                />
              </div>
            </div>
          );
          })
        )}
      </div>
    </section>
  );
}
