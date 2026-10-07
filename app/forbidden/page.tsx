import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "403 Access Denied — Administrator Only",
  description: "You do not have permission to access the TK Laptop administration panel.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForbiddenPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-rose-500/30 bg-card p-8 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Error 403 • Forbidden
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl">
            Administrator Access Required
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your account does not have administrator permissions to view or manage the TK Laptop Admin Panel. If you believe this is an error, please contact the store owner.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild variant="accent" className="rounded-xl">
            <Link href="/">
              <Home className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Return to Storefront</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Go to My Account</span>
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
