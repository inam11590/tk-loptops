import Link from "next/link";
import { ArrowLeft, Laptop, Search } from "lucide-react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-xl rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-soft">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Laptop className="h-8 w-8" />
        </div>

        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          404 · Laptop Not Found
        </span>

        <h1 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-foreground">
          We couldn&apos;t find that laptop configuration
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          The laptop link you followed may have been updated, discontinued, or
          typed incorrectly. Explore our full catalog of genuine HP and Dell
          laptops below.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
            <Link href="/laptops">
              <Search className="mr-2 h-4 w-4" />
              Browse All Laptops
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto font-semibold"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Popular Destinations
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            <Link
              href="/laptops/hp"
              className="rounded-lg bg-secondary/70 px-3 py-1.5 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              HP Laptops
            </Link>
            <Link
              href="/laptops/dell"
              className="rounded-lg bg-secondary/70 px-3 py-1.5 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Dell Laptops
            </Link>
            <Link
              href="/deals"
              className="rounded-lg bg-secondary/70 px-3 py-1.5 text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              Hot Deals
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
