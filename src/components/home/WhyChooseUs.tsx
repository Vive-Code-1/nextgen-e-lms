import { Award, Headphones, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  { icon: Award, titleKey: "why.cert.title", descKey: "why.cert.desc" },
  { icon: Headphones, titleKey: "why.support.title", descKey: "why.support.desc" },
  { icon: Users, titleKey: "why.mentors.title", descKey: "why.mentors.desc" },
];

const WhyChooseUs = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4" ref={ref}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            {t("why.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("why.subtitle")}
          </p>
        </div>
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {features.map((f) => (
            <div
              key={f.titleKey}
              className="flex flex-col items-center text-center p-8 rounded-xl bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="rounded-full bg-accent/10 p-4 mb-5">
                <f.icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
