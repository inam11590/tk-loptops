"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Power, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CouponDialog } from "@/components/admin/CouponDialog";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/lib/actions/admin-actions";
import { formatPrice } from "@/lib/config";
import type { CouponRecord } from "@/lib/couponStore";

interface CouponsTableClientProps {
  initialCoupons: CouponRecord[];
}

export function CouponsTableClient({
  initialCoupons,
}: CouponsTableClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const handleToggleActive = async (coupon: CouponRecord) => {
    setBusy(true);
    try {
      await toggleCouponActiveAction(coupon.code, !coupon.isActive);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteCouponAction(deleteTarget.code);
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const columns: ColumnDef<CouponRecord>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div>
          <span className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-xs font-extrabold text-accent">
            {row.original.code}
          </span>
          <p className="mt-1 text-xs font-semibold text-foreground">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "discountValue",
      header: "Discount",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div>
            <span className="font-heading text-xs font-bold text-foreground sm:text-sm">
              {c.discountType === "percentage"
                ? `${c.discountValue}% OFF`
                : `${formatPrice(c.discountValue)} OFF`}
            </span>
            {c.maxDiscountAmount && (
              <p className="text-[11px] text-muted-foreground">
                Cap: {formatPrice(c.maxDiscountAmount)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "minOrderAmount",
      header: "Min Order",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {formatPrice(row.original.minOrderAmount)}
        </span>
      ),
    },
    {
      id: "usage",
      accessorFn: (row) => row.usedCount ?? 0,
      header: "Used / Limit",
      cell: ({ row }) => {
        const used = row.original.usedCount ?? 0;
        const limit = row.original.usageLimit;
        return (
          <span className="font-mono text-xs text-foreground">
            {used} / {limit ? limit : "∞"}
          </span>
        );
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const exp = new Date(row.original.expiresAt);
        const isExpired = exp.getTime() < Date.now();
        return (
          <div>
            <span className="text-xs text-muted-foreground">
              {exp.toLocaleDateString()}
            </span>
            {isExpired && (
              <Badge
                variant="outline"
                className="ml-1.5 border-rose-500/40 bg-rose-500/10 text-[10px] text-rose-500"
              >
                Expired
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Actions",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => handleToggleActive(c)}
              title={c.isActive ? "Deactivate coupon" : "Activate coupon"}
              aria-label={`Toggle ${c.code}`}
              className="h-8 w-8 rounded-lg"
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => {
                setEditingCoupon(c);
                setDialogOpen(true);
              }}
              title="Edit coupon"
              aria-label={`Edit ${c.code}`}
              className="h-8 w-8 rounded-lg"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => setDeleteTarget(c)}
              title="Delete coupon"
              aria-label={`Delete ${c.code}`}
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            Coupons &amp; Discounts ({initialCoupons.length})
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Create percentage or fixed-amount promo codes with usage caps and
            live checkout enforcement.
          </p>
        </div>

        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => {
            setEditingCoupon(null);
            setDialogOpen(true);
          }}
          className="h-9 gap-1.5 rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialCoupons}
        searchPlaceholder="Search coupon code, label, description..."
      />

      <CouponDialog
        open={dialogOpen}
        coupon={editingCoupon}
        onClose={() => {
          setDialogOpen(false);
          setEditingCoupon(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Coupon Code?"
        description={`Are you sure you want to delete coupon "${deleteTarget?.code}"? Customers will no longer be able to redeem it.`}
        confirmLabel="Delete Coupon"
        loading={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
