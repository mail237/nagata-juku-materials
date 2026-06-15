"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { GRADES } from "@/lib/constants";
import type { OrderMemo } from "@/lib/types";

type OrderMemoManagerProps = {
  memos: OrderMemo[];
  onAdd: (grade: string, materialName: string, memo: string) => void;
  onUpdate: (id: string, grade: string, materialName: string, memo: string) => void;
  onDelete: (id: string) => void;
};

export function OrderMemoManager({
  memos,
  onAdd,
  onUpdate,
  onDelete,
}: OrderMemoManagerProps) {
  const [grade, setGrade] = useState<string>(GRADES[0]);
  const [materialName, setMaterialName] = useState("");
  const [memo, setMemo] = useState("");
  const [filterGrade, setFilterGrade] = useState<string>("すべて");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGrade, setEditGrade] = useState<string>(GRADES[0]);
  const [editMaterialName, setEditMaterialName] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = [...memos].sort(
      (a, b) =>
        a.grade.localeCompare(b.grade, "ja") ||
        a.materialName.localeCompare(b.materialName, "ja"),
    );
    if (filterGrade === "すべて") return list;
    return list.filter((m) => m.grade === filterGrade);
  }, [memos, filterGrade]);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">発注メモを追加</h2>
          <p className="mt-1 text-xs text-slate-500">
            学年・教材名・メモを記録（生徒名は不要）
          </p>
        </div>

        <div className="space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">学年</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="教材名"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            placeholder="例: あいきゃん 国語 15級"
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">メモ</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="発注数・備考など"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <Button
            className="w-full"
            disabled={!materialName.trim()}
            onClick={() => {
              onAdd(grade, materialName, memo);
              setMaterialName("");
              setMemo("");
            }}
          >
            追加
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              発注メモ一覧（{filtered.length}件）
            </h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterGrade("すべて")}
              className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium ${
                filterGrade === "すべて"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              すべて
            </button>
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGrade(g)}
                className={`min-h-9 rounded-full px-3 py-1.5 text-xs font-medium ${
                  filterGrade === g
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              発注メモがありません
            </p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="space-y-3 px-4 py-3">
                {editingId === item.id ? (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        学年
                      </span>
                      <select
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input
                      label="教材名"
                      value={editMaterialName}
                      onChange={(e) => setEditMaterialName(e.target.value)}
                    />
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700">
                        メモ
                      </span>
                      <textarea
                        value={editMemo}
                        onChange={(e) => setEditMemo(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={!editMaterialName.trim()}
                        onClick={() => {
                          onUpdate(item.id, editGrade, editMaterialName, editMemo);
                          setEditingId(null);
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setEditingId(null)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {item.grade}
                        </span>
                        <p className="text-sm font-medium text-slate-900">
                          {item.materialName}
                        </p>
                      </div>
                      {item.memo.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                          {item.memo}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">（メモなし）</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditGrade(item.grade);
                          setEditMaterialName(item.materialName);
                          setEditMemo(item.memo);
                        }}
                      >
                        編集
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={() => setPendingDeleteId(item.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="発注メモを削除"
        message="このメモを削除しますか？"
        confirmLabel="削除する"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            onDelete(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />
    </>
  );
}
