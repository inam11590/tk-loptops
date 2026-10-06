"use client";

import {
  Check,
  Clock,
  PackageCheck,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import type { OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt?: string;
  estimatedDelivery?: string;
}

const TIMELINE_STAGES: {
  key: Exclude<OrderStatus, "Cancelled">;
  label: string;
  description: string;
  icon: typeof Clock;
}[] = [
  {
    key: "Pending",
    label: "Order Placed",
    description: "Order received & hardware reserved in warehouse",
    icon: Clock,
  },
  {
    key: "Confirmed",
    label: "Verified & Packed",
    description: "QA inspection passed & factory seal verified",
    icon: ShieldCheck,
  },
  {
    key: "Shipped",
    label: "In Transit",
    description: "Handed to insured express courier with tracking",
    icon: Truck,
  },
  {
    key: "Delivered",
    label: "Delivered",
    description: "Signed & delivered to destination address",
    icon: PackageCheck,
  },
];

/**
 * Visual Order Status Timeline (Pending -> Confirmed -> Shipped -> Delivered).
 */
export function OrderTimeline({
  status,
  estimatedDelivery,
}: OrderTimelineProps) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
        <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>This order has been cancelled.</span>
      </div>
    );
  }

  const activeIndex = TIMELINE_STAGES.findIndex((s) => s.key === status);

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/60 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Live Fulfillment Status
          </span>
          <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
            Current Status: {status}
          </h3>
        </div>
        {estimatedDelivery && (
          <span className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
            Estimated Delivery: <strong>{estimatedDelivery}</strong>
          </span>
        )}
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {TIMELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <li
              key={stage.key}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border p-3.5 sm:flex-col transition-all",
                isCurrent
                  ? "border-accent bg-accent/10 shadow-sm"
                  : isCompleted
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border/60 bg-card/50 opacity-60"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                    isCurrent
                      ? "bg-accent text-accent-foreground"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:hidden">
                  Step {idx + 1}
                </span>
              </div>

              <div>
                <p className="font-heading text-xs sm:text-sm font-bold text-foreground">
                  {stage.label}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
