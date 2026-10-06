"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Shield,
  User,
} from "lucide-react";

import { logoutUserAction } from "@/lib/actions/auth-actions";
import type { SafeUser } from "@/lib/users";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TK";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

/**
 * Header account control:
 * - Shows a smooth skeleton while checking session state (no layout shift or flicker)
 * - Shows "Login / Register" when logged out
 * - Shows an avatar dropdown (My Account, My Orders, Wishlist, Addresses, Security, Logout) when logged in
 * - Automatically merges the localStorage wishlist with the user's saved server wishlist on login
 */
export function UserMenu() {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);
  const syncWithServerWishlist = useWishlistStore(
    (state) => state.syncWithServerWishlist
  );

  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const syncedUserIdRef = useRef<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/account/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { user: SafeUser | null };
      setUser(data.user ?? null);

      if (data.user && syncedUserIdRef.current !== data.user.id) {
        syncedUserIdRef.current = data.user.id;
        await syncWithServerWishlist(data.user.wishlistProductIds ?? []);
      } else if (!data.user) {
        syncedUserIdRef.current = null;
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncWithServerWishlist]);

  useEffect(() => {
    void fetchCurrentUser();

    const handleAuthOrProfileChange = () => {
      void fetchCurrentUser();
    };

    window.addEventListener("tk-auth-changed", handleAuthOrProfileChange);
    window.addEventListener("tk-profile-updated", handleAuthOrProfileChange);
    return () => {
      window.removeEventListener("tk-auth-changed", handleAuthOrProfileChange);
      window.removeEventListener(
        "tk-profile-updated",
        handleAuthOrProfileChange
      );
    };
  }, [fetchCurrentUser]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    try {
      await logoutUserAction();
      setUser(null);
      syncedUserIdRef.current = null;
      window.dispatchEvent(new Event("tk-auth-changed"));
      showToast("You have been signed out.", "info");
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-pulse rounded-xl border border-border/60 bg-secondary/50 sm:w-28"
      />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden h-10 rounded-xl px-3.5 text-xs font-semibold sm:inline-flex"
        >
          <Link href="/login">
            <User className="mr-1.5 h-4 w-4 text-accent" aria-hidden="true" />
            <span>Login / Register</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl sm:hidden"
        >
          <Link href="/login" aria-label="Login or Register" title="Sign In">
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  const initials = getInitials(user.fullName);
  const firstName = user.fullName.split(" ")[0] || "Account";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.fullName}`}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-card px-2 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-accent/50 hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-hero-gradient text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[96px] truncate sm:inline">
          {firstName}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 text-muted-foreground transition-transform sm:inline",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User account options"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border/80 bg-card p-2 text-card-foreground shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Info Header */}
          <div className="border-b border-border/70 px-3 py-2.5">
            <p className="truncate text-sm font-bold text-foreground">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <div className="py-1.5">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              <LayoutDashboard
                className="h-4 w-4 text-accent"
                aria-hidden="true"
              />
              <span>My Account</span>
            </Link>

            <Link
              href="/account/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              <Package className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account/wishlist"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/account/addresses"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Saved Addresses</span>
            </Link>

            <Link
              href="/account/security"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary hover:text-accent"
            >
              <Shield className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Security Settings</span>
            </Link>
          </div>

          <div className="border-t border-border/70 pt-1.5">
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
