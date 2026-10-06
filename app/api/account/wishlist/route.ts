import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { mergeUserWishlist, setUserWishlist } from "@/lib/users";

const wishlistBodySchema = z.object({
  items: z.array(z.string().trim().min(1)).max(100),
  mode: z.enum(["merge", "replace"]).default("merge"),
});

/**
 * POST /api/account/wishlist
 * Merges or replaces the authenticated user's server-saved wishlist product IDs.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = wishlistBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid wishlist items." },
      { status: 400 }
    );
  }

  const updated =
    parsed.data.mode === "merge"
      ? mergeUserWishlist(session.user.id, parsed.data.items)
      : setUserWishlist(session.user.id, parsed.data.items);

  return NextResponse.json({ items: updated }, { status: 200 });
}
