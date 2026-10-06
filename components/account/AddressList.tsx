"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Edit3,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { AddressForm } from "@/components/account/AddressForm";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/auth-actions";
import type { SavedAddress } from "@/lib/users";
import { MAX_SAVED_ADDRESSES } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AddressListProps {
  initialAddresses: SavedAddress[];
  defaultFullName: string;
  defaultPhone: string;
}

/**
 * Address Book manager (/account/addresses):
 * - Displays saved addresses (up to max 5)
 * - Supports Add, Edit, Delete, and Set Default in an accessible modal form
 */
export function AddressList({
  initialAddresses,
  defaultFullName,
  defaultPhone,
}: AddressListProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);

  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const canAddMore = addresses.length < MAX_SAVED_ADDRESSES;

  const handleOpenAdd = () => {
    if (!canAddMore) {
      showToast(
        `You can save up to ${MAX_SAVED_ADDRESSES} addresses. Edit or delete one first.`,
        "warning"
      );
      return;
    }
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSetDefault = async (addressId: string) => {
    setBusyId(addressId);
    try {
      const result = await setDefaultAddressAction(addressId);
      if (result.success && result.data) {
        setAddresses(result.data.addresses);
        showToast("Default shipping address updated.", "success");
        router.refresh();
      } else {
        showToast(result.error ?? "Failed to update default address.", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (addressId: string) => {
    setBusyId(addressId);
    try {
      const result = await deleteAddressAction(addressId);
      if (result.success && result.data) {
        setAddresses(result.data.addresses);
        showToast("Address removed from your account.", "info");
        router.refresh();
      } else {
        showToast(result.error ?? "Failed to remove address.", "error");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Saved Shipping Addresses
          </h2>
          <p className="text-xs text-muted-foreground">
            {addresses.length} of {MAX_SAVED_ADDRESSES} addresses saved • Your
            default address is automatically prefilled at checkout.
          </p>
        </div>

        <Button
          type="button"
          variant="accent"
          size="sm"
          disabled={!canAddMore}
          onClick={handleOpenAdd}
          className="h-10 rounded-xl px-4 text-xs font-bold shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          <span>
            {canAddMore
              ? "Add New Address"
              : `Limit Reached (${MAX_SAVED_ADDRESSES}/${MAX_SAVED_ADDRESSES})`}
          </span>
        </Button>
      </div>

      {/* Empty State */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-heading text-base font-bold text-foreground">
            No Saved Addresses Yet
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Add your home or office delivery address now for faster one-click
            checkout on your next laptop order.
          </p>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleOpenAdd}
            className="mt-5 h-10 rounded-xl px-5 text-xs font-bold"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            <span>Add Your First Address</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => {
            const isBusy = busyId === addr.id;
            return (
              <article
                key={addr.id}
                className={cn(
                  "flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-card transition-all",
                  addr.isDefault
                    ? "border-accent/60 ring-1 ring-accent/20"
                    : "border-border/80"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-bold">
                        {addr.label}
                      </Badge>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="font-heading font-bold text-foreground">
                      {addr.fullName}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {addr.streetAddress}
                      {addr.apartment ? `, ${addr.apartment}` : ""}
                      <br />
                      {addr.city}, {addr.stateProvince} {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                    <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-foreground/80">
                      <Phone
                        className="h-3.5 w-3.5 text-accent"
                        aria-hidden="true"
                      />
                      <span>{addr.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleOpenEdit(addr)}
                      className="h-8 rounded-xl px-3 text-xs font-semibold"
                    >
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </Button>

                    {!addr.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleSetDefault(addr.id)}
                        className="h-8 rounded-xl px-3 text-xs font-semibold text-accent hover:bg-accent/10"
                      >
                        {isBusy ? (
                          <Loader2
                            className="mr-1.5 h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Star
                            className="mr-1.5 h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        <span>Set Default</span>
                      </Button>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleDelete(addr.id)}
                    aria-label={`Delete ${addr.label} address`}
                    className="h-8 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <AddressForm
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialAddress={editingAddress}
        defaultFullName={defaultFullName}
        defaultPhone={defaultPhone}
        onSaved={(updated) => {
          setAddresses(updated);
          router.refresh();
        }}
      />
    </div>
  );
}
