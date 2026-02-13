import { useLanguage } from "@/contexts/LanguageContext";
import ScrollFloat from "@/components/ui/ScrollFloat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const leftFaqs = [
  { q: "faq.1.q", a: "faq.1.a" },
  { q: "faq.2.q", a: "faq.2.a" },
  { q: "faq.3.q", a: "faq.3.a" },
];

const rightFaqs = [
  { q: "faq.4.q", a: "faq.4.a" },
  { q: "faq.5.q", a: "faq.5.a" },
  { q: "faq.6.q", a: "faq.6.a" },
];

const ShareKnowledge = () => {
  const { t } = useLanguage();

  const renderAccordion = (faqs: typeof leftFaqs, prefix: string) => (
    <Accordion type="single" collapsible className="space-y-3">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`${prefix}-${i}`}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 data-[state=open]:bg-white/15"
        >
          <AccordionTrigger className="text-white hover:no-underline text-left font-semibold">
            {t(faq.q)}
          </AccordionTrigger>
          <AccordionContent className="text-white/80 leading-relaxed">
            {t(faq.a)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <section className="py-16 md:py-20 gradient-section">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            <ScrollFloat textClassName="text-3xl md:text-4xl font-extrabold text-white">
              {t("faq.title")}
            </ScrollFloat>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {renderAccordion(leftFaqs, "left")}
          {renderAccordion(rightFaqs, "right")}
        </div>
      </div>
    </section>
  );
};

export default ShareKnowledge;
