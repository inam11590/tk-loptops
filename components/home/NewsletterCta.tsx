"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 9. Newsletter CTA
 * Full-width gradient section with email input, subscribe button,
 * frontend email validation, and confirmation state.
 */
export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address (e.g., alex@company.com).");
      return;
    }

    setError(null);
    setSubmittedEmail(trimmed);
    setEmail("");
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-hero-gradient py-16 text-white sm:py-20"
    >
      {/* Decorative radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-3xl"
      />

      <Container className="relative z-10">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="border-blue-400/35 bg-blue-500/15 px-3.5 py-1 text-xs font-semibold text-blue-200"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              VIP Hardware Insider List
            </Badge>

            <h2
              id="newsletter-heading"
              className="mt-4 font-heading text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              Unlock Early Access to HP &amp; Dell Flash Deals
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Join over 18,000 tech buyers receiving weekly restock alerts,
              exclusive member coupon codes, and deep-dive benchmark comparisons
              from {SITE_CONFIG.name}.
            </p>

            {submittedEmail ? (
              <div
                role="status"
                aria-live="polite"
                className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-5 py-4 text-left text-sm text-emerald-100 backdrop-blur-sm"
              >
                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-white">
                    You&apos;re on the list!
                  </p>
                  <p className="text-xs text-emerald-200">
                    We&apos;ve sent a welcome confirmation to{" "}
                    <span className="font-semibold text-white">
                      {submittedEmail}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={handleSubmit}
                className="mx-auto mt-8 max-w-lg"
                aria-label="Subscribe to TK Laptop newsletter"
              >
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your work or personal email"
                      aria-label="Email address"
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error ? "newsletter-error" : "newsletter-privacy"
                      }
                      className="h-12 border-white/20 bg-white/10 pl-10 text-white placeholder:text-slate-300 focus-visible:border-blue-400 focus-visible:bg-white/15"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="h-12 shrink-0 px-7 shadow-lg shadow-blue-600/30"
                  >
                    Subscribe Now
                  </Button>
                </div>

                {error && (
                  <p
                    id="newsletter-error"
                    role="alert"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-rose-300"
                  >
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{error}</span>
                  </p>
                )}

                <p
                  id="newsletter-privacy"
                  className="mt-3 text-xs text-slate-400"
                >
                  Zero spam. Unsubscribe in one click at any time.
                </p>
              </form>
            )}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
