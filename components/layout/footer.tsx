"use client";

import Link from "next/link";
import {
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Global 4-column footer featuring:
 * 1. About TK Laptop
 * 2. Shop (HP, Dell, Deals)
 * 3. Customer Care (Shipping, Returns, Warranty, FAQ)
 * 4. Contact & Newsletter Signup
 * Plus payment method badges and copyright bar.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      aria-labelledby="footer-heading"
      className="border-t border-white/10 bg-brand-navy text-slate-300"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <Container className="py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: About TK Laptop */}
          <div className="space-y-4 lg:col-span-4">
            <Logo variant="light" />
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              {SITE_CONFIG.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                <ShieldCheck
                  className="h-4 w-4 text-blue-400"
                  aria-hidden="true"
                />
                100% Genuine Units
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                <Lock className="h-4 w-4 text-blue-400" aria-hidden="true" />
                Encrypted Checkout
              </span>
            </div>
          </div>

          {/* Column 2: Shop (HP, Dell, Deals) */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (Shipping, Returns, Warranty, FAQ) */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
              Customer Care
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SITE_CONFIG.footerLinks.customerCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter Signup */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
              Contact &amp; Newsletter
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <span>{SITE_CONFIG.contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${SITE_CONFIG.contact.phone}`}
                  className="transition-colors hover:text-white"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail
                  className="h-4 w-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="transition-colors hover:text-white"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
            </ul>

            {/* Newsletter Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
              className="pt-2"
            >
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Get exclusive HP &amp; Dell price-drop alerts:
              </label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  className="border-white/15 bg-white/5 text-white placeholder:text-slate-400 focus-visible:bg-white/10"
                />
                <Button
                  type="submit"
                  variant="accent"
                  aria-label="Subscribe to newsletter"
                  className="shrink-0 px-3.5"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Join</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Method Badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>
            &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved. HP and
            Dell are registered trademarks of their respective owners.
          </p>

          <div
            aria-label="Accepted payment methods"
            className="flex flex-wrap items-center gap-2"
          >
            {SITE_CONFIG.paymentMethods.map((method) => (
              <span
                key={method}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-slate-300"
              >
                {method === "Apple Pay" || method === "PayPal" ? (
                  <Wallet
                    className="h-3.5 w-3.5 text-blue-400"
                    aria-hidden="true"
                  />
                ) : (
                  <CreditCard
                    className="h-3.5 w-3.5 text-blue-400"
                    aria-hidden="true"
                  />
                )}
                <span>{method}</span>
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
