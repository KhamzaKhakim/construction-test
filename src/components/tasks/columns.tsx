"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from "../../../shared/types/worker";
import { Task } from "../../../shared/types/task";
import { formatUnit } from "../../../shared/utils";

export const createColumns = (
  workerMap: Map<number, Employee>,
  onDelete: (id: number) => void,
  onFinish: (id: number) => void,
  currentUserId: number | null,
): ColumnDef<Task>[] => [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "unit",
    header: "Объём",
    cell: ({ row }) => {
      return formatUnit(row.getValue<string>("unit"));
    },
  },
  {
    accessorKey: "responsible",
    header: "Назначен",
    cell: ({ row }) => {
      const id = row.getValue<number>("responsible");
      return id ? (workerMap.get(id)?.name ?? "-") : "-";
    },
    filterFn: "equals",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Создано
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return row.getValue<Date>("createdAt").toLocaleDateString("ru-RU");
    },
    sortingFn: "datetime",
    filterFn: (row, columnId, value) => {
      const date = row.getValue(columnId) as Date;
      const [start, end] = value;

      if ((start || end) && !date) return false;

      const startOfDay = start ? new Date(start.setHours(0, 0, 0, 0)) : null;
      const endOfDay = end ? new Date(end.setHours(23, 59, 59, 999)) : null;

      if (startOfDay && !endOfDay) {
        return date.getTime() >= startOfDay.getTime();
      } else if (!startOfDay && endOfDay) {
        return date.getTime() <= endOfDay.getTime();
      } else if (startOfDay && endOfDay) {
        return (
          date.getTime() >= startOfDay.getTime() &&
          date.getTime() <= endOfDay.getTime()
        );
      } else return true;
    },
  },
  {
    accessorKey: "finishedAt",
    header: "Завершен",
    cell: ({ row }) => {
      const value = row.getValue("finishedAt");
      return value ? (value as Date).toLocaleDateString("ru-RU") : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      const isResponsible = task.responsible === currentUserId;

      return (
        <div className="flex items-center gap-1 justify-center">
          {isResponsible && !task.finishedAt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFinish(task.id)}
              title="Завершить"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
