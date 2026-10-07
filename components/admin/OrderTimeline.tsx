import {
  CheckCircle2,
  Clock,
  PackageCheck,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderRecord, OrderStatus } from "@/lib/orders";

const STEPS: {
  status: OrderStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { status: "Pending", label: "Order Placed", icon: Clock },
  { status: "Confirmed", label: "Confirmed", icon: ShieldCheck },
  { status: "Shipped", label: "Shipped", icon: Truck },
  { status: "Delivered", label: "Delivered", icon: PackageCheck },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

interface OrderTimelineProps {
  order: OrderRecord;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentIdx = STATUS_INDEX[order.status];
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-base font-bold text-foreground">
          Order Progress &amp; History Log
        </h3>
        {order.trackingNumber && (
          <span className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
            {order.courier ? `${order.courier}: ` : "Tracking: "}
            {order.trackingNumber}
          </span>
        )}
      </div>

      {/* Visual Stepper */}
      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>
            This order was cancelled. Reserved inventory (if any) has been
            restored to stock.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const completed = index <= currentIdx;
            const isCurrent = index === currentIdx;

            return (
              <div
                key={step.status}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 transition-colors",
                  completed
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border/60 bg-surface/40 text-muted-foreground",
                  isCurrent && "ring-1 ring-accent"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    completed
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Step {index + 1}
                  </p>
                  <p className="text-xs font-bold">{step.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status History Log */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="border-t border-border/60 pt-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Status Audit Trail
          </h4>
          <ol className="space-y-2.5 text-xs">
            {[...order.statusHistory].reverse().map((entry, idx) => (
              <li
                key={`${entry.changedAt}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface/60 px-3.5 py-2.5"
              >
                <div>
                  <span className="font-bold text-foreground">
                    {entry.status}
                  </span>
                  {entry.note && (
                    <span className="ml-2 text-muted-foreground">
                      — {entry.note}
                    </span>
                  )}
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    by {entry.changedBy}
                  </span>
                </div>
                <time className="font-mono text-[11px] text-muted-foreground">
                  {new Date(entry.changedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Internal Notes List */}
      {order.internalNotes && order.internalNotes.length > 0 && (
        <div className="border-t border-border/60 pt-4 print:hidden">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Internal Staff Notes ({order.internalNotes.length})
          </h4>
          <ul className="space-y-2 text-xs">
            {[...order.internalNotes].reverse().map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-border/60 bg-surface/50 p-3"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <strong className="text-foreground">{note.authorName}</strong>
                  <time className="font-mono">
                    {new Date(note.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 text-foreground">{note.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
