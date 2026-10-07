"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-rose-500/30 bg-card p-8 text-center shadow-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
        Something went wrong in the Admin Panel
      </h2>
      <p className="mt-1 max-w-md text-xs text-muted-foreground sm:text-sm">
        {error.message || "An unexpected error occurred while loading admin data."}
      </p>
      <Button
        type="button"
        variant="accent"
        size="sm"
        onClick={reset}
        className="mt-5 gap-2 rounded-xl"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
