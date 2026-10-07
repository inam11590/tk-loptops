"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import { linkGuestOrdersToUser } from "@/lib/orders";
import {
  clearLoginAttempts,
  consumePasswordResetToken,
  createPasswordResetToken,
  createUser,
  deleteUser,
  deleteUserAddress,
  getLoginLockoutStatus,
  getSafeUserById,
  getSafeUserFromSession,
  getUserByEmail,
  getUserById,
  mergeUserWishlist,
  recordFailedLoginAttempt,
  setDefaultUserAddress,
  setUserWishlist,
  updateUser,
  updateUserPassword,
  upsertUserAddress,
  verifyUserPassword,
  type SavedAddress,
  type SafeUser,
} from "@/lib/users";
import {
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
  savedAddressFormSchema,
  type ChangePasswordFormValues,
  type DeleteAccountFormValues,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type ProfileUpdateFormValues,
  type RegisterFormValues,
  type ResetPasswordFormValues,
  type SavedAddressFormValues,
} from "@/lib/validations/auth";

export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  data?: T;
}

/**
 * Registers a new user account, links any past guest orders matching the email,
 * dispatches a welcome email, and signs the user in.
 */
export async function registerUserAction(
  rawValues: RegisterFormValues
): Promise<ActionResult<{ user: SafeUser; linkedOrdersCount: number }>> {
  const parsed = registerSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your registration details.",
      code: "VALIDATION_ERROR",
    };
  }

  const { fullName, email, phone, password } = parsed.data;
  const existing = getUserByEmail(email);
  if (existing) {
    return {
      success: false,
      error: "An account with this email address already exists. Please sign in instead.",
      code: "DUPLICATE_EMAIL",
    };
  }

  try {
    const newUser = await createUser({
      fullName,
      email,
      phone,
      password,
      provider: "credentials",
    });

    const linkedOrdersCount = linkGuestOrdersToUser(newUser.email, newUser.id);
    await sendWelcomeEmail({
      email: newUser.email,
      fullName: newUser.fullName,
      temporaryPasswordNote:
        linkedOrdersCount > 0
          ? `We linked ${linkedOrdersCount} previous guest ${
              linkedOrdersCount === 1 ? "order" : "orders"
            } to your new account.`
          : undefined,
    });

    await signIn("credentials", {
      email: newUser.email,
      password,
      redirect: false,
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      message:
        linkedOrdersCount > 0
          ? `Account created! We also linked ${linkedOrdersCount} earlier ${
              linkedOrdersCount === 1 ? "order" : "orders"
            } to your account.`
          : "Welcome to TK Laptop! Your account has been created.",
      data: { user: newUser, linkedOrdersCount },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_EMAIL") {
      return {
        success: false,
        error: "An account with this email address already exists.",
        code: "DUPLICATE_EMAIL",
      };
    }
    return {
      success: false,
      error: "Could not complete registration. Please try again.",
    };
  }
}

/**
 * Authenticates a user with email & password, enforcing 5-attempt lockout rate limiting.
 */
export async function loginUserAction(
  rawValues: LoginFormValues
): Promise<
  ActionResult<{
    user: SafeUser;
    remainingAttempts?: number;
    retryAfterSeconds?: number;
  }>
