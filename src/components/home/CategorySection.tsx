import { useLanguage } from "@/contexts/LanguageContext";
import { Palette, Video, Megaphone, Search, Code, ShoppingCart } from "lucide-react";
import BlurText from "@/components/ui/BlurText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Link } from "react-router-dom";

const categories = [
  { icon: Palette, label: "categories.graphics_design", color: "text-coral-pink", bg: "bg-coral-pink/10", filterValue: "Design" },
  { icon: Video, label: "categories.video_editing", color: "text-violet-brand", bg: "bg-violet-brand/10", filterValue: "Video" },
  { icon: Megaphone, label: "categories.digital_marketing", color: "text-blue-500", bg: "bg-blue-100", filterValue: "Marketing" },
  { icon: Search, label: "categories.seo", color: "text-emerald-accent", bg: "bg-emerald-accent/10", filterValue: "SEO" },
  { icon: Code, label: "categories.web_dev", color: "text-amber-cta", bg: "bg-amber-cta/10", filterValue: "Development" },
  { icon: ShoppingCart, label: "categories.dropshipping", color: "text-cyan-500", bg: "bg-cyan-100", filterValue: "Business" },
];

const CategorySection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-3">
            <BlurText text={t("categories.title")} delay={200} animateBy="words" direction="top" className="text-2xl md:text-4xl font-extrabold text-foreground justify-center" />
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
          {categories.map(({ icon: Icon, label, color, bg, filterValue }) => (
            <Link
              key={label}
              to={`/courses?category=${encodeURIComponent(filterValue)}`}
              className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className={`rounded-full ${bg} p-4`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <span className="text-sm font-semibold text-foreground text-center">
                {t(label)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
