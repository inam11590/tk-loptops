"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { cn } from "@/lib/utils";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";

/**
 * Sticky global header with TK Laptop logo, live debounced SearchBar,
 * desktop navigation links, theme toggle, wishlist link with animated badge,
 * and shopping cart trigger with animated item count badge.
 */
export function Header() {
  const hydrated = useHydrated();

  const cartItems = useCartStore((state) => state.items);
  const setMiniCartOpen = useCartStore((state) => state.setMiniCartOpen);
  const wishlistIds = useWishlistStore((state) => state.items);

  const cartCount = hydrated
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const wishlistCount = hydrated ? wishlistIds.length : 0;

  const [cartBounce, setCartBounce] = useState(false);
  const [wishlistBounce, setWishlistBounce] = useState(false);

  useEffect(() => {
    if (!hydrated || cartCount === 0) return;
    setCartBounce(true);
    const t = setTimeout(() => setCartBounce(false), 450);
    return () => clearTimeout(t);
  }, [cartCount, hydrated]);

  useEffect(() => {
    if (!hydrated || wishlistCount === 0) return;
    setWishlistBounce(true);
    const t = setTimeout(() => setWishlistBounce(false), 450);
    return () => clearTimeout(t);
  }, [wishlistCount, hydrated]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <Container className="flex h-20 items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav />
          <Logo />
        </div>

        {/* Center: Primary Navigation Links (Desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {SITE_CONFIG.navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Live Debounced Search Bar + Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <SearchBar className="hidden w-60 md:block xl:w-72" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist Icon Link with Live Badge */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative text-foreground/80 hover:text-foreground"
          >
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} saved items`}
              title="Wishlist"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  wishlistCount > 0 && "text-rose-500"
                )}
                aria-hidden="true"
              />
              {wishlistCount > 0 && (
                <span
                  aria-live="polite"
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-sm transition-transform",
                    wishlistBounce && "animate-bounce"
                  )}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Cart Icon Button (opens MiniCart drawer) with Animated Item Count Badge */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMiniCartOpen(true)}
            aria-label={`Open shopping cart with ${cartCount} items`}
            title="Shopping cart"
            className="relative text-foreground/80 hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span
              aria-live="polite"
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground shadow-sm transition-transform",
                cartBounce && "animate-bounce"
              )}
            >
              {cartCount}
            </span>
          </Button>

          {/* Account Icon Button */}
          <Button
            variant="outline"
            size="icon"
            aria-label="User account"
            title="Account"
            className="hidden sm:inline-flex"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </Container>
    </header>
  );
}
