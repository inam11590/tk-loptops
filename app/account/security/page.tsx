import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SecuritySettings } from "@/components/account/SecuritySettings";
import { getSafeUserFromSession } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Security Settings",
    description:
      "Change your password or delete your TK Laptop account.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/security");
  }

  const user = getSafeUserFromSession(session.user);
  if (!user) {
    redirect("/login?callbackUrl=/account/security&sessionExpired=1");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Security &amp; Account Privacy
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Update your password or permanently delete your account.
        </p>
      </div>

      <SecuritySettings userEmail={user.email} />
    </div>
  );
}