> {
  const parsed = loginSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limiter first
  const lockout = getLoginLockoutStatus(normalizedEmail);
  if (lockout.locked) {
    const minutes = Math.max(1, Math.ceil(lockout.retryAfterSeconds / 60));
    return {
      success: false,
      error: `Too many failed login attempts. For your security, login for this email is temporarily paused for ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      }. You can also use "Forgot password" to reset your password.`,
      code: "ACCOUNT_LOCKED",
      data: {
        user: null as unknown as SafeUser,
        remainingAttempts: 0,
        retryAfterSeconds: lockout.retryAfterSeconds,
      },
    };
  }

  const user = getUserByEmail(normalizedEmail);
  if (!user) {
    const attempt = recordFailedLoginAttempt(normalizedEmail);
    if (attempt.locked) {
      return {
        success: false,
        error:
          "Too many failed login attempts (5 of 5). For your security, this account is temporarily locked for 15 minutes.",
        code: "ACCOUNT_LOCKED",
      };
    }
    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    };
  }

  if (user.disabled) {
    return {
      success: false,
      error:
        "This account has been disabled by an administrator. Please contact customer support for assistance.",
      code: "ACCOUNT_DISABLED",
    };
  }

  const isPasswordValid = await verifyUserPassword(user, password);
  if (!isPasswordValid) {
    const attempt = recordFailedLoginAttempt(normalizedEmail);
    if (attempt.locked) {
      return {
        success: false,
        error:
          "Too many failed login attempts (5 of 5). For your security, this account is temporarily locked for 15 minutes.",
        code: "ACCOUNT_LOCKED",
      };
    }
    return {
      success: false,
      error: "Invalid email or password.",
      code: "INVALID_CREDENTIALS",
    };
  }

  try {
    clearLoginAttempts(normalizedEmail);
    linkGuestOrdersToUser(user.email, user.id);

    await signIn("credentials", {
      email: user.email,
      password,
      redirect: false,
    });

    revalidatePath("/", "layout");
    const safe = getSafeUserById(user.id)!;

    return {
      success: true,
      message: `Welcome back, ${safe.fullName.split(" ")[0]}!`,
      data: { user: safe },
    };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        success: false,
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      };
    }
    throw err;
  }
}

/**
 * Signs the current user out without clearing their localStorage cart.
 */
export async function logoutUserAction(): Promise<ActionResult> {
  await signOut({ redirect: false });
  revalidatePath("/", "layout");
  return { success: true, message: "You have been signed out." };
}

/**
 * Generates a 30-minute password reset token and logs the link via /lib/email.ts.
 * Always returns a neutral success message so it never reveals whether the email exists.
 */
export async function requestPasswordResetAction(
  rawValues: ForgotPasswordFormValues
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
      code: "VALIDATION_ERROR",
    };
  }

  const tokenResult = createPasswordResetToken(parsed.data.email);
  if (tokenResult) {
    await sendPasswordResetEmail({
      email: tokenResult.user.email,
      fullName: tokenResult.user.fullName,
      token: tokenResult.token,
      expiresAt: tokenResult.expiresAt,
    });
  }

  return {
    success: true,
    message:
      "If an account exists for that email address, we have sent a password reset link (valid for 30 minutes). Check the server console in development mode.",
  };
}

/**
 * Resets a user's password using a valid, non-expired reset token.
 */
export async function resetPasswordWithTokenAction(
  rawValues: ResetPasswordFormValues
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your new password.",
      code: "VALIDATION_ERROR",
    };
  }

  const result = await consumePasswordResetToken(
    parsed.data.token,
    parsed.data.password
  );
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      code: "INVALID_OR_EXPIRED_TOKEN",
    };
  }

  return {
    success: true,
    message: "Your password has been updated! You can now sign in with your new password.",
  };
}

/**
 * Updates the logged-in user's profile (name, phone, avatarUrl).
 */
export async function updateProfileAction(
  rawValues: ProfileUpdateFormValues
): Promise<ActionResult<{ user: SafeUser }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to update your profile.",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = profileUpdateSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile data.",
      code: "VALIDATION_ERROR",
    };
  }

  getSafeUserFromSession(session.user);

  const updated = updateUser(session.user.id, {
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    avatarUrl: parsed.data.avatarUrl,
  });

  if (!updated) {
    return {
      success: false,
      error: "Account not found.",
      code: "NOT_FOUND",
    };
  }

  revalidatePath("/account", "layout");
  return {
    success: true,
    message: "Profile updated successfully.",
    data: { user: updated },
  };
}

/**
 * Adds or updates a saved address for the logged-in user (max 5).
 */
export async function upsertAddressAction(
  rawValues: SavedAddressFormValues
): Promise<ActionResult<{ addresses: SavedAddress[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to manage addresses.",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = savedAddressFormSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the address fields.",
      code: "VALIDATION_ERROR",
    };
  }

  getSafeUserFromSession(session.user);
  const result = upsertUserAddress(session.user.id, parsed.data);
  if (result.error) {
    return {
      success: false,
      error: result.error,
      code: "MAX_ADDRESSES_REACHED",
    };
  }

  revalidatePath("/account", "layout");
  revalidatePath("/checkout");

  return {
    success: true,
    message: parsed.data.id
      ? "Address updated successfully."
      : "New address saved to your account.",
    data: { addresses: result.addresses },
  };
}

