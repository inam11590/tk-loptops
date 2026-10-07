"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ShieldCheck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/config";
import type { SafeUser } from "@/lib/users";

export interface CustomerRow extends SafeUser {
  totalOrders: number;
  totalSpent: number;
}

interface CustomersTableClientProps {
  customers: CustomerRow[];
}

export function CustomersTableClient({ customers }: CustomersTableClientProps) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = customers.filter((c) => {
    if (roleFilter !== "all" && (c.role ?? "customer") !== roleFilter)
      return false;
    if (statusFilter === "active" && c.disabled) return false;
    if (statusFilter === "disabled" && !c.disabled) return false;
    return true;
  });

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: "fullName",
      header: "Customer",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {u.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <Link
                href={`/admin/customers/${u.id}`}
                className="font-heading text-xs font-bold text-foreground hover:text-accent hover:underline sm:text-sm"
              >
                {u.fullName}
              </Link>
              <p className="text-[11px] text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const isAdmin = row.original.role === "admin";
        return isAdmin ? (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary">Customer</Badge>
        );
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground">
          {row.original.totalOrders}
        </span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Lifetime Spent",
      cell: ({ row }) => (
        <span className="font-heading text-xs font-bold text-foreground">
          {formatPrice(row.original.totalSpent)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => (row.disabled ? "disabled" : "active"),
      header: "Status",
      cell: ({ row }) =>
        row.original.disabled ? (
          <Badge
            variant="outline"
            className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          >
            Disabled
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          >
            Active
          </Badge>
        ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Action",
      cell: ({ row }) => (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg text-xs font-semibold"
        >
          <Link href={`/admin/customers/${row.original.id}`}>
            <Eye className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:grid-cols-2 lg:w-1/2">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Account Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Account Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">Active &amp; Disabled</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by customer name, email, phone..."
      />
    </div>
  );
}
