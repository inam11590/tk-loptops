"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 8. Customer Testimonials
 * Responsive grid on desktop + interactive carousel stepper on mobile/tablet,
 * displaying avatar, name, role, 5-star rating, purchased model, and review text.
 */
export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-section-sm sm:py-section"
    >
      <Container className="space-y-10">
        <FadeIn>
          <SectionHeading
            id="testimonials-heading"
            eyebrow="Verified Buyers"
            title="Trusted by Engineers, Creators & Leaders"
            description="Read real feedback from professionals who upgraded their daily workflow with genuine HP and Dell laptops from TK Laptop."
            action={
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="min-w-[3rem] text-center text-xs font-semibold text-muted-foreground">
                  {activeIndex + 1} / {TESTIMONIALS.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            }
          />
        </FadeIn>

        {/* Mobile/Tablet Active Slide + Desktop 4-Column Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item, index) => {
            const isMobileVisible = index === activeIndex;
            return (
              <FadeIn
                key={item.id}
                delay={index * 0.08}
                className={isMobileVisible ? "block" : "hidden md:block"}
              >
                <article className="flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-card transition-all duration-300 hover:border-accent/40 hover:shadow-card-hover">
                  <div className="space-y-4">
                    {/* Star Rating & Quote Icon */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-1"
                        aria-label={`Rated ${item.rating} out of 5 stars`}
                      >
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <Quote
                        className="h-5 w-5 text-accent/30"
                        aria-hidden="true"
                      />
                    </div>

                    {/* Review Copy */}
                    <blockquote className="text-sm leading-relaxed text-foreground/90">
                      &ldquo;{item.text}&rdquo;
                    </blockquote>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border/60 pt-4">
                    <Badge
                      variant="secondary"
                      className="max-w-full truncate text-[11px] font-medium"
                    >
                      Purchased: {item.purchasedModel}
                    </Badge>

                    <div className="flex items-center gap-3">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        width={44}
                        height={44}
                        sizes="44px"
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-heading text-sm font-bold text-foreground">
                          {item.name}
                        </h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.role}, {item.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
