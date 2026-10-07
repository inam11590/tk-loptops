import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeUserFromSession } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Account",
    description:
      "Create your TK Laptop account for faster checkout, order tracking, warranty support, and synced wishlists.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const session = await auth();
  const existingUser = getSafeUserFromSession(session?.user);
  if (existingUser) {
    redirect("/account");
  }

  const resolvedParams = await searchParams;

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join TK Laptop to track orders, save shipping addresses, and manage your 1-year warranty."
      activeTab="register"
    >
      <RegisterForm
        callbackUrl={resolvedParams.callbackUrl}
        isGoogleEnabled={isGoogleAuthEnabled}
      />
    </AuthLayout>
  );
}
