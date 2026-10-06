"use client";

import { CheckCircle2, Truck } from "lucide-react";
import { formatPrice } from "@/lib/config";
import { cn } from "@/lib/utils";

interface FreeShippingBarProps {
  subtotal: number;
  threshold: number;
  className?: string;
  compact?: boolean;
}

/**
 * Displays a visual progress bar toward the free delivery threshold defined in SITE_CONFIG.
 */
export function FreeShippingBar({
  subtotal,
  threshold,
  className,
  compact = false,
}: FreeShippingBarProps) {
  const remaining = Math.max(0, threshold - subtotal);
  const unlocked = subtotal >= threshold && subtotal > 0;
  const progress =
    threshold > 0
      ? Math.min(100, Math.max(0, Math.round((subtotal / threshold) * 100)))
      : 100;

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 transition-colors",
        unlocked
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-accent/25 bg-accent/5",
        compact && "p-3",
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
        {unlocked ? (
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
        ) : (
          <Truck
            className="h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
        )}

        <p className="font-medium text-foreground">
          {unlocked ? (
            <span>
              You&apos;ve unlocked{" "}
              <strong className="font-bold text-emerald-700 dark:text-emerald-300">
                FREE Insured Express Delivery
              </strong>
              !
            </span>
          ) : subtotal <= 0 ? (
            <span>
              Orders over{" "}
              <strong className="font-bold text-accent">
                {formatPrice(threshold)}
              </strong>{" "}
              qualify for{" "}
              <strong className="font-bold text-foreground">
                FREE delivery
              </strong>
              .
            </span>
          ) : (
            <span>
              Add{" "}
              <strong className="font-bold text-accent">
                {formatPrice(remaining)}
              </strong>{" "}
              more for{" "}
              <strong className="font-bold text-foreground">
                FREE insured delivery
              </strong>
              !
            </span>
          )}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Free shipping qualification progress"
        className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            unlocked ? "bg-emerald-500" : "bg-accent"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
