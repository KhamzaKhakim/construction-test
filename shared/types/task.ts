export type Task = {
  id: number;
  name: string;
  unit: string;
  responsible?: number;
  createdAt: string;
  finishedAt?: string;
};
