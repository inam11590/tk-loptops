"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import { dispatchAuthUserUpdate, getInitials } from "@/components/account/UserMenu";
import { updateProfileAction } from "@/lib/actions/auth-actions";
import type { SafeUser } from "@/lib/users";
import {
  profileUpdateSchema,
  type ProfileUpdateFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  user: SafeUser;
}

const MAX_AVATAR_BYTES = 1024 * 1024; // 1 MB

/**
 * Profile management form (/account/profile):
 * - Edit full name, phone, and avatar (initials-based default or image upload as data URL < 1 MB)
 * - Email shown as read-only
 * - Shows a toast on save and updates the header avatar immediately
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const showToast = useCartStore((state) => state.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone ?? "",
      avatarUrl: user.avatarUrl ?? "",
    },
  });

  const currentFullName = watch("fullName") || user.fullName;
  const currentAvatarUrl = watch("avatarUrl");
  const initials = getInitials(currentFullName);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file (PNG, JPG, WebP, or GIF).");
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(
        `Selected image is ${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB. Please choose an image smaller than 1 MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setValue("avatarUrl", result, {
        shouldDirty: true,
        shouldValidate: true,
      });
    };
    reader.onerror = () => {
      setAvatarError("Could not read image file. Please try another file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarError(null);
    setValue("avatarUrl", "", { shouldDirty: true, shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: ProfileUpdateFormValues) => {
    setServerError(null);
    setSavedNotice(false);

    const result = await updateProfileAction(values);
    if (!result.success) {
      setServerError(result.error ?? "Failed to update profile.");
      showToast(result.error ?? "Failed to update profile.", "error");
      return;
    }

    setSavedNotice(true);
    showToast("Profile changes saved!", "success");
    if (result.data?.user) {
      dispatchAuthUserUpdate(result.data.user, "tk-profile-updated");
    }
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-8 rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8"
    >
      {/* Status Banner */}
      <div aria-live="polite" aria-atomic="true">
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-xs leading-relaxed">{serverError}</p>
          </div>
        )}
        {savedNotice && !serverError && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Your profile information has been saved.</span>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {currentAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentAvatarUrl}
              alt={currentFullName}
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-accent/20"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-hero-gradient font-heading text-2xl font-bold text-white shadow-md ring-4 ring-accent/20">
              {initials}
            </span>
          )}

          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-foreground">
              Profile Avatar
            </h3>
            <p className="text-xs text-muted-foreground">
              Displays your initials by default, or upload a custom photo (PNG,
              JPG, WebP under 1 MB).
            </p>
            {avatarError && (
              <p
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {avatarError}
              </p>
            )}
            {errors.avatarUrl && (
              <p
                role="alert"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.avatarUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            id="profile-avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleAvatarFileChange}
            className="sr-only"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 rounded-xl px-4 text-xs font-semibold"
          >
            <Camera className="mr-1.5 h-4 w-4 text-accent" aria-hidden="true" />
            <span>Upload Photo</span>
          </Button>

          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              className="h-10 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-rose-500"
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span>Use Initials</span>
            </Button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="profile-fullName"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="profile-fullName"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "profile-fullName-error" : undefined
              }
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                errors.fullName
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p
              id="profile-fullName-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="profile-phone"
            className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 234-5678"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? "profile-phone-error" : undefined
              }
              className={cn(
                "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                errors.phone
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-input"
              )}
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p
              id="profile-phone-error"
              role="alert"
              className="text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Read-Only Email Address */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="profile-email-readonly"
              className="block text-xs font-semibold uppercase tracking-wider text-foreground/80"
            >
              Email Address (Read-Only)
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Primary Login Identifier
            </span>
          </div>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="profile-email-readonly"
              type="email"
              value={user.email}
              readOnly
              disabled
              aria-readonly="true"
              className="h-11 w-full cursor-not-allowed rounded-xl border border-input bg-secondary/60 pl-10 pr-4 text-sm text-muted-foreground"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Your email address is linked to your order history and warranty
            records and cannot be changed directly.
          </p>
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-5">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={isSubmitting || !isDirty}
          className="h-11 rounded-xl px-6 font-bold shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Saving changes...</span>
            </>
          ) : (
            <span>Save Profile Changes</span>
          )}
        </Button>
      </div>
    </form>
  );
}
