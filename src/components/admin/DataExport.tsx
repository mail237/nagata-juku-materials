"use client";

import { Button } from "@/components/ui/Button";

type DataExportProps = {
  onExport: () => void;
};

export function DataExport({ onExport }: DataExportProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">データエクスポート</h2>
      <p className="mt-2 text-sm text-slate-600">
        生徒・教材・配布・支払い・発注メモの全データを JSON ファイルでダウンロードします。
      </p>
      <Button className="mt-4 w-full" onClick={onExport}>
        JSON をダウンロード
      </Button>
    </section>
  );
}
