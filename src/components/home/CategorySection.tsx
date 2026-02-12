import { useLanguage } from "@/contexts/LanguageContext";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useCallback } from "react";
import { Palette, Video, Megaphone, Search, Code, ShoppingCart } from "lucide-react";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  useEffect(() => {
    const cleanup = autoplay();
    return cleanup;
  }, [autoplay]);

  return (
    <section className="py-16">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t("categories.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("categories.subtitle")}
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className="flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_16%] min-w-0"
              >
                <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className={`rounded-full ${bg} p-4`}>
                    <Icon className={`h-7 w-7 ${color}`} />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center">
                    {t(label)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
