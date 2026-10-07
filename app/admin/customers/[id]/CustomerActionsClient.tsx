"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  toggleCustomerDisabledAction,
  updateCustomerRoleAction,
} from "@/lib/actions/admin-actions";
import type { SafeUser } from "@/lib/users";

interface CustomerActionsClientProps {
  customer: SafeUser;
  isLastActiveAdmin: boolean;
}

export function CustomerActionsClient({
  customer,
  isLastActiveAdmin,
}: CustomerActionsClientProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [confirmRoleOpen, setConfirmRoleOpen] = useState(false);

  const isDisabled = Boolean(customer.disabled);
  const isAdmin = customer.role === "admin";

  const handleToggleDisable = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await toggleCustomerDisabledAction(customer.id, !isDisabled);
      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to update account status.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: isDisabled
          ? "Customer account re-enabled."
          : "Customer account disabled. They can no longer sign in.",
      });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmDisableOpen(false);
    }
  };

  const handleToggleRole = async () => {
    setBusy(true);
    setFeedback(null);
    const nextRole = isAdmin ? "customer" : "admin";
    try {
      const res = await updateCustomerRoleAction(customer.id, nextRole);
      if (!res.success) {
        setFeedback({
          type: "error",
          text: res.error ?? "Failed to update role.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: `Role updated to ${nextRole.toUpperCase()}.`,
      });
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmRoleOpen(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card">
      <h3 className="font-heading text-sm font-bold text-foreground">
        Access &amp; Security Controls
      </h3>

      {feedback && (
        <div
          role="status"
          className={`rounded-xl border p-3 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {isLastActiveAdmin && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <strong>Protected Account:</strong> This is the last active
          administrator account and cannot be demoted or disabled.
        </div>
      )}

      {/* Role Promotion / Demotion */}
      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="text-xs font-semibold text-foreground">
          Role Permission:{" "}
          <span className="uppercase text-accent">
            {isAdmin ? "Admin" : "Customer"}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Administrators have full access to products, orders, customers, and
          store settings.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || isLastActiveAdmin}
          onClick={() => setConfirmRoleOpen(true)}
          className="w-full gap-1.5 rounded-xl text-xs font-semibold"
        >
          {isAdmin ? (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>Demote to Customer</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span>Promote to Admin</span>
            </>
          )}
        </Button>
      </div>

      {/* Account Enable / Disable */}
      <div className="space-y-2 border-t border-border/60 pt-3">
        <p className="text-xs font-semibold text-foreground">
          Login Access:{" "}
          <span className={isDisabled ? "text-rose-500" : "text-emerald-500"}>
            {isDisabled ? "Disabled" : "Enabled"}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Disabling an account blocks login and revokes protected access
          immediately.
        </p>
        <Button
          type="button"
          variant={isDisabled ? "accent" : "destructive"}
          size="sm"
          disabled={busy || (!isDisabled && isLastActiveAdmin)}
          onClick={() => setConfirmDisableOpen(true)}
          className="w-full gap-1.5 rounded-xl text-xs font-semibold"
        >
          {isDisabled ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Enable Customer Account</span>
            </>
          ) : (
            <>
              <Ban className="h-3.5 w-3.5" />
              <span>Disable Customer Account</span>
            </>
          )}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDisableOpen}
        title={isDisabled ? "Re-enable Account?" : "Disable Customer Account?"}
        description={
          isDisabled
            ? `Allow ${customer.fullName} (${customer.email}) to sign in again?`
            : `Are you sure you want to disable ${customer.fullName} (${customer.email})? They will not be able to log in while disabled.`
        }
        confirmLabel={isDisabled ? "Enable Account" : "Disable Account"}
        variant={isDisabled ? "default" : "destructive"}
        loading={busy}
        onConfirm={handleToggleDisable}
        onCancel={() => setConfirmDisableOpen(false)}
      />

      <ConfirmDialog
        open={confirmRoleOpen}
        title={isAdmin ? "Demote Admin to Customer?" : "Promote to Admin?"}
        description={
          isAdmin
            ? `Remove admin privileges from ${customer.fullName} (${customer.email})?`
            : `Grant full store administration privileges to ${customer.fullName} (${customer.email})?`
        }
        confirmLabel={isAdmin ? "Demote to Customer" : "Promote to Admin"}
        variant={isAdmin ? "destructive" : "default"}
        loading={busy}
        onConfirm={handleToggleRole}
        onCancel={() => setConfirmRoleOpen(false)}
      />
    </div>
  );
}