/**
 * Deletes a saved address for the logged-in user.
 */
export async function deleteAddressAction(
  addressId: string
): Promise<ActionResult<{ addresses: SavedAddress[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to delete an address.",
      code: "UNAUTHORIZED",
    };
  }

  const addresses = deleteUserAddress(session.user.id, addressId);
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Address removed.",
    data: { addresses },
  };
}

/**
 * Marks a saved address as the default address for the logged-in user.
 */
export async function setDefaultAddressAction(
  addressId: string
): Promise<ActionResult<{ addresses: SavedAddress[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to update your default address.",
      code: "UNAUTHORIZED",
    };
  }

  const addresses = setDefaultUserAddress(session.user.id, addressId);
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");

  return {
    success: true,
    message: "Default shipping address updated.",
    data: { addresses },
  };
}

/**
 * Changes the logged-in user's password after verifying their current password.
 */
export async function changePasswordAction(
  rawValues: ChangePasswordFormValues
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to change your password.",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = changePasswordSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your password fields.",
      code: "VALIDATION_ERROR",
    };
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return {
      success: false,
      error: "User account not found.",
      code: "NOT_FOUND",
    };
  }

  const isCurrentValid = await verifyUserPassword(
    user,
    parsed.data.currentPassword
  );
  if (!isCurrentValid) {
    return {
      success: false,
      error: "Your current password is incorrect.",
      code: "INVALID_CURRENT_PASSWORD",
    };
  }

  await updateUserPassword(user.id, parsed.data.newPassword);
  return {
    success: true,
    message: "Your password has been updated.",
  };
}

/**
 * Deletes the logged-in user's account after confirming they typed "DELETE" or their email address.
 */
export async function deleteAccountAction(
  rawValues: DeleteAccountFormValues
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be signed in to delete your account.",
      code: "UNAUTHORIZED",
    };
  }

  const parsed = deleteAccountSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Confirmation required.",
      code: "VALIDATION_ERROR",
    };
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return {
      success: false,
      error: "User account not found.",
      code: "NOT_FOUND",
    };
  }

  const input = parsed.data.confirmation.trim();
  const matchesDeleteKeyword = input === "DELETE";
  const matchesUserEmail = input.toLowerCase() === user.email.toLowerCase();

  if (!matchesDeleteKeyword && !matchesUserEmail) {
    return {
      success: false,
      error: `Please type "DELETE" or your email address (${user.email}) to confirm account deletion.`,
      code: "CONFIRMATION_MISMATCH",
    };
  }

  try {
    deleteUser(user.id);
  } catch (err) {
    if (err instanceof Error && err.message === "LAST_ADMIN_CANNOT_BE_DELETED") {
      return {
        success: false,
        error: "Cannot delete the last active administrator account.",
        code: "LAST_ADMIN",
      };
    }
    throw err;
  }
  await signOut({ redirect: false });
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Your account has been permanently deleted.",
  };
}

/**
 * Merges the client localStorage wishlist with the logged-in user's server wishlist.
 */
export async function syncWishlistAction(
  clientProductIds: string[]
): Promise<ActionResult<{ items: string[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not signed in.",
      code: "UNAUTHORIZED",
    };
  }

  const merged = mergeUserWishlist(session.user.id, clientProductIds);
  revalidatePath("/account", "layout");
  return {
    success: true,
    data: { items: merged },
  };
}

/**
 * Saves the current wishlist array to the logged-in user's server record.
 */
export async function updateServerWishlistAction(
  productIds: string[]
): Promise<ActionResult<{ items: string[] }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not signed in.",
      code: "UNAUTHORIZED",
    };
  }

  const updated = setUserWishlist(session.user.id, productIds);
  revalidatePath("/account", "layout");
  return {
    success: true,
    data: { items: updated },
  };
}
