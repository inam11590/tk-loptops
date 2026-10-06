import Link from "next/link";
import {
  CheckCircle2,
  HeartHandshake,
  Laptop,
  Lock,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const BRAND_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine HP & Dell Hardware",
    description:
      "Factory-sealed laptops with official manufacturer serial verification and 1-year warranty.",
  },
  {
    icon: Truck,
    title: "Real-Time Order & Delivery Tracking",
    description:
      "Follow every shipment milestone from our warehouse to your doorstep and print official invoices anytime.",
  },
  {
    icon: HeartHandshake,
    title: "Synced Wishlist & One-Click Checkout",
    description:
      "Save up to 5 delivery addresses and keep your favorite laptops synced across all your devices.",
  },
];

/**
 * Clean split layout for authentication pages (/login, /register, /forgot-password, /reset-password/[token]).
 * Desktop: Rich primary navy brand panel on the left, form card on the right.
 * Mobile: Form card only for distraction-free completion.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <section className="min-h-[calc(100vh-5rem)] bg-surface py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card lg:grid-cols-12">
          {/* Left Column: Brand Panel (Desktop Only) */}
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-hero-gradient p-10 text-white lg:col-span-5 lg:flex xl:p-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 space-y-8">
              <Link
                href="/"
                className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-xl"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
                  <Laptop className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-xl font-bold tracking-tight text-white">
                    {SITE_CONFIG.name}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
                    Authorized HP &amp; Dell Partner
                  </span>
                </div>
              </Link>

              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur-sm">
                  <Lock className="h-3.5 w-3.5 text-blue-300" aria-hidden="true" />
                  Member Portal
                </span>
                <h2 className="font-heading text-2xl font-bold leading-snug text-white xl:text-3xl">
                  Power Your Work. Manage Every Device in One Place.
                </h2>
                <p className="text-sm leading-relaxed text-slate-300">
                  Join thousands of professionals, students, and gamers who
                  trust {SITE_CONFIG.name} for genuine enterprise and gaming
                  laptops.
                </p>
              </div>

              <ul className="space-y-5 pt-2">
                {BRAND_BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={benefit.title} className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-blue-300">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {benefit.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative z-10 mt-10 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>256-Bit Encrypted &amp; Verified Checkout</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Placed an order as a guest earlier? Register or sign in with the
                same email address and we will automatically link your order
                history.
              </p>
            </div>
          </aside>

          {/* Right Column: Form Panel */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7 xl:p-12">
            <div className="mx-auto w-full max-w-md space-y-6">
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
