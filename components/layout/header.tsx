"use client";

import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { useShopStore } from "@/store/use-store";
import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/layout/mobile-nav";

/**
 * Sticky global header with TK Laptop logo, search input, desktop navigation links,
 * theme toggle, wishlist, shopping cart (with item count badge), and account button.
 */
export function Header() {
  const cartItems = useShopStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

        {/* Right: Search Bar + Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Search Input */}
          <form
            role="search"
            aria-label="Search laptops"
            onSubmit={(e) => e.preventDefault()}
            className="relative hidden w-56 xl:block 2xl:w-72"
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search HP or Dell laptops..."
              aria-label="Search HP or Dell laptops"
              className="h-10 rounded-xl pl-10 pr-4 text-sm"
            />
          </form>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wishlist Icon Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            title="Wishlist"
            className="text-foreground/80 hover:text-foreground"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Cart Icon Button with Item Count Badge */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Shopping cart with ${cartCount} items`}
            title="Shopping cart"
            className="relative text-foreground/80 hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span
              aria-live="polite"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground shadow-sm"
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
