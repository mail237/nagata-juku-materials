"use client";

import { use, useMemo } from "react";
import { DistributionTable } from "@/components/student/DistributionTable";
import { PaymentTable } from "@/components/student/PaymentTable";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppData } from "@/hooks/useAppData";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function StudentPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    data,
    ready,
    getDistribution,
    markDistributed,
    clearDistribution,
    getPayment,
    updatePayment,
  } = useAppData();

  const student = data?.students.find((s) => s.id === id);
  const materials = useMemo(() => {
    if (!data) return [];
    return [...data.materials].sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }, [data]);

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
          <DistributionTable
            materials={materials}
            getDistributedAt={(materialId) =>
              getDistribution(id, materialId)?.distributedAt ?? null
            }
            onMarkDistributed={(materialId) => markDistributed(id, materialId)}
            onClearDistribution={(materialId) => clearDistribution(id, materialId)}
          />

          <PaymentTable
            materials={materials}
            getPayment={(materialId) => {
              const payment = getPayment(id, materialId);
              const material = materials.find((m) => m.id === materialId);
              return {
                amount: payment?.amount ?? material?.price ?? 0,
                billed: payment?.billed ?? false,
                received: payment?.received ?? false,
              };
            }}
            onUpdatePayment={(materialId, updates) =>
              updatePayment(id, materialId, updates)
            }
          />
        </div>
      </PageContainer>
    </>
  );
}
