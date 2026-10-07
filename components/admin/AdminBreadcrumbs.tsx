"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  products: "Products",
  new: "New Product",
  orders: "Orders",
  customers: "Customers",
  coupons: "Coupons",
  reviews: "Reviews",
  settings: "Settings",
  activity: "Activity Log",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname() || "/admin";
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Admin breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground print:hidden"
    >
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        <span>Dashboard</span>
      </Link>

      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/");
        const isLast = index === segments.slice(1).length - 1;
        const label =
          SEGMENT_LABELS[segment] ??
          decodeURIComponent(segment).replace(/-/g, " ");

        return (
          <span key={href} className="inline-flex items-center gap-1.5">
            <ChevronRight
              className="h-3.5 w-3.5 text-muted-foreground/60"
              aria-hidden="true"
            />
            {isLast ? (
              <span
                aria-current="page"
                className="font-semibold text-foreground capitalize"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="rounded-md px-1.5 py-0.5 capitalize transition-colors hover:bg-surface hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
