"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchCloudData,
  mergeStored,
  scheduleCloudSync,
  type SyncStatus,
} from "@/lib/cloud-sync";
import {
  createId,
  importRosterStudents,
  loadStoredAppData,
  saveAppData,
  todayIsoDate,
} from "@/lib/storage";
import type { WorkbookSeries } from "@/lib/materials";
import type {
  AppData,
  Distribution,
  Material,
  OrderMemo,
  Payment,
  Student,
} from "@/lib/types";

type AppDataContextValue = {
  data: AppData | null;
  ready: boolean;
  syncStatus: SyncStatus;
  addStudent: (name: string, grade: string) => void;
  updateStudent: (id: string, name: string, grade: string) => void;
  deleteStudent: (id: string) => void;
  addMaterial: (name: string, price: number) => void;
  updateMaterial: (id: string, name: string, price: number) => void;
  deleteMaterial: (id: string) => void;
  getDistribution: (studentId: string, materialId: string) => Distribution | undefined;
  markDistributed: (studentId: string, materialId: string) => void;
  clearDistribution: (studentId: string, materialId: string) => void;
  getPayment: (studentId: string, materialId: string) => Payment | undefined;
  updatePayment: (
    studentId: string,
    materialId: string,
    updates: Partial<Pick<Payment, "amount" | "billed" | "received">>,
  ) => void;
  exportJson: () => void;
  importRoster: () => void;
  addOrderMemo: (grade: string, materialName: string, memo: string) => void;
  updateOrderMemo: (id: string, grade: string, materialName: string, memo: string) => void;
  deleteOrderMemo: (id: string) => void;
  getAssignedMaterialIds: (studentId: string) => string[];
  assignWorkbook: (studentId: string, materialId: string) => void;
  unassignWorkbook: (studentId: string, materialId: string) => void;
  getStudentSeries: (studentId: string) => WorkbookSeries;
  setStudentSeries: (studentId: string, series: WorkbookSeries) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function distributionKey(studentId: string, materialId: string): string {
  return `${studentId}:${materialId}`;
}

function paymentKey(studentId: string, materialId: string): string {
  return `${studentId}:${materialId}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const dataRef = useRef<AppData | null>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setSyncStatus("syncing");
      try {
        const local = await loadStoredAppData();
        const remote = await fetchCloudData();
        const merged = remote ? mergeStored(local, remote) : local;

        if (!cancelled) {
          await saveAppData(merged.data);
          setData(merged.data);
        }

        if (!cancelled) {
          const usedRemote =
            remote !== null &&
            new Date(merged.updatedAt).getTime() === new Date(remote.updatedAt).getTime() &&
            new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime();

          if (usedRemote) {
            setSyncStatus("synced");
          } else {
            scheduleCloudSync(merged, setSyncStatus);
          }
        }
      } catch {
        if (!cancelled) {
          const fallback = await loadStoredAppData();
          setData(fallback.data);
          setSyncStatus("offline");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleOnline() {
      const current = dataRef.current;
      if (!current) return;
      void saveAppData(current).then((payload) => scheduleCloudSync(payload, setSyncStatus));
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    void (async () => {
      const payload = await saveAppData(next);
      scheduleCloudSync(payload, setSyncStatus);
    })();
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
        workbookAssignments: data.workbookAssignments.filter((a) => a.studentId !== id),
        studentSeries: data.studentSeries.filter((s) => s.studentId !== id),
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
        workbookAssignments: data.workbookAssignments.filter((a) => a.materialId !== id),
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
      workbookAssignments: data.workbookAssignments.filter((a) =>
        studentIds.has(a.studentId),
      ),
    });
  }, [data, persist]);

  const addOrderMemo = useCallback(
    (grade: string, materialName: string, memo: string) => {
      if (!data) return;
      const item: OrderMemo = {
        id: createId(),
        grade,
        materialName: materialName.trim(),
        memo: memo.trim(),
      };
      persist({ ...data, orderMemos: [...data.orderMemos, item] });
    },
    [data, persist],
  );

  const updateOrderMemo = useCallback(
    (id: string, grade: string, materialName: string, memo: string) => {
      if (!data) return;
      persist({
        ...data,
        orderMemos: data.orderMemos.map((m) =>
          m.id === id
            ? { ...m, grade, materialName: materialName.trim(), memo: memo.trim() }
            : m,
        ),
      });
    },
    [data, persist],
  );

  const deleteOrderMemo = useCallback(
    (id: string) => {
      if (!data) return;
      persist({
        ...data,
        orderMemos: data.orderMemos.filter((m) => m.id !== id),
      });
    },
    [data, persist],
  );

  const getAssignedMaterialIds = useCallback(
    (studentId: string): string[] => {
      if (!data) return [];
      return data.workbookAssignments
        .filter((a) => a.studentId === studentId)
        .map((a) => a.materialId);
    },
    [data],
  );

  const assignWorkbook = useCallback(
    (studentId: string, materialId: string) => {
      if (!data) return;
      const exists = data.workbookAssignments.some(
        (a) => a.studentId === studentId && a.materialId === materialId,
      );
      if (exists) return;
      persist({
        ...data,
        workbookAssignments: [...data.workbookAssignments, { studentId, materialId }],
      });
    },
    [data, persist],
  );

  const unassignWorkbook = useCallback(
    (studentId: string, materialId: string) => {
      if (!data) return;
      persist({
        ...data,
        workbookAssignments: data.workbookAssignments.filter(
          (a) => !(a.studentId === studentId && a.materialId === materialId),
        ),
      });
    },
    [data, persist],
  );

  const getStudentSeries = useCallback(
    (studentId: string): WorkbookSeries => {
      if (!data) return "あいきゃん";
      return (
        data.studentSeries.find((s) => s.studentId === studentId)?.series ?? "あいきゃん"
      );
    },
    [data],
  );

  const setStudentSeries = useCallback(
    (studentId: string, series: WorkbookSeries) => {
      if (!data) return;
      const existing = data.studentSeries.find((s) => s.studentId === studentId);
      let studentSeries = data.studentSeries;
      if (existing) {
        studentSeries = data.studentSeries.map((s) =>
          s.studentId === studentId ? { ...s, series } : s,
        );
      } else {
        studentSeries = [...data.studentSeries, { studentId, series }];
      }
      persist({ ...data, studentSeries });
    },
    [data, persist],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      ready: data !== null,
      syncStatus,
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
      addOrderMemo,
      updateOrderMemo,
      deleteOrderMemo,
      getAssignedMaterialIds,
      assignWorkbook,
      unassignWorkbook,
      getStudentSeries,
      setStudentSeries,
    }),
    [
      data,
      syncStatus,
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
      addOrderMemo,
      updateOrderMemo,
      deleteOrderMemo,
      getAssignedMaterialIds,
      assignWorkbook,
      unassignWorkbook,
      getStudentSeries,
      setStudentSeries,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
