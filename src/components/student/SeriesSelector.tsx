"use client";

import type { WorkbookSeries } from "@/lib/materials";

type SeriesSelectorProps = {
  selected: WorkbookSeries;
  onChange: (series: WorkbookSeries) => void;
};

export function SeriesSelector({ selected, onChange }: SeriesSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">教材名</h2>
        <p className="mt-1 text-xs text-slate-500">使用する教材シリーズを選んでください</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        {(["あいきゃん", "フォレスタ"] as const).map((series) => (
          <button
            key={series}
            type="button"
            onClick={() => onChange(series)}
            className={`min-h-12 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              selected === series
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {series}
          </button>
        ))}
      </div>
    </section>
  );
}
