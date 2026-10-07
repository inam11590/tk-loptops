"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ExternalLink,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PendingActionsSummary } from "@/lib/admin/stats";

interface AdminTopbarProps {
  adminUser: {
    name: string;
    email: string;
    image?: string;
  };
  pendingActions: PendingActionsSummary;
  onOpenMobileMenu: () => void;
}

const QUICK_ROUTES = [
  { label: "Dashboard Overview", href: "/admin", keywords: "stats revenue kpi home" },
  { label: "All Products", href: "/admin/products", keywords: "laptops inventory stock catalog" },
  { label: "Add New Product", href: "/admin/products/new", keywords: "create laptop upload" },
  { label: "Orders Management", href: "/admin/orders", keywords: "sales shipping invoice status" },
  { label: "Customers Directory", href: "/admin/customers", keywords: "users accounts roles" },
  { label: "Coupons & Discounts", href: "/admin/coupons", keywords: "promo codes voucher" },
  { label: "Reviews Moderation", href: "/admin/reviews", keywords: "ratings feedback approve" },
  { label: "Activity & Audit Log", href: "/admin/activity", keywords: "history security logs" },
  { label: "Store Settings", href: "/admin/settings", keywords: "tax shipping bank cod" },
];

export function AdminTopbar({
  adminUser,
  pendingActions,
  onOpenMobileMenu,
}: AdminTopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRoutes = QUICK_ROUTES.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/admin/products?q=${encodeURIComponent(q)}`);
  };

  const initials = adminUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-6 print:hidden">
      {/* Left: Mobile Drawer Trigger + Quick Search */}
      <div className="flex flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onOpenMobileMenu}
          aria-label="Open admin navigation drawer"
          className="h-9 w-9 rounded-xl lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div ref={searchRef} className="relative w-full max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Jump to admin page or search products..."
              aria-label="Search admin panel"
              className="h-9 rounded-xl pl-9 text-xs sm:text-sm"
            />
          </form>

          {searchOpen && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
              <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Navigation
              </p>
              <ul className="max-h-60 overflow-y-auto">
                {filteredRoutes.map((route) => (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      <span>{route.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {route.href}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="mt-1 flex w-full items-center justify-between rounded-lg border-t border-border/60 px-2.5 py-2 text-xs font-semibold text-accent hover:bg-accent/10"
                >
                  <span>Search products for &ldquo;{searchQuery}&rdquo;</span>
                  <span>Enter ↵</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: View Store, Notifications Bell, Theme Toggle, Admin User Menu */}
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden h-9 gap-1.5 rounded-xl text-xs font-semibold sm:inline-flex"
        >
          <Link href="/">
            <span>View Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </Button>

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Pending store notifications"
            aria-expanded={notifOpen}
            className="relative h-9 w-9 rounded-xl"
          >
            <Bell className="h-4 w-4" />
            {pendingActions.totalPending > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {pendingActions.totalPending}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <p className="font-heading text-xs font-bold text-foreground">
                  Pending Actions
                </p>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {pendingActions.totalPending} pending
                </span>
              </div>

              <div className="mt-2 space-y-1.5 text-xs">
                <Link
                  href="/admin/orders?status=Pending"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-surface"
                >
                  <span className="text-muted-foreground">
                    Orders awaiting confirmation
                  </span>
                  <span className="font-bold text-foreground">
                    {pendingActions.ordersAwaitingConfirmation}
                  </span>
                </Link>
                <Link
                  href="/admin/orders?paymentMethod=bank_transfer"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-surface"
                >
                  <span className="text-muted-foreground">
                    Pending bank transfers
                  </span>
                  <span className="font-bold text-foreground">
                    {pendingActions.pendingBankTransfers}
                  </span>
                </Link>
                <Link
                  href="/admin/reviews?status=Pending"
                  onClick={() => setNotifOpen(false)}
                  className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-surface"
                >
                  <span className="text-muted-foreground">
                    Unapproved customer reviews
                  </span>
                  <span className="font-bold text-foreground">
                    {pendingActions.unapprovedReviews}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* Admin Avatar Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Admin account menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-2.5 py-1.5 text-left transition-colors hover:border-accent/50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {initials || "AD"}
            </div>
            <div className="hidden sm:block">
              <p className="max-w-[120px] truncate text-xs font-bold leading-none text-foreground">
                {adminUser.name}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Administrator
              </p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
              <div className="border-b border-border/60 px-3 py-2">
                <p className="truncate text-xs font-bold text-foreground">
                  {adminUser.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {adminUser.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                >
                  <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Customer Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Store Settings</span>
                </Link>
                <Link
                  href="/admin/activity"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-surface"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Audit Activity Log</span>
                </Link>
              </div>

              <div className="border-t border-border/60 pt-1">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
