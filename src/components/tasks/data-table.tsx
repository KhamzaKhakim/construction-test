// DataTable.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
  OnChangeFn,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { parseAsIsoDate, parseAsStringLiteral, useQueryState } from "nuqs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(["asc", "desc"]).withOptions({
      history: "replace",
      scroll: false,
    }),
  );

  const [dateFrom] = useQueryState("dateFrom", parseAsIsoDate);
  const [dateTo] = useQueryState("dateTo", parseAsIsoDate);

  const sorting = useMemo<SortingState>(
    () =>
      sort
        ? [{ id: "createdAt", desc: sort === "desc" }]
        : [{ id: "createdAt", desc: true }],
    [sort],
  );

  const columnFilters = useMemo<ColumnFiltersState>(
    () => [
      {
        id: "createdAt",
        value: [dateFrom ?? null, dateTo ?? null],
      },
    ],
    [dateFrom, dateTo],
  );

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      setSort(first ? (first.desc ? "desc" : "asc") : null);
    },
    [sorting, setSort],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="hide-finished">Скрыть завершённые</Label>
      </div>
      <Table className="text-center">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground"
              >
                Нет задач
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
