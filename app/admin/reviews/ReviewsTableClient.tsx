"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkModerateReviewsAction,
  deleteReviewAction,
  moderateReviewAction,
} from "@/lib/actions/admin-actions";
import type { ProductReview } from "@/types/product";

interface ReviewsTableClientProps {
  initialReviews: ProductReview[];
  productNamesBySlug: Record<string, string>;
  initialStatus?: string;
}

export function ReviewsTableClient({
  initialReviews,
  productNamesBySlug,
  initialStatus = "all",
}: ReviewsTableClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductReview | null>(null);

  const filteredReviews = useMemo(() => {
    return initialReviews.filter((r) => {
      const st = r.status ?? "Approved";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (ratingFilter !== "all" && String(r.rating) !== ratingFilter)
        return false;
      return true;
    });
  }, [initialReviews, statusFilter, ratingFilter]);

  const handleModerate = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    setBusy(true);
    try {
      await moderateReviewAction(id, status);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleBulkModerate = async (
    ids: string[],
    status: "Approved" | "Rejected",
    clearSelection: () => void
  ) => {
    setBusy(true);
    try {
      await bulkModerateReviewsAction(ids, status);
      clearSelection();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteReviewAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const columns: ColumnDef<ProductReview>[] = [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all reviews"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded accent-blue-600"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select review by ${row.original.author}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded accent-blue-600"
        />
      ),
    },
    {
      accessorKey: "productSlug",
      header: "Product",
      cell: ({ row }) => {
        const slug = row.original.productSlug;
        const name = productNamesBySlug[slug] ?? slug;
        return (
          <Link
            href={`/laptops/${slug}`}
            target="_blank"
            className="text-xs font-bold text-foreground hover:text-accent hover:underline"
          >
            {name}
          </Link>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1 font-bold text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs text-foreground">
            {row.original.rating}/5
          </span>
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Review Content",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="max-w-md space-y-1">
            <p className="text-xs font-bold text-foreground">{r.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {r.text}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.author}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {row.original.isoDate}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status ?? "Approved";
        return (
          <Badge
            variant="outline"
            className={
              st === "Approved"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : st === "Rejected"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }
          >
            {st}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Moderation",
      cell: ({ row }) => {
        const r = row.original;
        const st = r.status ?? "Approved";
        return (
          <div className="flex items-center gap-1">
            {st !== "Approved" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => handleModerate(r.id, "Approved")}
                className="h-7 gap-1 rounded-lg border-emerald-500/40 px-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                <Check className="h-3 w-3" />
                <span>Approve</span>
              </Button>
            )}
            {st !== "Rejected" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => handleModerate(r.id, "Rejected")}
                className="h-7 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:text-rose-500"
              >
                <X className="h-3 w-3" />
                <span>Reject</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => setDeleteTarget(r)}
              aria-label="Delete review"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500"
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
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:grid-cols-2 lg:w-1/2">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Moderation Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Reviews</option>
            <option value="Pending">Pending Moderation</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Star Rating
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredReviews}
        enableRowSelection
        getRowId={(r) => r.id}
        searchPlaceholder="Search review headline, author, text..."
        renderToolbarExtras={(selectedRows, clearSelection) => {
          if (selectedRows.length === 0) return null;
          const ids = selectedRows.map((r) => r.id);
          return (
            <div className="flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 p-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  handleBulkModerate(ids, "Approved", clearSelection)
                }
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve ({ids.length})</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() =>
                  handleBulkModerate(ids, "Rejected", clearSelection)
                }
                className="h-7 gap-1 rounded-lg px-2.5 text-xs font-semibold"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject ({ids.length})</span>
              </Button>
            </div>
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Customer Review?"
        description={`Are you sure you want to permanently delete the review "${deleteTarget?.title}" by ${deleteTarget?.author}?`}
        confirmLabel="Delete Review"
        loading={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
