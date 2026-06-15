"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GradeFilter } from "@/components/home/GradeFilter";
import { StudentCard } from "@/components/home/StudentCard";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { GRADES } from "@/lib/constants";
import { useAppData } from "@/hooks/useAppData";
import { getUnbilledCount, getUnbilledStudents } from "@/lib/payments";

export default function HomePage() {
  const { data, ready } = useAppData();
  const [selectedGrade, setSelectedGrade] = useState<string>(GRADES[0]);

  const unbilledStudents = useMemo(() => {
    if (!data) return [];
    return getUnbilledStudents(data);
  }, [data]);

  const students = useMemo(() => {
    if (!data) return [];
    return data.students
      .filter((s) => s.grade === selectedGrade)
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }, [data, selectedGrade]);

  return (
    <>
      <Header
        title="教材配布管理"
        action={
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/orders"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              発注
            </Link>
            <Link
              href="/admin"
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              設定
            </Link>
          </div>
        }
      />
      <PageContainer>
        {!ready || !data ? (
          <p className="py-8 text-center text-sm text-slate-500">読み込み中…</p>
        ) : (
          <div className="space-y-5">
            {unbilledStudents.length > 0 ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm">
                <div className="border-b border-amber-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-amber-900">
                    未請求（{unbilledStudents.length}名）
                  </h2>
                  <p className="mt-1 text-xs text-amber-800/80">
                    ワークを追加済みで、請求済みになっていない生徒
                  </p>
                </div>
                <div className="space-y-2 p-4">
                  {unbilledStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      unbilledCount={getUnbilledCount(data, student.id)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <p className="mb-3 text-sm font-medium text-slate-700">学年を選択</p>
              <GradeFilter selected={selectedGrade} onChange={setSelectedGrade} />
            </section>

            <section className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {selectedGrade}（{students.length}名）
              </p>
              {students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">この学年の生徒がいません</p>
                  <Link
                    href="/admin"
                    className="mt-3 inline-block text-sm font-medium text-blue-600"
                  >
                    管理画面で生徒を追加 →
                  </Link>
                </div>
              ) : (
                students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    unbilledCount={getUnbilledCount(data, student.id)}
                  />
                ))
              )}
            </section>
          </div>
        )}
      </PageContainer>
    </>
  );
}
