import { z } from "zod";

export const CreateTaskSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  unit: z.string().min(1, "Объём обязателен"),
  responsible: z.number({ message: "Назначьте работника" }),
});

export type CreateTaskForm = z.infer<typeof CreateTaskSchema>;

export type Task = {
  id: number;
  name: string;
  unit: string;
  responsible?: number;
  createdAt: Date;
  finishedAt?: Date;
};
