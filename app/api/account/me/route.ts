import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/orders";
import { getSafeUserFromSession } from "@/lib/users";

/**
 * GET /api/account/me
 * Returns the authenticated user's SafeUser profile (never includes passwordHash).
 * Returns `{ user: null }` with HTTP 200 when unauthenticated so the header can check session state without console 401 noise.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const safeUser = getSafeUserFromSession(session.user);
  if (!safeUser) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  // Ensure any guest orders matching this user's email are linked
  const orders = getOrdersByUser(safeUser.id, safeUser.email);

  return NextResponse.json(
    {
      user: safeUser,
      ordersCount: orders.length,
    },
    { status: 200 }
  );
}
