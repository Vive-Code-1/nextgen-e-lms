import { ArrowRight, Search, ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBanner from "@/assets/hero-banner.webp";
import heroVideo from "@/assets/hero-video.webm";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatsSection from "./StatsSection";

const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchText.trim()) params.set("search", searchText.trim());
    navigate(`/courses?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col">
      {/* Background Video */}
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-[80vw] mx-auto px-4 pt-28 pb-8 md:pt-32 md:pb-12 flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white animate-fade-in-up">
              {t("hero.headline_1")}
              <span className="text-coral-pink">{t("hero.headline_highlight")}</span>
              {t("hero.headline_2")}
            </h1>
            <ScrollReveal
              baseRotation={0}
              containerClassName="text-lg text-white/70 max-w-lg animate-fade-in-up-delay-1"
              textClassName="text-lg text-white/70"
            >
              {t("hero.subheadline")}
            </ScrollReveal>

            {/* Search Bar */}
            <div className="animate-fade-in-up-delay-2 relative z-50">
              <div className="flex items-center bg-white rounded-full shadow-lg max-w-xl relative">
                <div className="flex items-center flex-1 px-4 py-3">
                   <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                   <input
                     type="text"
                     placeholder={t("hero.search_placeholder")}
                     value={searchText}
                     onChange={(e) => setSearchText(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                     className="ml-3 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none"
                   />
                </div>
                <div className="hidden sm:flex items-center border-l border-border px-3">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                    >
                      {selectedCategory || t("hero.category")}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {categoryOpen && (
                      <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-border z-[100] py-1">
                        {["Graphics Design", "Video Editing", "Digital Marketing", "SEO", "Website Development", "Dropshipping"].map((cat) => (
                          <button
                            key={cat}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategory === cat ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                            onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleSearch} className="m-1.5 h-10 w-10 rounded-full bg-coral-pink flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity">
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats Cards below search bar */}
            <div className="mt-8 max-w-xl">
              <StatsSection embedded />
            </div>
          </div>

          {/* Image - smaller */}
          <div className="animate-fade-in-up-delay-2 hidden md:flex justify-center">
            <img
              src={heroBanner}
              alt="Students learning together"
              className="w-full max-w-lg object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
