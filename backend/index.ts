import { Elysia, status, t } from "elysia";
import { Task } from "../shared/types/task";
import { Employee } from "../shared/types/worker";

const tasks: Task[] = [
  {
    id: 1,
    name: "Кладка перегородок",
    unit: "24 m^3",
    responsible: 1,
    createdAt: new Date("2024-01-15"),
    finishedAt: new Date("2024-02-01"),
  },
  {
    id: 2,
    name: "Монтаж опалубки",
    unit: "20 m^3",
    responsible: 2,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: 3,
    name: "Заливка фундамента",
    unit: "50 m^3",
    responsible: 1,
    createdAt: new Date("2024-03-05"),
    finishedAt: new Date("2024-03-20"),
  },
  {
    id: 4,
    name: "Монтаж кровли",
    unit: "120 m^2",
    responsible: 3,
    createdAt: new Date("2024-04-18"),
  },
  {
    id: 5,
    name: "Штукатурка стен",
    unit: "80 m^2",
    responsible: 2,
    createdAt: new Date("2024-05-22"),
    finishedAt: new Date("2024-06-10"),
  },
  {
    id: 6,
    name: "Укладка плитки",
    unit: "35 m^2",
    createdAt: new Date("2024-06-30"),
  },
  {
    id: 7,
    name: "Установка окон",
    unit: "12 шт",
    responsible: 3,
    createdAt: new Date("2024-08-14"),
    finishedAt: new Date("2024-08-28"),
  },
  {
    id: 8,
    name: "Электромонтаж",
    unit: "200 м",
    responsible: 1,
    createdAt: new Date("2024-09-01"),
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
        createdAt: new Date(),
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
  )
  .delete("/tasks/:id", ({ params: { id } }) => {
    const taskId = Number(id);
    console.log(id);
    const exists = tasks.some((t) => t.id === taskId);
    if (!exists) return status(404, "Task not found");
    tasks.splice(
      tasks.findIndex((t) => t.id === taskId),
      1,
    );
    return { success: true };
  });

export type App = typeof app;
