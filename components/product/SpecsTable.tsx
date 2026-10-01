import { Product } from "@/types";
import { getGroupedSpecsForProduct } from "@/lib/products";

interface SpecsTableProps {
  product: Product;
}

/**
 * Clean two-column specification table grouped into 8 hardware & software categories:
 * Performance, Display, Memory and Storage, Graphics, Battery,
 * Connectivity and Ports, Physical, and Software.
 */
export function SpecsTable({ product }: SpecsTableProps) {
  const groups = getGroupedSpecsForProduct(product);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.groupTitle}
          aria-label={`${group.groupTitle} specifications`}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card"
        >
          <div className="border-b border-border/80 bg-surface px-5 py-3.5">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
              {group.groupTitle}
            </h3>
          </div>

          <dl className="divide-y divide-border/60">
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-1 px-5 py-3.5 text-sm sm:grid-cols-12 sm:gap-4"
              >
                <dt className="font-medium text-muted-foreground sm:col-span-4">
                  {row.label}
                </dt>
                <dd className="font-semibold text-foreground sm:col-span-8">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
