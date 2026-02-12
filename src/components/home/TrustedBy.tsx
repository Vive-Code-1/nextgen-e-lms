import { useLanguage } from "@/contexts/LanguageContext";
import logo22 from "@/assets/logos/22.svg";
import logo23 from "@/assets/logos/23.svg";
import logo24 from "@/assets/logos/24.svg";
import logo25 from "@/assets/logos/25.svg";
import logo26 from "@/assets/logos/26.svg";
import logo27 from "@/assets/logos/27.svg";

const logos = [logo22, logo23, logo24, logo25, logo26, logo27];

const TrustedBy = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-background overflow-hidden">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            {t("trusted.label")}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {t("trusted.title")}
          </h2>
        </div>
      </div>
      <div className="relative">
        <div className="flex animate-marquee">
          {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex-shrink-0 mx-8 md:mx-12 flex items-center justify-center h-16">
              <img src={logo} alt="Partner logo" className="h-10 md:h-14 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
