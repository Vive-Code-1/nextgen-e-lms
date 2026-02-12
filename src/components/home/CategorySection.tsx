import { useLanguage } from "@/contexts/LanguageContext";
import { Palette, Video, Megaphone, Search, Code, ShoppingCart } from "lucide-react";
import ScrollFloat from "@/components/ui/ScrollFloat";
import ScrollReveal from "@/components/ui/ScrollReveal";

const categories = [
  { icon: Palette, label: "categories.graphics_design", color: "text-coral-pink", bg: "bg-coral-pink/10" },
  { icon: Video, label: "categories.video_editing", color: "text-violet-brand", bg: "bg-violet-brand/10" },
  { icon: Megaphone, label: "categories.digital_marketing", color: "text-blue-500", bg: "bg-blue-100" },
  { icon: Search, label: "categories.seo", color: "text-emerald-accent", bg: "bg-emerald-accent/10" },
  { icon: Code, label: "categories.web_dev", color: "text-amber-cta", bg: "bg-amber-cta/10" },
  { icon: ShoppingCart, label: "categories.dropshipping", color: "text-cyan-500", bg: "bg-cyan-100" },
];

const CategorySection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            <ScrollFloat textClassName="text-3xl md:text-4xl font-extrabold text-foreground">
              {t("categories.title")}
            </ScrollFloat>
          </h2>
          <ScrollReveal
            baseRotation={0}
            containerClassName="text-muted-foreground max-w-xl mx-auto"
            textClassName="text-muted-foreground"
          >
            {t("categories.subtitle")}
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className={`rounded-full ${bg} p-4`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground text-center">
                {t(label)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
