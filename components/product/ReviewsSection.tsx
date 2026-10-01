"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpDown, BadgeCheck, Star } from "lucide-react";
import { Product, ProductReview } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingSummary } from "@/components/product/RatingSummary";
import { ReviewForm } from "@/components/product/ReviewForm";

type ReviewSortOption = "newest" | "highest" | "lowest";

interface ReviewsSectionProps {
  product: Product;
  initialReviews: ProductReview[];
}

const INITIAL_VISIBLE_COUNT = 4;

/**
 * Full customer reviews section with RatingSummary, sortable review cards
 * (Newest, Highest, Lowest), "Load more" pagination, and ReviewForm.
 */
export function ReviewsSection({
  product,
  initialReviews,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [sortBy, setSortBy] = useState<ReviewSortOption>("newest");
  const [visibleCount, setVisibleCount] = useState<number>(
    INITIAL_VISIBLE_COUNT
  );

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating || b.isoDate.localeCompare(a.isoDate);
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating || b.isoDate.localeCompare(a.isoDate);
      }
      return b.isoDate.localeCompare(a.isoDate);
    });
  }, [reviews, sortBy]);

  const visibleReviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedReviews.length;

  return (
    <div className="space-y-8">
      {/* Top Rating Summary */}
      <RatingSummary
        reviews={reviews}
        averageRating={product.rating}
        totalReviewCount={
          product.reviewCount + (reviews.length - initialReviews.length)
        }
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left: Reviews List + Sort + Load More */}
        <div className="space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-card">
            <h3 className="font-heading text-sm font-bold text-foreground">
              Showing {visibleReviews.length} of {sortedReviews.length} Featured
              Reviews
            </h3>

            <div className="flex items-center gap-2">
              <label
                htmlFor="review-sort"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-accent" />
                <span>Sort:</span>
              </label>
              <select
                id="review-sort"
                aria-label="Sort customer reviews"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as ReviewSortOption)
                }
                className="h-9 cursor-pointer rounded-lg border border-input bg-surface px-3 text-xs font-semibold text-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {visibleReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-heading text-sm font-bold text-foreground">
                          {review.author}
                        </h4>
                        {review.verifiedPurchase && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                          >
                            <BadgeCheck className="h-3 w-3" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {review.date}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-0.5 text-amber-400"
                    aria-label={`Rated ${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>

                <h5 className="mt-3.5 font-heading text-sm font-bold text-foreground">
                  {review.title}
                </h5>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {review.text}
                </p>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)
                }
              >
                Load More Reviews ({sortedReviews.length - visibleCount}{" "}
                remaining)
              </Button>
            </div>
          )}
        </div>

        {/* Right: Write a Review Form */}
        <div className="lg:col-span-5">
          <ReviewForm
            productSlug={product.slug}
            productName={product.name}
            onReviewSubmitted={(newReview) => {
              setReviews((prev) => [newReview, ...prev]);
              setVisibleCount((prev) => Math.max(prev, 5));
            }}
          />
        </div>
      </div>
    </div>
  );
}
