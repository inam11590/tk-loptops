import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Container } from "@/components/common/container";
import { getSafeUserById } from "@/lib/users";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const user = getSafeUserById(session.user.id);
  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-surface py-6 sm:py-10">
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-3 print:hidden">
            <AccountSidebar user={user} />
          </div>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </Container>
    </div>
  );
}
