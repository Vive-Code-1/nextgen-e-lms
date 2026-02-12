import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ScrollRevealText from "@/components/ui/ScrollReveal";

const MasterSkills = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  const skills = [
    { key: "master.skill1" },
    { key: "master.skill2" },
    { key: "master.skill3" },
    { key: "master.skill4" },
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-[80vw] mx-auto px-4" ref={ref}>
        <div
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
              alt="Students collaborating"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              {t("master.title")}
            </h2>
            <ScrollRevealText
              baseRotation={0}
              containerClassName="text-muted-foreground"
              textClassName="text-muted-foreground"
            >
              {t("master.desc")}
            </ScrollRevealText>
            <ul className="space-y-3">
              {skills.map((s) => (
                <li key={s.key} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-accent shrink-0" />
                  <span className="text-foreground font-medium">{t(s.key)}</span>
                </li>
              ))}
            </ul>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              {t("master.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterSkills;
