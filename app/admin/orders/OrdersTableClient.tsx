"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/config";
import type { OrderRecord } from "@/lib/orders";

interface OrdersTableClientProps {
  initialOrders: OrderRecord[];
  initialStatus?: string;
  initialPaymentStatus?: string;
  initialPaymentMethod?: string;
}

export function OrdersTableClient({
  initialOrders,
  initialStatus = "all",
  initialPaymentStatus = "all",
  initialPaymentMethod = "all",
}: OrdersTableClientProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(
    initialPaymentStatus
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(
    initialPaymentMethod
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      const pStatus = order.paymentStatus ?? "Unpaid";
      if (
        paymentStatusFilter !== "all" &&
        pStatus !== paymentStatusFilter
      ) {
        return false;
      }
      if (
        paymentMethodFilter !== "all" &&
        order.paymentMethodId !== paymentMethodFilter
      ) {
        return false;
      }

      if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        if (new Date(order.createdAt) < start) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(order.createdAt) > end) return false;
      }
      return true;
    });
  }, [
    initialOrders,
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
    dateFrom,
    dateTo,
  ]);

  const handleExportCsv = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Phone",
      "Items Count",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Grand Total",
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredOrders.map((o) =>
      [
        o.id,
        o.createdAt,
        o.customer.fullName,
        o.customer.email,
        o.customer.phone,
        o.totals.totalItems,
        o.paymentMethodLabel,
        o.paymentStatus ?? "Unpaid",
        o.status,
        o.totals.grandTotal,
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `tk-laptop-orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case "Shipped":
        return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "Confirmed":
        return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "Cancelled":
        return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    }
  };

  const getPaymentBadgeClass = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "Paid":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
      case "Refunded":
        return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
      default:
        return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    }
  };

  const columns: ColumnDef<OrderRecord>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="font-mono text-xs font-bold text-foreground hover:text-accent hover:underline"
        >
          {row.original.id}
        </Link>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => `${row.customer.fullName} ${row.customer.email}`,
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-bold text-foreground">
            {row.original.customer.fullName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {row.original.customer.email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "items",
      accessorFn: (row) => row.totals.totalItems,
      header: "Items",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {row.original.totals.totalItems} item(s)
        </span>
      ),
    },
    {
      id: "total",
      accessorFn: (row) => row.totals.grandTotal,
      header: "Total",
      cell: ({ row }) => (
        <span className="font-heading text-xs font-bold text-foreground sm:text-sm">
          {formatPrice(row.original.totals.grandTotal)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethodLabel",
      header: "Payment",
      cell: ({ row }) => {
        const pStatus = row.original.paymentStatus ?? "Unpaid";
        return (
          <div className="space-y-1">
            <Badge
              variant="outline"
              className={getPaymentBadgeClass(pStatus)}
            >
              {pStatus}
            </Badge>
            <p className="text-[11px] text-muted-foreground">
              {row.original.paymentMethodLabel}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={getOrderStatusClass(row.original.status)}
        >
          {row.original.status}
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
          <Link href={`/admin/orders/${row.original.id}`}>
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Order Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Payment Status
          </label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Payment Method
          </label>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="h-9 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
          >
            <option value="all">All Methods</option>
            <option value="card">Credit / Debit Card</option>
            <option value="cod">Cash on Delivery</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_wallet">Mobile Wallet</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            From Date
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            To Date
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Data Table with CSV Export */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search by Order ID, customer name, email, phone..."
        renderToolbarExtras={() => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV ({filteredOrders.length})</span>
          </Button>
        )}
      />
    </div>
  );
}
