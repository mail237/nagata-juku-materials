import Link from "next/link";
import { studentPath } from "@/lib/routes";
import type { Student } from "@/lib/types";

type StudentCardProps = {
  student: Student;
};

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link
      href={studentPath(student.id)}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40 active:bg-blue-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">{student.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">{student.grade}</p>
        </div>
        <span className="text-lg text-blue-600">›</span>
      </div>
    </Link>
  );
}
