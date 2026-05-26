"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { parseAsInteger, parseAsIsoDate, useQueryState } from "nuqs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/client";
import { useEffect, useState } from "react";
import { CreateTaskForm, CreateTaskSchema } from "../../shared/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumns } from "@/components/tasks/columns";
import { DataTable } from "@/components/tasks/data-table";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.api.tasks.get();
      return data!;
    },
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data } = await api.api.workers.get();
      return data!;
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await api.api.tasks({ id }).delete();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const { mutate: finishTask } = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await api.api.tasks({ id }).finish.patch({
        userId: currentUserId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const [dateFrom, setDateFrom] = useQueryState("dateFrom", parseAsIsoDate);
  const [dateTo, setDateTo] = useQueryState("dateTo", parseAsIsoDate);
  const [responsible, setResponsible] = useQueryState(
    "responsible",
    parseAsInteger,
  );
  const [currentUserId, setCurrentUserId] = useQueryState(
    "currentUserId",
    parseAsInteger,
  );

  const workerMap = new Map(workers.map((w) => [w.id, w]));
  const columns = createColumns(
    workerMap,
    deleteTask,
    finishTask,
    currentUserId,
  );

  useEffect(() => {
    if (workers.length > 0 && currentUserId === null) {
      const manager = workers.find((w) => w.type === "manager");

      setCurrentUserId(manager?.id ?? workers[0].id);
    }
  }, [workers, currentUserId, setCurrentUserId]);

  const currentUser = workers.find((w) => w.id === currentUserId) ?? null;
  const isManager = currentUser?.type === "manager";

  return (
    <div className="flex flex-col items-center p-8">
      <div className="flex min-w-240 mb-4 gap-4">
        <Select
          value={currentUserId ? String(currentUserId) : ""}
          onValueChange={(v) => {
            if (responsible) setResponsible(null);
            setCurrentUserId(Number(v));
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Выберите юзера" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {workers.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.name} ({w.type === "manager" ? "Менеджер" : "Работник"})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            id="only-mine"
            checked={!!responsible}
            onCheckedChange={() =>
              responsible ? setResponsible(null) : setResponsible(currentUserId)
            }
            disabled={!currentUserId}
          />
          <Label htmlFor="only-mine">Мои задачи</Label>
        </div>
      </div>
      <div className="flex justify-between min-w-240">
        <div className="flex gap-4">
          <Field>
            <Label htmlFor="name-1">От</Label>
            <DatePicker
              value={dateFrom}
              onChange={(v) => setDateFrom(v ?? null)}
            />
          </Field>
          <Field>
            <Label htmlFor="name-1">До</Label>
            <DatePicker value={dateTo} onChange={(v) => setDateTo(v ?? null)} />
          </Field>
        </div>
        {isManager && <CreateDialog />}
      </div>
      <div className="min-w-240 m-8">
        <DataTable columns={columns} data={tasks} />
      </div>
    </div>
  );
}

export function CreateDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(CreateTaskSchema),
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await api.api.workers.get();
      if (error) throw error;
      return data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (body: CreateTaskForm) => {
      const { data, error } = await api.api.tasks.post(body);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Добавить</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Создать задачу</DialogTitle>
        </DialogHeader>

        <Separator />
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <FieldGroup>
            <Field>
              <Label>Название</Label>
              <Input
                placeholder="Сделать ..."
                {...register("name", { required: true })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </Field>

            <Field>
              <Label>Объём</Label>
              <Input
                placeholder="10 m²"
                {...register("unit", { required: true })}
              />
              {errors.unit && (
                <p className="text-sm text-destructive">
                  {errors.unit.message}
                </p>
              )}
            </Field>

            <Field>
              <Label>Назначен</Label>

              <Select onValueChange={(v) => setValue("responsible", Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите работника" />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectGroup>
                    {workers.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.responsible && (
                <p className="text-sm text-destructive">
                  {errors.responsible.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4 grid grid-cols-2 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
