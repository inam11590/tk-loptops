export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * 5 common FAQ items covering warranty, delivery, returns, payment, and laptop selection.
 */
export const HOME_FAQS: FaqItem[] = [
  {
    id: "faq-warranty",
    question: "Are all laptops brand new and covered by an official 1-year warranty?",
    answer:
      "Yes. Every HP and Dell laptop sold by TK Laptop is 100% factory-sealed, genuine retail hardware with a verifiable manufacturer serial/service tag. Every unit includes our comprehensive 1-Year Official Hardware Warranty plus direct manufacturer coverage.",
  },
  {
    id: "faq-delivery",
    question: "How fast is delivery and how does free shipping work?",
    answer:
      "Orders placed before 3:00 PM EST ship the same business day via insured express courier with signature confirmation. Orders above our free shipping threshold qualify for complimentary 1–3 business day nationwide delivery.",
  },
  {
    id: "faq-returns",
    question: "What is your return and exchange policy if a laptop isn't the right fit?",
    answer:
      "We offer a hassle-free 30-day return and exchange window. If your laptop doesn't suit your workflow or arrives with any hardware defect, we provide a prepaid insured return label for a full refund or instant replacement.",
  },
  {
    id: "faq-payment",
    question: "Which payment methods do you accept and is checkout secure?",
    answer:
      "We accept Visa, Mastercard, American Express, Apple Pay, and PayPal. All transactions are protected by 256-bit TLS encryption and PCI-DSS Level 1 payment processing—your card details are never stored on our servers.",
  },
  {
    id: "faq-selection",
    question: "How do I choose between HP and Dell for my specific workload?",
    answer:
      "For ultra-portable executive use, consider the HP Spectre x360 or Dell XPS 14. For corporate security and fleet reliability, choose HP EliteBook or Dell Latitude. For AAA gaming and 3D rendering, HP OMEN and Dell Alienware offer high-wattage RTX graphics.",
  },
];
