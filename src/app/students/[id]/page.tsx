"use client";

import { use, useMemo } from "react";
import { DistributionTable } from "@/components/student/DistributionTable";
import { PaymentTable } from "@/components/student/PaymentTable";
import { SeriesSelector } from "@/components/student/SeriesSelector";
import { WorkbookSelector } from "@/components/student/WorkbookSelector";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppData } from "@/hooks/useAppData";
import { filterMaterialsForStudent, sortMaterialsByLevel } from "@/lib/materials";
import { decodeRouteParam } from "@/lib/routes";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const studentId = decodeRouteParam(rawId);
  const {
    data,
    ready,
    getDistribution,
    markDistributed,
    clearDistribution,
    getPayment,
    updatePayment,
    getAssignedMaterialIds,
    assignWorkbook,
    unassignWorkbook,
    getStudentSeries,
    setStudentSeries,
  } = useAppData();

  const student = data?.students.find((s) => s.id === studentId);
  const series = getStudentSeries(studentId);

  const materials = useMemo(() => {
    if (!data) return [];
    return sortMaterialsByLevel(data.materials);
  }, [data]);

  const seriesMaterials = useMemo(() => {
    if (!student) return [];
    return sortMaterialsByLevel(
      filterMaterialsForStudent(materials, series, student.grade),
    );
  }, [materials, series, student]);

  const assignedMaterialIds = getAssignedMaterialIds(studentId);

  const distributionMaterials = useMemo(() => {
    const idSet = new Set(assignedMaterialIds);
    return seriesMaterials.filter((m) => idSet.has(m.id));
  }, [seriesMaterials, assignedMaterialIds]);

  const paymentMaterials = useMemo(() => {
    const idSet = new Set(assignedMaterialIds);
    return seriesMaterials.filter((m) => idSet.has(m.id));
  }, [seriesMaterials, assignedMaterialIds]);

  if (!ready) {
    return (
      <>
        <Header title="読み込み中…" backHref="/" />
        <PageContainer>
          <p className="py-8 text-center text-sm text-slate-500">読み込み中…</p>
        </PageContainer>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Header title="生徒が見つかりません" backHref="/" />
        <PageContainer>
          <p className="py-8 text-center text-sm text-slate-500">
            指定された生徒は存在しません。
          </p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Header title={`${student.name}（${student.grade}）`} backHref="/" />
      <PageContainer>
        <div className="space-y-5">
          <SeriesSelector
            selected={series}
            onChange={(next) => setStudentSeries(studentId, next)}
          />

          <WorkbookSelector
            materials={materials}
            grade={student.grade}
            series={series}
            assignedMaterialIds={assignedMaterialIds}
            onAssign={(materialId) => assignWorkbook(studentId, materialId)}
            onUnassign={(materialId) => unassignWorkbook(studentId, materialId)}
            onDistribute={(materialId) => markDistributed(studentId, materialId)}
          />

          <DistributionTable
            materials={distributionMaterials}
            getDistributedAt={(materialId) =>
              getDistribution(studentId, materialId)?.distributedAt ?? null
            }
            onMarkDistributed={(materialId) => markDistributed(studentId, materialId)}
            onClearDistribution={(materialId) => clearDistribution(studentId, materialId)}
          />

          <PaymentTable
            materials={paymentMaterials}
            getPayment={(materialId) => {
              const payment = getPayment(studentId, materialId);
              const material = materials.find((m) => m.id === materialId);
              return {
                amount: payment?.amount ?? material?.price ?? 0,
                billed: payment?.billed ?? false,
                received: payment?.received ?? false,
              };
            }}
            onUpdatePayment={(materialId, updates) =>
              updatePayment(studentId, materialId, updates)
            }
          />
        </div>
      </PageContainer>
    </>
  );
}
