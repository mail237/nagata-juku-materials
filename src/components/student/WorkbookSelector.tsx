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
  onDistribute: (materialId: string) => void;
};

export function WorkbookSelector({
  materials,
  grade,
  series,
  assignedMaterialIds,
  onAssign,
  onUnassign,
  onDistribute,
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

  const resolveSelectedId = (): string => {
    if (isForesta) return availableMaterials[0]?.id ?? "";
    return currentSelection;
  };

  const handleDistribute = () => {
    const materialId = resolveSelectedId();
    if (!materialId) return;
    onDistribute(materialId);
    if (!assignedMaterialIds.includes(materialId)) {
      onAssign(materialId);
    }
  };

  const handleAssign = () => {
    const materialId = resolveSelectedId();
    if (!materialId) return;
    onAssign(materialId);
    setSelectedMaterialId("");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">ワークを選択</h2>
        <p className="mt-1 text-xs text-slate-500">
          ワークを選んで「配布する」または「支払いに追加」
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            disabled={!resolveSelectedId()}
            onClick={handleDistribute}
          >
            配布する
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={!resolveSelectedId()}
            onClick={handleAssign}
          >
            支払いに追加
          </Button>
        </div>

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
