import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getSafeUserFromSession } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Forgot Password",
    description:
      "Request a secure 30-minute password reset link for your TK Laptop account.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ForgotPasswordPage() {
  const session = await auth();
  const existingUser = getSafeUserFromSession(session?.user);
  if (existingUser) {
    redirect("/account");
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter the email address associated with your account and we will send you a 30-minute reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
