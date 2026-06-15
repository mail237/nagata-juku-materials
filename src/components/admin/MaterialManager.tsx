"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import type { Material } from "@/lib/types";

type MaterialManagerProps = {
  materials: Material[];
  onAdd: (name: string, price: number) => void;
  onUpdate: (id: string, name: string, price: number) => void;
  onDelete: (id: string) => void;
};

export function MaterialManager({
  materials,
  onAdd,
  onUpdate,
  onDelete,
}: MaterialManagerProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("700");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("700");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleMaterials = expanded ? materials : materials.slice(0, 8);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">
          教材マスタ（{materials.length}件）
        </h2>
      </div>

      <div className="space-y-3 border-b border-slate-100 p-4">
        <Input
          label="教材名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 英単語帳 Vol.1"
        />
        <Input
          label="金額（円）"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            onAdd(name, Number(price) || 0);
            setName("");
            setPrice("700");
          }}
        >
          教材を追加
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleMaterials.map((material) => (
          <div key={material.id} className="space-y-3 px-4 py-3">
            {editingId === material.id ? (
              <>
                <Input
                  label="教材名"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  label="金額（円）"
                  type="number"
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!editName.trim()}
                    onClick={() => {
                      onUpdate(material.id, editName, Number(editPrice) || 0);
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
                  <p className="text-sm font-medium text-slate-900">{material.name}</p>
                  <p className="text-xs text-slate-500">¥{material.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setEditingId(material.id);
                      setEditName(material.name);
                      setEditPrice(String(material.price));
                    }}
                  >
                    編集
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => setPendingDeleteId(material.id)}
                  >
                    削除
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {materials.length > 8 ? (
        <div className="border-t border-slate-100 p-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "折りたたむ" : `すべて表示（残り${materials.length - 8}件）`}
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="教材を削除"
        message="この教材と関連する配布・支払い記録も削除されます。よろしいですか？"
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
