import { HOME_FAQS } from "@/data/faqs";
import { SITE_CONFIG } from "@/lib/config";
import { Container } from "@/components/common/container";
import { FadeIn } from "@/components/common/fade-in";
import { SectionHeading } from "@/components/common/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * 10. FAQ Preview
 * Accessible shadcn/ui Accordion with 5 common questions covering
 * warranty, delivery, returns, payment, and laptop selection.
 */
export function FaqPreview() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 py-section-sm sm:py-section"
    >
      <Container className="max-w-4xl space-y-10">
        <FadeIn>
          <SectionHeading
            id="faq-heading"
            align="center"
            eyebrow="Got Questions?"
            title="Frequently Asked Questions"
            description={`Everything you need to know about buying certified HP and Dell laptops from ${SITE_CONFIG.name}.`}
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <Accordion
            type="single"
            collapsible
            defaultValue={HOME_FAQS[0]?.id}
            className="space-y-3.5"
          >
            {HOME_FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </Container>
    </section>
  );
}
