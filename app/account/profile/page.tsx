import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getSafeUserById } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Profile Settings",
    description: "Manage your TK Laptop personal details and avatar.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const user = getSafeUserById(session.user.id);
  if (!user) {
    redirect("/login?callbackUrl=/account/profile");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Update your display name, contact phone number, and profile avatar.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
