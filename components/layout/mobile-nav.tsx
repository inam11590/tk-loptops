"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Menu,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/layout/search-bar";

/**
 * Responsive mobile navigation drawer (hamburger menu) with live debounced search,
 * main category navigation links, and account/wishlist/cart quick links.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const hydrated = useHydrated();
  const cartItems = useCartStore((state) => state.items);
  const wishlistIds = useWishlistStore((state) => state.items);

  const cartCount = hydrated
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const wishlistCount = hydrated ? wishlistIds.length : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[86vw] max-w-sm flex-col justify-between overflow-y-auto p-6"
      >
        <div className="space-y-6">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle asChild>
              <div>
                <Logo />
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Mobile navigation menu for {SITE_CONFIG.name}, including search
              and product category links.
            </SheetDescription>
          </SheetHeader>

          {/* Mobile Live Search Bar */}
          <SearchBar onNavigate={() => setOpen(false)} />

          {/* Primary Navigation Links */}
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1">
              {SITE_CONFIG.navLinks.map((item) => (
                <li key={item.label}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Account, Wishlist & Cart Actions */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="px-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Store
            </p>
            <div className="grid grid-cols-3 gap-2">
              <SheetClose asChild>
                <Link
                  href="/wishlist"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/cart"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <ShoppingBag
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  <span>Cart ({cartCount})</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/account"
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-surface p-3 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <User className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Account</span>
                </Link>
              </SheetClose>
            </div>
          </div>
        </div>

        {/* Support Footer inside Drawer */}
        <div className="mt-6 rounded-xl bg-surface p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Need expert laptop advice?</span>
          </div>
          <p className="mt-1">{SITE_CONFIG.contact.hours}</p>
          <a
            href={`tel:${SITE_CONFIG.contact.phone}`}
            className="mt-2 inline-block font-semibold text-accent hover:underline"
          >
            {SITE_CONFIG.contact.phone}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
