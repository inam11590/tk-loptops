import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { verifyPasswordResetToken } from "@/lib/users";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Set New Password",
    description: "Set a new password for your TK Laptop account.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/account");
  }

  const { token } = await params;
  const check = verifyPasswordResetToken(token);

  return (
    <AuthLayout
      title="Set a New Password"
      subtitle="Choose a strong password with at least 8 characters, one letter, and one number."
    >
      <ResetPasswordForm
        token={token}
        tokenStatus={
          check.valid
            ? { valid: true, email: check.email }
            : { valid: false, reason: check.reason }
        }
      />
    </AuthLayout>
  );
}
