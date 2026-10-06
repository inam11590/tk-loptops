"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { deleteAccountAction } from "@/lib/actions/auth-actions";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteAccountDialogProps {
  userEmail: string;
}

/**
 * Confirmation dialog for permanent account deletion (/account/security).
 * Requires typing the user's email address or the word DELETE.
 */
export function DeleteAccountDialog({ userEmail }: DeleteAccountDialogProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);

  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const trimmed = confirmationText.trim();
  const isConfirmed =
    trimmed === "DELETE" || trimmed.toLowerCase() === userEmail.toLowerCase();

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfirmed) {
      setError(`Please type "DELETE" or "${userEmail}" to confirm.`);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccountAction({
        confirmation: trimmed,
      });

      if (!result.success) {
        setError(result.error ?? "Could not delete your account.");
        setIsDeleting(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tk-auth-changed"));
      }
      setOpen(false);
      showToast("Your account has been permanently deleted.", "info");
      router.push("/");
      router.refresh();
    } catch {
      setError("Unexpected error while deleting account.");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setConfirmationText("");
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-10 rounded-xl px-4 text-xs font-bold"
        >
          <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span>Delete My Account</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Delete Your Account?</span>
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            This action is permanent and cannot be undone. Your saved addresses,
            profile settings, and synced wishlist for{" "}
            <strong className="text-foreground">{userEmail}</strong> will be
            permanently removed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmDelete} className="mt-3 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="delete-account-confirmation"
              className="block text-xs font-semibold text-foreground"
            >
              Type{" "}
              <code className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                DELETE
              </code>{" "}
              or{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px]">
                {userEmail}
              </code>{" "}
              to confirm:
            </label>
            <input
              id="delete-account-confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value);
                setError(null);
              }}
              placeholder="Type DELETE or your email"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "delete-account-error" : undefined
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {error && (
              <p
                id="delete-account-error"
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-border/70 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isConfirmed || isDeleting}
              className="h-10 rounded-xl px-5 text-xs font-bold"
            >
              {isDeleting ? (
                <>
                  <Loader2
                    className="mr-1.5 h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Permanently Delete Account</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
