import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddressList } from "@/components/account/AddressList";
import { getSafeUserFromSession } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saved Addresses",
    description:
      "Manage your shipping addresses and default delivery destination on TK Laptop.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  const user = getSafeUserFromSession(session.user);
  if (!user) {
    redirect("/login?callbackUrl=/account/addresses&sessionExpired=1");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Address Book
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Manage up to 5 delivery addresses and choose your default address for
          express checkout.
        </p>
      </div>

      <AddressList
        initialAddresses={user.addresses}
        defaultFullName={user.fullName}
        defaultPhone={user.phone}
      />
    </div>
  );
}
