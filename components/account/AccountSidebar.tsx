"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Shield,
  User,
} from "lucide-react";

import {
  dispatchAuthUserUpdate,
  getInitials,
  readClientUserCache,
} from "@/components/account/UserMenu";
import { logoutUserAction } from "@/lib/actions/auth-actions";
import type { SafeUser } from "@/lib/users";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";

interface AccountSidebarProps {
  user: SafeUser;
}

const ACCOUNT_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/account",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: User,
    exact: false,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
    exact: false,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
    exact: false,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    exact: false,
  },
  {
    label: "Security",
    href: "/account/security",
    icon: Shield,
    exact: false,
  },
];

/**
 * Responsive Account navigation:
 * - Desktop (lg+): Sticky vertical sidebar with user profile summary and Logout action.
 * - Mobile (<lg): Compact user header + scrollable tab bar and dropdown selector.
 */
export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<SafeUser>(user);

  useEffect(() => {
    const cached = readClientUserCache();
    const isSame =
      cached &&
      (cached.id === user.id ||
        cached.email.toLowerCase() === user.email.toLowerCase());
    const merged: SafeUser = isSame
      ? {
          ...user,
          fullName: cached.fullName || user.fullName,
          phone: cached.phone || user.phone,
          avatarUrl: cached.avatarUrl || user.avatarUrl,
        }
      : user;

    setCurrentUser(merged);
    dispatchAuthUserUpdate(merged, "tk-auth-changed");
  }, [user]);

  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ user?: SafeUser | null }>;
      if (customEvent.detail?.user) {
        setCurrentUser(customEvent.detail.user);
      } else {
        const cached = readClientUserCache();
        if (cached) setCurrentUser(cached);
      }
    };
    window.addEventListener("tk-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("tk-profile-updated", handleProfileUpdate);
    };
  }, []);

  const initials = getInitials(currentUser.fullName);

  const isActiveLink = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUserAction();
      dispatchAuthUserUpdate(null, "tk-auth-changed");
      showToast("You have been signed out.", "info");
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Navigation (< lg): User Summary + Tab Strip */}
      <div className="space-y-3 lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card">
          <div className="flex min-w-0 items-center gap-3">
            {currentUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-accent/20"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hero-gradient font-heading text-sm font-bold text-white shadow-sm">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold text-foreground">
                {currentUser.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
          >
            {isLoggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>Logout</span>
          </button>
        </div>

        <nav
          aria-label="Account sections"
          className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border/80 bg-card p-1.5 shadow-card no-scrollbar"
        >
          {ACCOUNT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActiveLink(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sticky Sidebar (lg+) */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
          {/* User Identity Card */}
          <div className="flex items-center gap-3.5 border-b border-border/70 pb-4">
            {currentUser.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-accent/25"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hero-gradient font-heading text-base font-bold text-white shadow-sm">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-bold text-foreground">
                {currentUser.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
              <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Verified Member
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Account sidebar navigation">
            <ul className="space-y-1">
              {ACCOUNT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActiveLink(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-accent-foreground" : "text-accent"
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="border-t border-border/70 pt-3">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-rose-400"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
