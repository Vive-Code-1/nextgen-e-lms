import { useState } from "react";
import { GraduationCap, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const quickLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/courses", label: t("nav.courses") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const supportLinks = [
    { label: t("footer.help") },
    { label: t("footer.faq") },
    { label: t("footer.terms") },
    { label: t("footer.privacy") },
  ];

  const handleNewsletter = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers" as any).insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed!", description: "This email is already in our newsletter." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Subscribed!", description: "You've been added to our newsletter." });
      setEmail("");
    }
  };

  return (
    <footer className="bg-indigo-dark text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="h-7 w-7 text-accent" />
              {t("footer.brand")}
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>

          {/* Quick Links + Support side-by-side on mobile */}
          <div className="grid grid-cols-2 lg:contents gap-6">
            <div>
              <h4 className="font-semibold mb-4 text-accent">{t("footer.quick_links")}</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-white/70 hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-accent">{t("footer.support")}</h4>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <span className="text-sm text-white/70 hover:text-accent transition-colors cursor-pointer">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t("footer.newsletter")}</h4>
            <p className="text-sm text-white/70 mb-4">{t("footer.newsletter_desc")}</p>
            <div className="flex gap-2">
              <Input
                placeholder={t("footer.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm rounded-full"
              />
              <Button size="icon" onClick={handleNewsletter} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-white/50">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
