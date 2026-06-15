import Link from "next/link";
import { studentPath } from "@/lib/routes";
import type { Student } from "@/lib/types";

type StudentCardProps = {
  student: Student;
  unbilledCount?: number;
};

export function StudentCard({ student, unbilledCount = 0 }: StudentCardProps) {
  return (
    <Link
      href={studentPath(student.id)}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40 active:bg-blue-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-900">{student.name}</p>
            {unbilledCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                未請求{unbilledCount > 1 ? ` ${unbilledCount}件` : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{student.grade}</p>
        </div>
        <span className="text-lg text-blue-600">›</span>
      </div>
    </Link>
  );
}
