import Link from "next/link";
import { Laptop } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

/**
 * Text-based brand logo with an electric-blue laptop icon badge.
 */
export function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_CONFIG.name} Home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Laptop className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-heading text-lg font-bold tracking-tight sm:text-xl",
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          TK <span className="text-accent">Laptop</span>
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-widest",
            variant === "light" ? "text-slate-400" : "text-muted-foreground"
          )}
        >
          HP &amp; Dell Specialist
        </span>
      </span>
    </Link>
  );
}
