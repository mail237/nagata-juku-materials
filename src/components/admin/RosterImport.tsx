"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ROSTER_STUDENT_COUNT } from "@/lib/initial-students";

type RosterImportProps = {
  studentCount: number;
  onImport: () => void;
};

export function RosterImport({ studentCount, onImport }: RosterImportProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">名簿データ</h2>
        <p className="mt-2 text-sm text-slate-600">
          個別授業名簿（{ROSTER_STUDENT_COUNT}名・プログラミングのみ除く）を投入します。既存の生徒一覧は上書きされますが、同名IDの配布・支払い記録は残ります。
        </p>
        <p className="mt-1 text-xs text-slate-500">
          現在の登録数: {studentCount}名
        </p>
        <Button className="mt-4 w-full" variant="secondary" onClick={() => setOpen(true)}>
          名簿を再投入（{ROSTER_STUDENT_COUNT}名）
        </Button>
      </section>

      <ConfirmDialog
        open={open}
        title="名簿を投入"
        message={`生徒一覧を名簿データ（${ROSTER_STUDENT_COUNT}名）で上書きします。よろしいですか？`}
        confirmLabel="投入する"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          onImport();
          setOpen(false);
        }}
      />
    </>
  );
}
