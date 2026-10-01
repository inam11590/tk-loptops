import Link from "next/link";
import { ArrowLeft, Compass, Laptop } from "lucide-react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export default function GlobalNotFound() {
  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-xl rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-soft">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" />
        </div>

        <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Error 404
        </span>

        <h1 className="mt-4 font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
          Browse our genuine HP and Dell laptops or return to the home page.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
            <Link href="/laptops">
              <Laptop className="mr-2 h-4 w-4" />
              Shop All Laptops
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
      </div>
    </Container>
  );
}
