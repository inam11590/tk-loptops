"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { SITE_CONFIG, formatPrice } from "@/lib/config";
import { PRODUCTS } from "@/data/products";
import { Container } from "@/components/common/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * 1. Hero Banner
 * Navy-to-blue gradient background with subtle architectural grid + radial glow,
 * entrance animations, primary/outline CTAs, and floating laptop illustration with info chips.
 */
export function Hero() {
  const lowestPrice = Math.min(...PRODUCTS.map((p) => p.price));

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-hero-gradient py-16 text-white sm:py-20 lg:py-28"
    >
      {/* Subtle architectural grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_60%,transparent_100%)]"
      />

      {/* Ambient electric-blue radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 lg:col-span-6"
          >
            <Badge
              variant="outline"
              className="border-blue-400/35 bg-blue-500/15 px-3.5 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-sm"
            >
              <Sparkles
                className="mr-1.5 h-3.5 w-3.5 text-blue-400"
                aria-hidden="true"
              />
              Official HP &amp; Dell Flagship Store • From{" "}
              {formatPrice(lowestPrice)}
            </Badge>

            <h1
              id="hero-heading"
              className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl xl:text-6xl"
            >
              Power Your Work.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Elevate Your Play.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Discover 100% genuine HP and Dell laptops—from executive OLED
              ultrabooks and vPro enterprise workstations to high-refresh RTX
              gaming rigs. Backed by our{" "}
              <strong className="font-semibold text-white">
                {SITE_CONFIG.shipping.warrantyText}
              </strong>{" "}
              and free express delivery over{" "}
              <strong className="font-semibold text-white">
                {formatPrice(SITE_CONFIG.shipping.freeDeliveryThreshold)}
              </strong>
              .
            </p>

            {/* Primary & Outline CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                asChild
                variant="accent"
                size="lg"
                className="shadow-lg shadow-blue-600/25"
              >
                <Link href="/laptops">
                  <span>Shop All Laptops</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
              >
                <Link href="/deals">View Deals</Link>
              </Button>
            </div>

            {/* Key Store Metrics */}
            <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:max-w-md">
              <div>
                <dt className="text-xs text-slate-400">Verified Rating</dt>
                <dd className="mt-0.5 font-heading text-xl font-bold text-white">
                  4.9 / 5.0
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Dispatch Speed</dt>
                <dd className="mt-0.5 font-heading text-xl font-bold text-white">
                  Same-Day
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Coverage</dt>
                <dd className="mt-0.5 font-heading text-xl font-bold text-white">
                  1-Yr Warranty
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Right Column: Floating Laptop Visual + Info Chips */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-6"
          >
            {/* Continuous gentle floating wrapper */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative mx-auto max-w-xl"
            >
              <div className="relative aspect-[960/700] w-full">
                <Image
                  src="/images/laptops/hero-laptop.svg"
                  alt="Flagship HP and Dell OLED laptop showcase with Intel Core Ultra 9 and NVIDIA RTX 4070 graphics"
                  width={960}
                  height={700}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                  className="h-full w-full object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Info Chip 1: 1-Year Warranty (Top Left) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute left-2 top-3 flex items-center gap-2.5 rounded-xl border border-white/20 bg-slate-900/85 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md sm:left-4 sm:top-6 sm:px-4 sm:py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-white">
                    1-Year Warranty
                  </p>
                  <p className="text-[11px] font-normal text-slate-300">
                    Official Hardware Protection
                  </p>
                </div>
              </motion.div>

              {/* Floating Info Chip 2: 100% Genuine (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
                className="absolute bottom-3 right-2 flex items-center gap-2.5 rounded-xl border border-white/20 bg-slate-900/85 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md sm:bottom-6 sm:right-4 sm:px-4 sm:py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-white">
                    100% Genuine
                  </p>
                  <p className="text-[11px] font-normal text-slate-300">
                    Factory-Sealed HP &amp; Dell
                  </p>
                </div>
              </motion.div>

              {/* Floating Info Chip 3: AI-Ready Performance (Top Right on sm+) */}
              <div className="absolute right-4 top-4 hidden items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-950/80 px-3 py-2 text-xs font-medium text-blue-200 shadow-lg backdrop-blur-md sm:flex">
                <Zap className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>Core Ultra &amp; RTX 40-Series</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
