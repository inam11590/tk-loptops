import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Flame,
  HardDrive,
  MemoryStick,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { calculateDiscountPercentage, formatPrice } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/home/CountdownTimer";

/**
 * 6. Deal of the Day
 * Highlighted promotional banner featuring one discounted product,
 * live countdown timer, original & sale prices formatted via formatPrice(),
 * and a "Grab the Deal" CTA.
 */
export function DealOfTheDay() {
  const dealProduct =
    PRODUCTS.find((p) => p.tags.includes("deal-of-the-day")) ?? PRODUCTS[2];

  const discountPercent = calculateDiscountPercentage(
    dealProduct.price,
    dealProduct.oldPrice
  );
  const savingsAmount =
    dealProduct.oldPrice && dealProduct.oldPrice > dealProduct.price
      ? dealProduct.oldPrice - dealProduct.price
      : 0;

  return (
    <section
      id="deal-of-the-day"
      aria-labelledby="deal-heading"
      className="scroll-mt-24 py-section-sm sm:py-section"
    >
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-hero-gradient p-6 text-white shadow-2xl sm:p-10 lg:p-12">
            {/* Ambient Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl"
            />

            <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              {/* Left Column: Deal Details & Countdown */}
              <div className="space-y-6 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge
                    variant="discount"
                    className="gap-1.5 px-3 py-1 text-xs uppercase tracking-wider"
                  >
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    Deal of the Day
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-white/10 text-blue-200"
                  >
                    {dealProduct.brand} Flagship Series
                  </Badge>
                  {discountPercent && (
                    <Badge
                      variant="outline"
                      className="border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    >
                      Save {formatPrice(savingsAmount)} ({discountPercent}% OFF)
                    </Badge>
                  )}
                </div>

                <div className="space-y-2.5">
                  <h2
                    id="deal-heading"
                    className="font-heading text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
                  >
                    {dealProduct.name}
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    {dealProduct.description}
                  </p>
                </div>

                {/* Key Hardware Specs */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <Cpu
                      className="h-4 w-4 shrink-0 text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {dealProduct.specs.processor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <HardDrive
                      className="h-4 w-4 shrink-0 text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">{dealProduct.specs.gpu}</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <Monitor
                      className="h-4 w-4 shrink-0 text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {dealProduct.specs.display}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <MemoryStick
                      className="h-4 w-4 shrink-0 text-blue-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {dealProduct.specs.ram} • {dealProduct.specs.storage}
                    </span>
                  </div>
                </div>

                {/* Price & Live Countdown Row */}
                <div className="flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-blue-300">
                      Flash Sale Price
                    </span>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
                        {formatPrice(dealProduct.price)}
                      </span>
                      {dealProduct.oldPrice && (
                        <span className="text-base font-medium text-slate-400 line-through">
                          {formatPrice(dealProduct.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                      Offer Ends In
                    </span>
                    <CountdownTimer />
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <Button
                    asChild
                    variant="accent"
                    size="lg"
                    className="shadow-lg shadow-blue-600/30"
                  >
                    <Link href={`/laptops/${dealProduct.slug}`}>
                      <span>Grab the Deal</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <ShieldCheck
                      className="h-4 w-4 text-emerald-400"
                      aria-hidden="true"
                    />
                    Only {dealProduct.stock} units left at this price
                  </span>
                </div>
              </div>

              {/* Right Column: Product Spotlight Visual */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto aspect-[4/3] max-w-md overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
                  <Image
                    src={
                      dealProduct.images[0] ?? "/images/laptops/hp-gaming.svg"
                    }
                    alt={dealProduct.name}
                    width={520}
                    height={390}
                    sizes="(max-width: 1024px) 100vw, 440px"
                    className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
