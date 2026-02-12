import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { GraduationCap, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/courses", label: t("nav.courses") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={`max-w-[80vw] mx-auto flex h-14 items-center justify-between px-6 rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md border border-border"
            : "bg-white/10 backdrop-blur-xl border border-white/20"
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 font-bold text-xl transition-colors ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
        >
          <GraduationCap className="h-7 w-7 text-accent" />
          <span>NextGen LMS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isActive(link.to)
                  ? "text-accent"
                  : isScrolled
                  ? "text-foreground/70"
                  : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className={`gap-1.5 text-sm font-medium transition-colors ${
              isScrolled
                ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "EN" : "BN"}
          </Button>

          <div className={`h-6 w-px ${isScrolled ? "bg-border" : "bg-white/20"}`} />

          <Button
            variant="ghost"
            size="sm"
            className={`text-sm font-medium transition-colors ${
              isScrolled
                ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {t("nav.login")}
          </Button>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium">
            {t("nav.register")}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={isScrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-accent" />
              NextGen LMS
            </SheetTitle>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-accent ${
                    isActive(link.to) ? "text-accent" : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="justify-start gap-2"
              >
                <Globe className="h-4 w-4" />
                {language === "en" ? "Switch to বাংলা" : "Switch to English"}
              </Button>
              <Button variant="outline" className="w-full">{t("nav.login")}</Button>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {t("nav.register")}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
