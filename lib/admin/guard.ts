import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSafeUserFromSession, type SafeUser } from "@/lib/users";

export type AdminGuardResult =
  | { authorized: true; admin: SafeUser }
  | {
      authorized: false;
      status: 401 | 403;
      error: string;
      code: "UNAUTHENTICATED" | "FORBIDDEN";
    };

/**
 * Shared server-side administrator guard for Server Actions and Route Handlers.
 * Never relies on middleware alone: verifies both the Auth.js JWT session and the
 * live server user record (`role === "admin"` and `!disabled`).
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required. Please sign in.",
      code: "UNAUTHENTICATED",
    };
  }

  const safeUser = getSafeUserFromSession(session.user);
  if (!safeUser || safeUser.disabled) {
    return {
      authorized: false,
      status: 401,
      error: "Your session is no longer active. Please sign in again.",
      code: "UNAUTHENTICATED",
    };
  }

  const isRoleAdmin =
    safeUser.role === "admin" || session.user.role === "admin";
  if (!isRoleAdmin) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Administrator access is required for this action.",
      code: "FORBIDDEN",
    };
  }

  return {
    authorized: true,
    admin: {
      ...safeUser,
      role: "admin",
    },
  };
}

/**
 * Helper for API Route Handlers under `/api/admin/*`.
 * Returns either `{ authorized: true, admin }` or a ready-to-return `NextResponse` with 401/403.
 */
export async function requireAdminApi(): Promise<
  | { authorized: true; admin: SafeUser }
  | { authorized: false; response: NextResponse }
> {
  const check = await requireAdmin();
  if (!check.authorized) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: check.error, code: check.code },
        { status: check.status }
      ),
    };
  }
  return { authorized: true, admin: check.admin };
}

/**
 * Helper for Server Components under `/admin/*`.
 * Redirects unauthenticated users to `/login?callbackUrl=...` and redirects non-admins to `/forbidden`.
 */
export async function requireAdminPage(callbackPath = "/admin"): Promise<SafeUser> {
  const check = await requireAdmin();
  if (!check.authorized) {
    if (check.status === 401) {
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
    }
    redirect("/forbidden");
  }
  return check.admin;
}
