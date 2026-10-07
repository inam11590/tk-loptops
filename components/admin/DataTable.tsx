"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DataTableHeaderTableInstance {
  getIsAllPageRowsSelected: () => boolean;
  getToggleAllPageRowsSelectedHandler: () => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export interface DataTableRowInstance<TData> {
  id: string;
  original: TData;
  getIsSelected: () => boolean;
  getToggleSelectedHandler: () => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export interface ColumnDef<TData, TValue = unknown> {
  id?: string;
  accessorKey?: (keyof TData & string) | string;
  accessorFn?: (row: TData) => TValue;
  enableSorting?: boolean;
  enableHiding?: boolean;
  header:
    | React.ReactNode
    | ((ctx: { table: DataTableHeaderTableInstance }) => React.ReactNode);
  cell: (ctx: { row: DataTableRowInstance<TData> }) => React.ReactNode;
}

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  initialPageSize?: number;
  enableRowSelection?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
  renderToolbarExtras?: (
    selectedRows: TData[],
    clearSelection: () => void
  ) => React.ReactNode;
  emptyMessage?: string;
}

function getColumnId<TData, TValue>(
  col: ColumnDef<TData, TValue>,
  idx: number
): string {
  if (col.id) return col.id;
  if (col.accessorKey) return String(col.accessorKey);
  return `col_${idx}`;
}

