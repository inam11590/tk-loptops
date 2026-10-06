import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WishlistContent } from "@/components/wishlist/WishlistContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saved Wishlist",
    description:
      "Your saved HP and Dell laptops synced across your TK Laptop account.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountWishlistPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/wishlist");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Saved Wishlist
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Your favorite HP &amp; Dell laptops, automatically synced to your
          account.
        </p>
      </div>

      <WishlistContent />
    </div>
  );
}
