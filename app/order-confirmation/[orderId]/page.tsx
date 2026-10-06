import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/common/container";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";
import { SITE_CONFIG } from "@/lib/config";
import { getOrderById } from "@/lib/orders";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({
  params,
}: OrderConfirmationPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order Confirmation #${orderId.toUpperCase()}`,
    description: `View your official order confirmation and invoice for order #${orderId.toUpperCase()} at ${
      SITE_CONFIG.name
    }.`,
  };
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Container>
        <OrderSuccess order={order} />
      </Container>
    </div>
  );
}
