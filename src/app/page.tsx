import { Task } from "../../shared/types/task";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUnit } from "../../shared/utils";
import { Employee } from "../../shared/types/worker";

export default function Home() {
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
      // responsible: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  const workers: Employee[] = [
    {
      id: 1,
      name: "Хамза",
      type: "worker",
    },
  ];

  const workerMap = new Map(workers.map((w) => [w.id, w]));

  return (
    <div className="flex justify-center">
      <div className="min-w-240 m-8">
        <Table className="text-center">
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Объём</TableHead>
              <TableHead>Назначен</TableHead>
              <TableHead>Создано</TableHead>
              <TableHead>Завершен</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{formatUnit(t.unit)}</TableCell>
                <TableCell>
                  {t.responsible
                    ? (workerMap.get(t.responsible)?.name ?? "-")
                    : "-"}
                </TableCell>
                <TableCell>
                  {new Date(t.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>{t.finishedAt ? t.finishedAt : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
