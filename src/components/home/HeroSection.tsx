import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-primary animate-fade-in-up">
              {t("hero.headline")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in-up-delay-1">
              {t("hero.subheadline")}
            </p>
            <div className="animate-fade-in-up-delay-2">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/30 text-base px-8"
              >
                <Link to="/courses">
                  {t("hero.cta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="animate-fade-in-up-delay-2 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop"
              alt="Students learning together"
              className="rounded-2xl shadow-2xl w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
