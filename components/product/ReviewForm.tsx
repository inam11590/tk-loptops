"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Star } from "lucide-react";
import { ProductReview } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReviewFormProps {
  productSlug: string;
  productName: string;
  onReviewSubmitted?: (review: ProductReview) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Interactive "Write a Review" form with star rating selector, title, text,
 * name, and email validation (frontend-only with confirmation message).
 */
export function ReviewForm({
  productSlug,
  productName,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating between 1 and 5.");
      return;
    }
    if (title.trim().length < 4) {
      setError("Please enter a review headline (at least 4 characters).");
      return;
    }
    if (text.trim().length < 15) {
      setError(
        "Please write a detailed review (at least 15 characters)."
      );
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          author: name.trim(),
          email: email.trim(),
          rating,
          title: title.trim(),
          text: text.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Unable to submit your review.");
        setSubmitting(false);
        return;
      }

      if (data.review) {
        onReviewSubmitted?.(data.review);
      }
      setSubmitted(true);
      setRating(0);
      setTitle("");
      setText("");
      setName("");
      setEmail("");
    } catch {
      setError("Network error while submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-card">
      <h3 className="font-heading text-lg font-bold text-foreground">
        Write a Customer Review
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Share your hands-on experience with the {productName}.
      </p>

      {submitted ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold">
              Thank you! Your review has been submitted for moderation.
            </p>
            <p className="text-xs opacity-90">
              Once approved by our team, your review will appear publicly on this
              product page.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="mt-2 h-8 text-xs"
            >
              Write another review
            </Button>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
          aria-label={`Write a review for ${productName}`}
        >
          {/* Star Rating Picker */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-foreground">
              Your Overall Rating <span className="text-rose-500">*</span>
            </span>
            <div
              role="radiogroup"
              aria-label="Star rating"
              className="inline-flex items-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((starValue) => {
                const active = (hoverRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    role="radio"
                    aria-checked={rating === starValue}
                    aria-label={`Rate ${starValue} out of 5 stars`}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(starValue);
                      if (error) setError(null);
                    }}
                    className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        active
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-xs font-semibold text-foreground">
                  {rating} / 5 Stars
                </span>
              )}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label
              htmlFor="review-title"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Review Headline <span className="text-rose-500">*</span>
            </label>
            <Input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Impressed by the OLED display & battery life"
              required
            />
          </div>

          {/* Review Text */}
          <div>
            <label
              htmlFor="review-body"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Detailed Review <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="review-body"
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="What did you like or dislike about performance, screen quality, thermals, and build?"
              required
              className="flex w-full rounded-xl border border-input bg-surface px-3.5 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="review-name"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Your Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="review-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Alex Morgan"
                required
              />
            </div>

            <div>
              <label
                htmlFor="review-email"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                id="review-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="alex@example.com"
                required
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <div className="pt-1">
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
