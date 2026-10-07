import { ReviewsTableClient } from "@/app/admin/reviews/ReviewsTableClient";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAllProducts } from "@/lib/productStore";
import { getAllReviews } from "@/lib/reviewStore";

export const dynamic = "force-dynamic";

interface AdminReviewsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  await requireAdminPage();
  const params = await searchParams;
  const reviews = getAllReviews();
  const products = getAllProducts({ includeDrafts: true });

  const productNamesBySlug: Record<string, string> = {};
  for (const p of products) {
    productNamesBySlug[p.slug] = p.name;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card">
        <h1 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
          Customer Reviews Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Approve, reject, or delete customer reviews. Only approved reviews
          appear on the storefront and count toward product ratings.
        </p>
      </div>

      <ReviewsTableClient
        initialReviews={reviews}
        productNamesBySlug={productNamesBySlug}
        initialStatus={params.status ?? "all"}
      />
    </div>
  );
}
