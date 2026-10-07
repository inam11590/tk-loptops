"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Laptop,
  LayoutDashboard,
  MessageSquareCode,
  Package,
  Settings,
  ShoppingBag,
  TicketPercent,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  pendingOrdersCount?: number;
  pendingReviewsCount?: number;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileOpenChange,
  pendingOrdersCount = 0,
  pendingReviewsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname() || "/admin";

  const navItems: AdminNavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      badgeCount: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      label: "Coupons",
      href: "/admin/coupons",
      icon: TicketPercent,
    },
    {
      label: "Reviews",
      href: "/admin/reviews",
      icon: MessageSquareCode,
      badgeCount: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
    },
    {
      label: "Activity",
      href: "/admin/activity",
      icon: Activity,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderLinks = (isMobile = false) => (
    <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile) onMobileOpenChange(false);
            }}
            title={collapsed && !isMobile ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-accent text-accent-foreground shadow-sm shadow-blue-600/20"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
              collapsed && !isMobile && "justify-center px-2"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                active
                  ? "text-accent-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {(!collapsed || isMobile) && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {item.badgeCount !== undefined && (!collapsed || isMobile) && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                {item.badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        aria-label="Admin sidebar"
        className={cn(
          "hidden shrink-0 flex-col border-r border-border/80 bg-card transition-all duration-300 lg:flex print:hidden",
          collapsed ? "w-[74px]" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center justify-between border-b border-border/80 px-4",
            collapsed && "justify-center px-2"
          )}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
              <Laptop className="h-4 w-4 text-blue-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-extrabold tracking-tight text-foreground">
                  TK <span className="text-accent">Admin</span>
                </p>
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Store Control
                </p>
              </div>
            )}
          </Link>
        </div>

        {renderLinks(false)}

        {/* Collapse Toggle Footer */}
        <div className="border-t border-border/80 p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "w-full justify-start gap-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className=" flex w-72 flex-col p-0">
          <SheetHeader className="border-b border-border/80 px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                <Laptop className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <span className="block font-heading text-sm font-extrabold text-foreground">
                  TK <span className="text-accent">Admin</span>
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Store Management
                </span>
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between admin dashboard sections
            </SheetDescription>
          </SheetHeader>
          {renderLinks(true)}
        </SheetContent>
      </Sheet>
    </>
  );
}
