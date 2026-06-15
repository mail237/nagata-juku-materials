export type Student = {
  id: string;
  name: string;
  grade: string;
};

export type Material = {
  id: string;
  name: string;
  price: number;
};

export type Distribution = {
  studentId: string;
  materialId: string;
  distributedAt: string | null;
};

export type Payment = {
  studentId: string;
  materialId: string;
  amount: number;
  billed: boolean;
  received: boolean;
};

export type AppData = {
  students: Student[];
  materials: Material[];
  distributions: Distribution[];
  payments: Payment[];
};
