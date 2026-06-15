"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  filterMaterialsBySeriesAndSubject,
  getLevelLabel,
  getSubjectsForGrade,
  sortMaterialsByLevel,
  type WorkbookSeries,
  type WorkbookSubject,
} from "@/lib/materials";
import type { Material } from "@/lib/types";

type WorkbookSelectorProps = {
  materials: Material[];
  grade: string;
  series: WorkbookSeries;
  assignedMaterialIds: string[];
  onAssign: (materialId: string) => void;
  onUnassign: (materialId: string) => void;
};

export function WorkbookSelector({
  materials,
  grade,
  series,
  assignedMaterialIds,
  onAssign,
  onUnassign,
}: WorkbookSelectorProps) {
  const subjects = useMemo(
    () => getSubjectsForGrade(series, grade),
    [series, grade],
  );
  const [subject, setSubject] = useState<WorkbookSubject>(subjects[0] ?? "国語");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  useEffect(() => {
    setSubject(subjects[0] ?? "国語");
    setSelectedMaterialId("");
  }, [series, grade, subjects]);

  const subjectMaterials = useMemo(
    () => filterMaterialsBySeriesAndSubject(materials, series, subject),
    [materials, series, subject],
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
    const nextList = filterMaterialsBySeriesAndSubject(materials, series, next).filter(
      (m) => !assignedMaterialIds.includes(m.id),
    );
    setSelectedMaterialId(nextList[0]?.id ?? "");
  };

  const currentSelection =
    selectedMaterialId || availableMaterials[0]?.id || "";

  const isForesta = series === "フォレスタ";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">ワークを選択</h2>
        <p className="mt-1 text-xs text-slate-500">
          {series} のワークを選ぶと、支払い状況が下に表示されます
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {subjects.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSubjectChange(item)}
              className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium ${
                subject === item
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {isForesta ? (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            フォレスタ {subject}
          </p>
        ) : (
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
        )}

        <Button
          className="w-full"
          disabled={isForesta ? availableMaterials.length === 0 : !currentSelection}
          onClick={() => {
            const materialId = isForesta
              ? availableMaterials[0]?.id
              : currentSelection;
            if (materialId) {
              onAssign(materialId);
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
