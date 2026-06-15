"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { GRADES } from "@/lib/constants";
import type { Student } from "@/lib/types";

type StudentManagerProps = {
  students: Student[];
  onAdd: (name: string, grade: string) => void;
  onUpdate: (id: string, name: string, grade: string) => void;
  onDelete: (id: string) => void;
};

export function StudentManager({
  students,
  onAdd,
  onUpdate,
  onDelete,
}: StudentManagerProps) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string>(GRADES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState<string>(GRADES[0]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const sorted = [...students].sort((a, b) =>
    a.grade.localeCompare(b.grade, "ja") || a.name.localeCompare(b.name, "ja"),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">生徒マスタ</h2>
      </div>

      <div className="space-y-3 border-b border-slate-100 p-4">
        <Input
          label="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 山田 太郎"
        />
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
        <Button
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            onAdd(name, grade);
            setName("");
          }}
        >
          生徒を追加
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            生徒が登録されていません
          </p>
        ) : (
          sorted.map((student) => (
            <div key={student.id} className="space-y-3 px-4 py-3">
              {editingId === student.id ? (
                <>
                  <Input
                    label="名前"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
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
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={!editName.trim()}
                      onClick={() => {
                        onUpdate(student.id, editName, editGrade);
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
                    <p className="text-sm font-medium text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.grade}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setEditingId(student.id);
                        setEditName(student.name);
                        setEditGrade(student.grade);
                      }}
                    >
                      編集
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => setPendingDeleteId(student.id)}
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="生徒を削除"
        message="この生徒と関連する配布・支払い記録も削除されます。よろしいですか？"
        confirmLabel="削除する"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) {
            onDelete(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
      />
    </section>
  );
}
