import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountOrderDetail } from "@/components/account/AccountOrderDetail";
import { getOrderForUserById } from "@/lib/orders";

interface AccountOrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: AccountOrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId.toUpperCase()}`,
    description: `Order details and status timeline for order ${orderId.toUpperCase()}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const { orderId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/account/orders/${encodeURIComponent(orderId)}`);
  }

  const order = getOrderForUserById(
    orderId,
    session.user.id,
    session.user.email ?? undefined
  );

  // Return 404 if the order does not exist OR belongs to another user
  if (!order) {
    notFound();
  }

  return <AccountOrderDetail order={order} />;
}
