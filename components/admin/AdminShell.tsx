"use client";

import { useState } from "react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { PendingActionsSummary } from "@/lib/admin/stats";

interface AdminShellProps {
  adminUser: {
    name: string;
    email: string;
    image?: string;
  };
  pendingActions: PendingActionsSummary;
  children: React.ReactNode;
}

export function AdminShell({
  adminUser,
  pendingActions,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface/40 text-foreground">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        pendingOrdersCount={pendingActions.ordersAwaitingConfirmation}
        pendingReviewsCount={pendingActions.unapprovedReviews}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          adminUser={adminUser}
          pendingActions={pendingActions}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <AdminBreadcrumbs />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
