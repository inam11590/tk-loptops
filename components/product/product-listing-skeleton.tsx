import { Container } from "@/components/common/container";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable loading skeleton for all product listing routes (loading.tsx).
 */
export function ProductListingSkeleton() {
  return (
    <div className="py-8 sm:py-12" aria-busy="true" aria-label="Loading laptops">
      <Container className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3 rounded-2xl border border-border/70 bg-surface p-6 sm:p-8">
          <Skeleton className="h-4 w-44" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-9 w-72 sm:w-96" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Filter Sidebar Skeleton (Desktop) */}
          <div className="hidden space-y-4 lg:col-span-3 lg:block">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>

          {/* Right Toolbar & Product Cards Skeleton */}
          <div className="space-y-6 lg:col-span-9">
            <Skeleton className="h-14 w-full rounded-xl" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-card"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
