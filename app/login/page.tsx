import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeUserFromSession } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sign In",
    description:
      "Sign in to your TK Laptop account to track orders, manage saved addresses, and sync your wishlist.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; sessionExpired?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const existingUser = getSafeUserFromSession(session?.user);
  if (existingUser) {
    redirect("/account");
  }

  const resolvedParams = await searchParams;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your orders, saved addresses, and synced wishlist."
      activeTab="login"
    >
      <LoginForm
        callbackUrl={resolvedParams.callbackUrl}
        isGoogleEnabled={isGoogleAuthEnabled}
      />
    </AuthLayout>
  );
}
