import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: `Complete your HP or Dell laptop purchase at ${SITE_CONFIG.name} with insured delivery and a 1-year official warranty.`,
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Container>
        <CheckoutFlow />
      </Container>
    </div>
  );
}
