"use client";

import { DataExport } from "@/components/admin/DataExport";
import { MaterialManager } from "@/components/admin/MaterialManager";
import { StudentManager } from "@/components/admin/StudentManager";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppData } from "@/hooks/useAppData";

export default function AdminPage() {
  const {
    data,
    ready,
    addStudent,
    updateStudent,
    deleteStudent,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    exportJson,
  } = useAppData();

  return (
    <>
      <Header title="管理設定" backHref="/" />
      <PageContainer>
        {!ready || !data ? (
          <p className="py-8 text-center text-sm text-slate-500">読み込み中…</p>
        ) : (
          <div className="space-y-5">
            <StudentManager
              students={data.students}
              onAdd={addStudent}
              onUpdate={updateStudent}
              onDelete={deleteStudent}
            />
            <MaterialManager
              materials={data.materials}
              onAdd={addMaterial}
              onUpdate={updateMaterial}
              onDelete={deleteMaterial}
            />
            <DataExport onExport={exportJson} />
          </div>
        )}
      </PageContainer>
    </>
  );
}
