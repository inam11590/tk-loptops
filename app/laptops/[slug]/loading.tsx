import { Container } from "@/components/common/container";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Breadcrumb skeleton */}
      <div className="border-b border-border/60 bg-secondary/25">
        <Container className="py-3.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-14 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
          </div>
        </Container>
      </div>

      <Container className="pt-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column gallery skeleton */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl border border-border/60 bg-secondary/50" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-xl border border-border/60 bg-secondary/40"
                />
              ))}
            </div>
          </div>

          {/* Right column info skeleton */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-secondary" />
            </div>
            <div className="h-9 w-4/5 animate-pulse rounded-lg bg-secondary" />
            <div className="h-5 w-48 animate-pulse rounded bg-secondary/70" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary/50" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-secondary/40"
                />
              ))}
            </div>
            <div className="h-12 w-full animate-pulse rounded-xl bg-secondary" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-secondary/60" />
          </div>
        </div>
      </Container>
    </div>
  );
}
