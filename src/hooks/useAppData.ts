"use client";

import { useCallback, useEffect, useState } from "react";
import { loadAppData, saveAppData, createId, todayIsoDate, importRosterStudents } from "@/lib/storage";
import type {
  AppData,
  Distribution,
  Material,
  Payment,
  Student,
} from "@/lib/types";

function distributionKey(studentId: string, materialId: string): string {
  return `${studentId}:${materialId}`;
}

function paymentKey(studentId: string, materialId: string): string {
  return `${studentId}:${materialId}`;
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadAppData());
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveAppData(next);
  }, []);

  const addStudent = useCallback(
    (name: string, grade: string) => {
      if (!data) return;
      const student: Student = { id: createId(), name: name.trim(), grade };
      persist({ ...data, students: [...data.students, student] });
    },
    [data, persist],
  );

  const updateStudent = useCallback(
    (id: string, name: string, grade: string) => {
      if (!data) return;
      persist({
        ...data,
        students: data.students.map((s) =>
          s.id === id ? { ...s, name: name.trim(), grade } : s,
        ),
      });
    },
    [data, persist],
  );

  const deleteStudent = useCallback(
    (id: string) => {
      if (!data) return;
      persist({
        ...data,
        students: data.students.filter((s) => s.id !== id),
        distributions: data.distributions.filter((d) => d.studentId !== id),
        payments: data.payments.filter((p) => p.studentId !== id),
      });
    },
    [data, persist],
  );

  const addMaterial = useCallback(
    (name: string, price: number) => {
      if (!data) return;
      const material: Material = {
        id: createId(),
        name: name.trim(),
        price,
      };
      persist({ ...data, materials: [...data.materials, material] });
    },
    [data, persist],
  );

  const updateMaterial = useCallback(
    (id: string, name: string, price: number) => {
      if (!data) return;
      persist({
        ...data,
        materials: data.materials.map((m) =>
          m.id === id ? { ...m, name: name.trim(), price } : m,
        ),
      });
    },
    [data, persist],
  );

  const deleteMaterial = useCallback(
    (id: string) => {
      if (!data) return;
      persist({
        ...data,
        materials: data.materials.filter((m) => m.id !== id),
        distributions: data.distributions.filter((d) => d.materialId !== id),
        payments: data.payments.filter((p) => p.materialId !== id),
      });
    },
    [data, persist],
  );

  const getDistribution = useCallback(
    (studentId: string, materialId: string): Distribution | undefined => {
      return data?.distributions.find(
        (d) =>
          distributionKey(d.studentId, d.materialId) ===
          distributionKey(studentId, materialId),
      );
    },
    [data],
  );

  const setDistribution = useCallback(
    (studentId: string, materialId: string, distributedAt: string | null) => {
      if (!data) return;
      const key = distributionKey(studentId, materialId);
      const existing = data.distributions.find(
        (d) => distributionKey(d.studentId, d.materialId) === key,
      );

      let distributions: Distribution[];
      if (existing) {
        distributions = data.distributions.map((d) =>
          distributionKey(d.studentId, d.materialId) === key
            ? { ...d, distributedAt }
            : d,
        );
      } else {
        distributions = [
          ...data.distributions,
          { studentId, materialId, distributedAt },
        ];
      }

      persist({ ...data, distributions });
    },
    [data, persist],
  );

  const markDistributed = useCallback(
    (studentId: string, materialId: string) => {
      setDistribution(studentId, materialId, todayIsoDate());
    },
    [setDistribution],
  );

  const clearDistribution = useCallback(
    (studentId: string, materialId: string) => {
      setDistribution(studentId, materialId, null);
    },
    [setDistribution],
  );

  const getPayment = useCallback(
    (studentId: string, materialId: string): Payment | undefined => {
      return data?.payments.find(
        (p) =>
          paymentKey(p.studentId, p.materialId) ===
          paymentKey(studentId, materialId),
      );
    },
    [data],
  );

  const updatePayment = useCallback(
    (
      studentId: string,
      materialId: string,
      updates: Partial<Pick<Payment, "amount" | "billed" | "received">>,
    ) => {
      if (!data) return;
      const key = paymentKey(studentId, materialId);
      const material = data.materials.find((m) => m.id === materialId);
      const existing = data.payments.find(
        (p) => paymentKey(p.studentId, p.materialId) === key,
      );

      const base: Payment = existing ?? {
        studentId,
        materialId,
        amount: material?.price ?? 0,
        billed: false,
        received: false,
      };

      const updated: Payment = { ...base, ...updates };
      let payments: Payment[];

      if (existing) {
        payments = data.payments.map((p) =>
          paymentKey(p.studentId, p.materialId) === key ? updated : p,
        );
      } else {
        payments = [...data.payments, updated];
      }

      persist({ ...data, payments });
    },
    [data, persist],
  );

  const exportJson = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nagata-materials-${todayIsoDate()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importRoster = useCallback(() => {
    if (!data) return;
    const students = importRosterStudents();
    const studentIds = new Set(students.map((s) => s.id));
    persist({
      ...data,
      students,
      distributions: data.distributions.filter((d) => studentIds.has(d.studentId)),
      payments: data.payments.filter((p) => studentIds.has(p.studentId)),
    });
  }, [data, persist]);

  return {
    data,
    ready: data !== null,
    addStudent,
    updateStudent,
    deleteStudent,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getDistribution,
    markDistributed,
    clearDistribution,
    getPayment,
    updatePayment,
    exportJson,
    importRoster,
  };
}
