import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  formattedValue: string;
  percentChange: number;
  previousLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function StatCard({
  title,
  formattedValue,
  percentChange,
  previousLabel = "vs previous period",
  icon: Icon,
}: StatCardProps) {
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card transition-all hover:border-accent/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {formattedValue}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold",
            isPositive &&
              "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            isNegative && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
            !isPositive &&
              !isNegative &&
              "bg-secondary text-muted-foreground"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : isNegative ? (
            <ArrowDownRight className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {percentChange}%
          </span>
        </span>
        <span className="text-muted-foreground">{previousLabel}</span>
      </div>
    </div>
  );
}
