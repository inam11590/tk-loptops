"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FolderEdit,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkProductsAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/actions/admin-actions";
import { formatPrice } from "@/lib/config";
import type { LaptopCategory, Product } from "@/types/product";

const CATEGORIES: { value: LaptopCategory; label: string }[] = [
  { value: "business", label: "Business Laptops" },
  { value: "gaming", label: "Gaming Laptops" },
  { value: "student", label: "Student Laptops" },
  { value: "ultrabook", label: "Ultrabooks" },
  { value: "budget", label: "Budget Laptops" },
];

interface ProductsTableClientProps {
  initialProducts: Product[];
}

export function ProductsTableClient({
  initialProducts,
}: ProductsTableClientProps) {
  const router = useRouter();
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [bulkCategory, setBulkCategory] = useState<LaptopCategory>("business");
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const filteredData = useMemo(() => {
    return initialProducts.filter((product) => {
      if (brandFilter !== "all" && product.brand !== brandFilter) return false;
      if (categoryFilter !== "all" && product.category !== categoryFilter)
        return false;
      const pubStatus = product.status ?? "published";
      if (statusFilter !== "all" && pubStatus !== statusFilter) return false;
      if (stockFilter === "in_stock" && product.stock <= 0) return false;
      if (
        stockFilter === "low_stock" &&
        (product.stock <= 0 ||
          product.stock > (product.lowStockThreshold ?? 5))
      )
        return false;
      if (stockFilter === "out_of_stock" && product.stock > 0) return false;
      return true;
    });
  }, [
    initialProducts,
    brandFilter,
    categoryFilter,
    stockFilter,
    statusFilter,
  ]);

  const handleSingleDuplicate = async (id: string) => {
    setBusy(true);
    try {
      const res = await duplicateProductAction(id);
      if (res.success && res.product) {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSingleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteProductAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const runBulkAction = async (
    ids: string[],
    action: "publish" | "unpublish" | "delete" | "set_category",
    clearSelection: () => void
  ) => {
    setBusy(true);
    try {
      await bulkProductsAction({
        ids,
        action,
        category: action === "set_category" ? bulkCategory : undefined,
      });
      clearSelection();
      setBulkDeleteIds(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded accent-blue-600"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded accent-blue-600"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const p = row.original;
        const img = p.images[0] ?? "/images/laptops/hp-business.svg";
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-surface p-1">
              <Image
                src={img}
                alt={p.name}
                width={52}
                height={38}
                unoptimized={img.startsWith("/uploads/")}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/products/${p.id}`}
                className="font-heading text-xs font-bold text-foreground hover:text-accent hover:underline sm:text-sm block truncate max-w-[240px]"
              >
                {p.name}
              </Link>
              <p className="font-mono text-[11px] text-muted-foreground">
                {p.sku ?? p.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => (
        <Badge variant={row.original.brand === "HP" ? "hp" : "dell"}>
          {row.original.brand}
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div>
            <span className="font-heading font-bold text-foreground">
              {formatPrice(p.price)}
            </span>
            {p.oldPrice && p.oldPrice > p.price && (
              <span className="ml-1.5 text-[11px] text-muted-foreground line-through">
                {formatPrice(p.oldPrice)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const p = row.original;
        const threshold = p.lowStockThreshold ?? 5;
        return (
          <Badge
            variant="outline"
            className={
              p.stock === 0
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : p.stock <= threshold
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }
          >
            {p.stock === 0 ? "Out of stock (0)" : `${p.stock} in stock`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status ?? "published";
        return (
          <Badge
            variant="outline"
            className={
              st === "published"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                : "border-border bg-secondary text-muted-foreground"
            }
          >
            {st === "published" ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Actions",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              title="Edit product"
            >
              <Link
                href={`/admin/products/${p.id}`}
                aria-label={`Edit ${p.name}`}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => handleSingleDuplicate(p.id)}
              aria-label={`Duplicate ${p.name}`}
              title="Duplicate product"
              className="h-8 w-8 rounded-lg"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => setDeleteTarget(p)}
              aria-label={`Delete ${p.name}`}
              title="Delete product"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Brand
          </label>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Brands</option>
            <option value="HP">HP</option>
            <option value="Dell">Dell</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Stock Status
          </label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock Alert</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Visibility
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">Published &amp; Drafts</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={filteredData}
        enableRowSelection
        getRowId={(row) => row.id}
        searchPlaceholder="Search by name, SKU, processor, GPU..."
        renderToolbarExtras={(selectedRows, clearSelection) => {
          if (selectedRows.length === 0) return null;
          const ids = selectedRows.map((r) => r.id);

          return (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 p-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => runBulkAction(ids, "publish", clearSelection)}
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Publish ({ids.length})</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => runBulkAction(ids, "unpublish", clearSelection)}
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>Unpublish</span>
              </Button>

              <div className="flex items-center gap-1">
                <select
                  value={bulkCategory}
                  onChange={(e) =>
                    setBulkCategory(e.target.value as LaptopCategory)
                  }
                  className="h-7 rounded-lg border border-input bg-background px-2 text-[11px] font-semibold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    runBulkAction(ids, "set_category", clearSelection)
                  }
                  className="h-7 gap-1 rounded-lg px-2 text-xs font-semibold"
                >
                  <FolderEdit className="h-3.5 w-3.5" />
                  <span>Set Category</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={busy}
                onClick={() => setBulkDeleteIds(ids)}
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          );
        }}
      />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        loading={busy}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={Boolean(bulkDeleteIds)}
        title={`Delete ${bulkDeleteIds?.length ?? 0} Selected Products?`}
        description="Are you sure you want to permanently delete the selected products from the catalog?"
        confirmLabel="Delete All Selected"
        loading={busy}
        onConfirm={() => {
          if (bulkDeleteIds) {
            runBulkAction(bulkDeleteIds, "delete", () => {});
          }
        }}
        onCancel={() => setBulkDeleteIds(null)}
      />
    </div>
  );
}
