import { Star } from "lucide-react";
import { ProductReview } from "@/types";
import { cn } from "@/lib/utils";

interface RatingSummaryProps {
  reviews: ProductReview[];
  averageRating: number;
  totalReviewCount: number;
}

/**
 * Displays average rating score, total review count, and a 5-to-1 star percentage bar breakdown.
 */
export function RatingSummary({
  reviews,
  averageRating,
  totalReviewCount,
}: RatingSummaryProps) {
  const totalSample = Math.max(1, reviews.length);

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = Math.round((count / totalSample) * 100);
    return { star, count, percentage };
  });

  return (
    <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:grid-cols-12">
      {/* Left: Overall Score */}
      <div className="flex flex-col items-center justify-center border-b border-border/60 pb-6 text-center sm:col-span-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
        <span className="font-heading text-5xl font-extrabold text-foreground">
          {averageRating.toFixed(1)}
        </span>
        <div
          className="mt-2 flex items-center gap-1 text-amber-400"
          aria-label={`Average rating ${averageRating.toFixed(1)} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={cn(
                "h-5 w-5",
                idx < Math.round(averageRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Based on <strong className="text-foreground">{totalReviewCount}</strong>{" "}
          verified ratings
        </p>
      </div>

      {/* Right: 5 to 1 Star Bar Breakdown */}
      <div className="space-y-2.5 sm:col-span-8">
        {breakdown.map((row) => (
          <div
            key={row.star}
            className="flex items-center gap-3 text-xs font-medium"
          >
            <span className="inline-flex w-14 shrink-0 items-center gap-1 text-foreground">
              <span>{row.star}</span>
              <Star
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
            </span>

            <div
              role="progressbar"
              aria-valuenow={row.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.star} star reviews: ${row.percentage}%`}
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface"
            >
              <div
                style={{ width: `${row.percentage}%` }}
                className="h-full rounded-full bg-amber-400 transition-all duration-300"
              />
            </div>

            <span className="w-10 text-right tabular-nums text-muted-foreground">
              {row.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
