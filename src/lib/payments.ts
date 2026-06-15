import type { AppData, Student } from "./types";

/** ワークが割り当て済みで、請求済みでないものがある生徒 */
export function isStudentUnbilled(data: AppData, studentId: string): boolean {
  const assignments = data.workbookAssignments.filter((a) => a.studentId === studentId);
  if (assignments.length === 0) return false;

  return assignments.some((assignment) => {
    const payment = data.payments.find(
      (p) => p.studentId === studentId && p.materialId === assignment.materialId,
    );
    return !payment || !payment.billed;
  });
}

export function getUnbilledCount(data: AppData, studentId: string): number {
  return data.workbookAssignments.filter((a) => a.studentId === studentId).filter((assignment) => {
    const payment = data.payments.find(
      (p) => p.studentId === studentId && p.materialId === assignment.materialId,
    );
    return !payment || !payment.billed;
  }).length;
}

export function getUnbilledStudents(data: AppData): Student[] {
  return data.students
    .filter((s) => isStudentUnbilled(data, s.id))
    .sort(
      (a, b) =>
        a.grade.localeCompare(b.grade, "ja") || a.name.localeCompare(b.name, "ja"),
    );
}
