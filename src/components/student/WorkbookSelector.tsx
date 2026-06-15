"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  filterMaterialsBySubject,
  getLevelLabel,
  sortMaterialsByLevel,
  type WorkbookSubject,
} from "@/lib/materials";
import type { Material } from "@/lib/types";

type WorkbookSelectorProps = {
  materials: Material[];
  assignedMaterialIds: string[];
  onAssign: (materialId: string) => void;
  onUnassign: (materialId: string) => void;
};

export function WorkbookSelector({
  materials,
  assignedMaterialIds,
  onAssign,
  onUnassign,
}: WorkbookSelectorProps) {
  const [subject, setSubject] = useState<WorkbookSubject>("国語");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  const subjectMaterials = useMemo(
    () => filterMaterialsBySubject(materials, subject),
    [materials, subject],
  );

  const assignedMaterials = useMemo(() => {
    const idSet = new Set(assignedMaterialIds);
    return sortMaterialsByLevel(materials.filter((m) => idSet.has(m.id)));
  }, [materials, assignedMaterialIds]);

  const availableMaterials = useMemo(
    () => subjectMaterials.filter((m) => !assignedMaterialIds.includes(m.id)),
    [subjectMaterials, assignedMaterialIds],
  );

  const handleSubjectChange = (next: WorkbookSubject) => {
    setSubject(next);
    const nextList = filterMaterialsBySubject(materials, next).filter(
      (m) => !assignedMaterialIds.includes(m.id),
    );
    setSelectedMaterialId(nextList[0]?.id ?? "");
  };

  const currentSelection =
    selectedMaterialId || availableMaterials[0]?.id || "";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">ワークを選択</h2>
        <p className="mt-1 text-xs text-slate-500">
          選んだワークの支払い状況が下に表示されます
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex gap-2">
          {(["国語", "算数"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSubjectChange(item)}
              className={`min-h-10 flex-1 rounded-full text-sm font-medium ${
                subject === item
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              あいきゃん {item}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">級</span>
          <select
            value={currentSelection}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {availableMaterials.length === 0 ? (
              <option value="">追加できるワークがありません</option>
            ) : (
              availableMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {getLevelLabel(material)}
                </option>
              ))
            )}
          </select>
        </label>

        <Button
          className="w-full"
          disabled={!currentSelection}
          onClick={() => {
            if (currentSelection) {
              onAssign(currentSelection);
              setSelectedMaterialId("");
            }
          }}
        >
          ワークを追加
        </Button>

        {assignedMaterials.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">選択中のワーク</p>
            <div className="flex flex-wrap gap-2">
              {assignedMaterials.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => onUnassign(material.id)}
                  className="inline-flex min-h-9 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800"
                >
                  <span>{material.name}</span>
                  <span className="text-blue-500">×</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
