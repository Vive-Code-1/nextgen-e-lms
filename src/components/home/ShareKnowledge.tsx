import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ShareKnowledge = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 gradient-section">
      <div className="max-w-[80vw] mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          {t("share.title")}
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          {t("share.desc")}
        </p>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-lg font-semibold">
          {t("share.cta")}
        </Button>
      </div>
    </section>
  );
};

export default ShareKnowledge;