function getColumnValue<TData, TValue>(
  col: ColumnDef<TData, TValue>,
  row: TData
): unknown {
  if (col.accessorFn) {
    return col.accessorFn(row);
  }
  if (col.accessorKey) {
    return (row as Record<string, unknown>)[String(col.accessorKey)];
  }
  return undefined;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  initialPageSize = 10,
  enableRowSelection = false,
  getRowId,
  renderToolbarExtras,
  emptyMessage = "No matching records found.",
}: DataTableProps<TData, TValue>) {
  const [sortState, setSortState] = useState<{
    colId: string;
    desc: boolean;
  } | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const normalizedColumns = useMemo(
    () =>
      columns.map((col, idx) => ({
        col,
        id: getColumnId(col, idx),
        canSort:
          col.enableSorting !== false &&
          Boolean(col.accessorKey || col.accessorFn),
        canHide: col.enableHiding !== false,
      })),
    [columns]
  );

  const visibleColumns = useMemo(
    () => normalizedColumns.filter((c) => !hiddenColumns[c.id]),
    [normalizedColumns, hiddenColumns]
  );

  const filteredData = useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      for (const { col } of normalizedColumns) {
        const val = getColumnValue(col, row);
        if (val !== undefined && val !== null) {
          if (String(val).toLowerCase().includes(q)) return true;
        }
      }
      try {
        return JSON.stringify(row).toLowerCase().includes(q);
      } catch {
        return false;
      }
    });
  }, [data, globalFilter, normalizedColumns]);

  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;
    const targetCol = normalizedColumns.find(
      (c) => c.id === sortState.colId
    )?.col;
    if (!targetCol) return filteredData;

    const copy = [...filteredData];
    copy.sort((a, b) => {
      const va = getColumnValue(targetCol, a);
      const vb = getColumnValue(targetCol, b);
      if (va === vb) return 0;
      if (va === undefined || va === null) return 1;
      if (vb === undefined || vb === null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortState.desc ? vb - va : va - vb;
      }
      const cmp = String(va).localeCompare(String(vb), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortState.desc ? -cmp : cmp;
    });
    return copy;
  }, [filteredData, sortState, normalizedColumns]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / initialPageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const paginatedRows = useMemo(() => {
    const start = safePageIndex * initialPageSize;
    return sortedData.slice(start, start + initialPageSize).map((item, idx) => {
      const absoluteIdx = start + idx;
      const id = getRowId
        ? getRowId(item, absoluteIdx)
        : String(
            (item as Record<string, unknown>)?.id ??
              (item as Record<string, unknown>)?.code ??
              absoluteIdx
          );
      return { id, original: item };
    });
  }, [sortedData, safePageIndex, initialPageSize, getRowId]);

  const allRowsWithIds = useMemo(
    () =>
      data.map((item, idx) => ({
        id: getRowId
          ? getRowId(item, idx)
          : String(
              (item as Record<string, unknown>)?.id ??
                (item as Record<string, unknown>)?.code ??
                idx
            ),
        original: item,
      })),
    [data, getRowId]
  );

  const selectedRows = useMemo(
    () =>
      allRowsWithIds
        .filter((r) => Boolean(selectedIds[r.id]))
        .map((r) => r.original),
    [allRowsWithIds, selectedIds]
  );

  const isAllPageRowsSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((r) => Boolean(selectedIds[r.id]));

  const headerTableInstance: DataTableHeaderTableInstance = {
    getIsAllPageRowsSelected: () => isAllPageRowsSelected,
    getToggleAllPageRowsSelectedHandler: () => (e) => {
      const checked = e.target.checked;
      setSelectedIds((prev) => {
        const next = { ...prev };
        for (const r of paginatedRows) {
          if (checked) {
            next[r.id] = true;
          } else {
            delete next[r.id];
          }
        }
        return next;
      });
    },
  };

  const toggleSort = (colId: string) => {
    setSortState((prev) => {
      if (!prev || prev.colId !== colId) {
        return { colId, desc: false };
      }
      if (!prev.desc) {
        return { colId, desc: true };
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPageIndex(0);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 rounded-xl pl-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderToolbarExtras?.(selectedRows, () => setSelectedIds({}))}

          {/* Column Visibility Dropdown */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setColMenuOpen((prev) => !prev)}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>Columns</span>
            </Button>

            {colMenuOpen && (
              <div className="absolute right-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Toggle Columns
                </p>
                {normalizedColumns
                  .filter((c) => c.canHide)
                  .map((c) => (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium capitalize hover:bg-surface"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns[c.id]}
                        onChange={(e) =>
                          setHiddenColumns((prev) => ({
                            ...prev,
                            [c.id]: !e.target.checked,
                          }))
                        }
                        className="h-3.5 w-3.5 rounded accent-blue-600"
                      />
                      <span>{c.id}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-surface/70 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {visibleColumns.map(({ col, id, canSort }) => {
                  const headerContent =
                    typeof col.header === "function"
                      ? col.header({ table: headerTableInstance })
                      : col.header;

                  return (
                    <th key={id} className="px-4 py-3 align-middle">
                      {canSort ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(id)}
                          className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          {headerContent}
                          <ArrowUpDown className="h-3 w-3 opacity-70" />
                        </button>
                      ) : (
                        headerContent
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(1, visibleColumns.length)}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedRows.map((rowObj) => {
                  const rowInstance: DataTableRowInstance<TData> = {
                    id: rowObj.id,
                    original: rowObj.original,
                    getIsSelected: () => Boolean(selectedIds[rowObj.id]),
                    getToggleSelectedHandler: () => (e) => {
                      const checked = e.target.checked;
                      setSelectedIds((prev) => {
                        const next = { ...prev };
                        if (checked) {
                          next[rowObj.id] = true;
                        } else {
                          delete next[rowObj.id];
                        }
                        return next;
                      });
                    },
                  };

                  return (
                    <tr
                      key={rowObj.id}
                      className="transition-colors hover:bg-surface/50"
                    >
                      {visibleColumns.map(({ col, id }) => (
                        <td key={id} className="px-4 py-3 align-middle">
                          {col.cell({ row: rowInstance })}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-surface/40 px-4 py-3 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <strong className="text-foreground">{paginatedRows.length}</strong>{" "}
            of{" "}
            <strong className="text-foreground">{sortedData.length}</strong>{" "}
            record(s)
            {enableRowSelection && selectedRows.length > 0 && (
              <span className="ml-2 font-semibold text-accent">
                • {selectedRows.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page{" "}
              <strong className="text-foreground">{safePageIndex + 1}</strong>{" "}
              of <strong className="text-foreground">{pageCount}</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={safePageIndex <= 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={safePageIndex >= pageCount - 1}
              onClick={() =>
                setPageIndex((p) => Math.min(pageCount - 1, p + 1))
              }
              aria-label="Next page"
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
