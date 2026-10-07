"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  MessageSquarePlus,
  Printer,
  Truck,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addOrderNoteAction,
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/actions/admin-actions";
import type {
  OrderRecord,
  OrderStatus,
} from "@/lib/orders";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

interface OrderStatusSelectProps {
  order: OrderRecord;
}

export function OrderStatusSelect({ order }: OrderStatusSelectProps) {
  const router = useRouter();
  const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    allowedNext[0] ?? order.status
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber ?? ""
  );
  const [courier, setCourier] = useState(order.courier ?? "DHL Express");
  const [statusNote, setStatusNote] = useState("");
  type AdminPaymentStatus =
    | "Unpaid"
    | "Pending Verification"
    | "Paid"
    | "Refunded";
  const initialPaymentStatus: AdminPaymentStatus =
    order.paymentStatus === "Paid" || order.paymentStatus === "Authorized (Demo)"
      ? "Paid"
      : order.paymentStatus === "Refunded"
      ? "Refunded"
      : order.paymentStatus === "Pending Verification" ||
        order.paymentStatus === "Awaiting Bank Transfer"
      ? "Pending Verification"
      : "Unpaid";
  const [paymentStatus, setPaymentStatus] =
    useState<AdminPaymentStatus>(initialPaymentStatus);
  const [internalNote, setInternalNote] = useState("");

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const executeStatusUpdate = async (targetStatus: OrderStatus) => {
    setFeedback(null);
    setLoadingStatus(true);
    try {
      const res = await updateOrderStatusAction({
        orderId: order.id,
        nextStatus: targetStatus,
        trackingNumber:
          targetStatus === "Shipped" ? trackingNumber.trim() : undefined,
        courier: targetStatus === "Shipped" ? courier.trim() : undefined,
        note: statusNote.trim() || undefined,
      });

      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to update status.",
        });
        return;
      }

      setStatusNote("");
      setFeedback({
        type: "success",
        text: `Order status updated to ${targetStatus}. Notification email logged.`,
      });
      router.refresh();
    } finally {
      setLoadingStatus(false);
      setCancelConfirmOpen(false);
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === "Cancelled") {
      setCancelConfirmOpen(true);
      return;
    }
    executeStatusUpdate(selectedStatus);
  };

  const handlePaymentUpdate = async () => {
    setFeedback(null);
    setLoadingPayment(true);
    try {
      const res = await updateOrderPaymentStatusAction({
        orderId: order.id,
        paymentStatus,
      });
      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to update payment status.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: `Payment status updated to ${paymentStatus}.`,
      });
      router.refresh();
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setFeedback(null);
    setLoadingNote(true);
    try {
      const res = await addOrderNoteAction({
        orderId: order.id,
        text: internalNote.trim(),
      });
      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to add internal note.",
        });
        return;
      }
      setInternalNote("");
      setFeedback({
        type: "success",
        text: "Internal admin note added.",
      });
      router.refresh();
    } finally {
      setLoadingNote(false);
    }
  };

  return (
    <div className="space-y-6 print:hidden">
      {/* Print Invoice & Packing Slip Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-card">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Invoice / Packing Slip</span>
        </Button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Order Status Workflow Card */}
      <form
        onSubmit={handleStatusSubmit}
        className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground">
            Order Fulfillment Workflow
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Current Status:{" "}
          <strong className="text-foreground">{order.status}</strong>
          {order.stockDeducted && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">
              • Inventory Reserved
            </span>
          )}
        </p>

        {allowedNext.length === 0 ? (
          <p className="rounded-xl bg-surface p-3 text-xs text-muted-foreground">
            This order is in a terminal state ({order.status}) and cannot
            transition further.
          </p>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Transition To
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as OrderStatus)
                }
                className="h-10 w-full rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
              >
                {allowedNext.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {selectedStatus === "Shipped" && (
              <div className="space-y-3 rounded-xl border border-border/60 bg-surface/60 p-3.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Courier Service
                  </label>
                  <Input
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. DHL Express / FedEx"
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Tracking Number
                  </label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DHL-994827164"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Transition Note (Optional)
              </label>
              <Input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Reason or dispatch reference..."
                className="h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              variant={
                selectedStatus === "Cancelled" ? "destructive" : "accent"
              }
              size="sm"
              disabled={loadingStatus}
              className="w-full rounded-xl font-semibold"
            >
              {loadingStatus && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              <span>Update Status to {selectedStatus}</span>
            </Button>
          </>
        )}
      </form>

      {/* Payment Status Card */}
      <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground">
            Payment Verification
          </h3>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            Payment Status
          </label>
          <div className="flex gap-2">
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as AdminPaymentStatus)
              }
              className="h-9 flex-1 rounded-xl border border-input bg-surface px-3 text-xs font-semibold text-foreground"
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingPayment}
              onClick={handlePaymentUpdate}
              className="h-9 rounded-xl text-xs font-semibold"
            >
              {loadingPayment ? "Saving..." : "Update"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Internal Note Card */}
      <form
        onSubmit={handleAddNote}
        className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-card"
      >
        <div className="flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-bold text-foreground">
            Internal Admin Notes
          </h3>
        </div>

        <textarea
          rows={3}
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Add private staff note (never shown to customer)..."
          className="flex w-full rounded-xl border border-input bg-surface px-3 py-2 text-xs text-foreground focus-visible:border-accent focus-visible:outline-none"
        />

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={loadingNote || !internalNote.trim()}
          className="w-full rounded-xl text-xs font-semibold"
        >
          {loadingNote ? "Adding Note..." : "Add Internal Note"}
        </Button>
      </form>

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel This Order?"
        description={`Are you sure you want to cancel order ${order.id}? Any reserved product stock will be automatically restored.`}
        confirmLabel="Yes, Cancel Order"
        loading={loadingStatus}
        onConfirm={() => executeStatusUpdate("Cancelled")}
        onCancel={() => setCancelConfirmOpen(false)}
      />
    </div>
  );
}
