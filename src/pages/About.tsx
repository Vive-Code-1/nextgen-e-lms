import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Info } from "lucide-react";

const About = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Info className="h-16 w-16 text-accent mx-auto" />
          <h1 className="text-3xl font-bold text-primary">{t("page.about")}</h1>
          <p className="text-muted-foreground">{t("page.coming_soon")}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
