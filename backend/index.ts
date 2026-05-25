import { Elysia, t } from "elysia";
import { Task } from "../shared/types/task";
import { Employee } from "../shared/types/worker";

const tasks: Task[] = [
  {
    id: 1,
    name: "Кладка перегородок",
    unit: "24 m^3",
    responsible: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Монтаж опалубки",
    unit: "20 m^3",
    createdAt: new Date().toISOString(),
  },
];

const workers: Employee[] = [
  { id: 1, name: "Хамза", type: "worker" },
  { id: 2, name: "John", type: "worker" },
  { id: 3, name: "Jane", type: "manager" },
];

export const app = new Elysia({ prefix: "/api" })
  .get("/tasks", () => tasks)
  .get("/workers", () => workers)
  .post(
    "/tasks",
    ({ body }) => {
      const task: Task = {
        id: tasks.length + 1,
        ...body,
        createdAt: new Date().toISOString(),
      };
      tasks.push(task);
      return task;
    },
    {
      body: t.Object({
        name: t.String(),
        unit: t.String(),
        responsible: t.Optional(t.Number()),
      }),
    },
  );

export type App = typeof app;
