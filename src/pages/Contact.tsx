import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const { t } = useLanguage();

  const infoCards = [
    { icon: MapPin, title: t("contact.address_title"), line1: t("contact.address_line1"), line2: t("contact.address_line2"), color: "text-coral-pink", bg: "bg-coral-pink/10" },
    { icon: Phone, title: t("contact.phone_title"), line1: "+880 1234 567 890", line2: "+880 9876 543 210", color: "text-violet-brand", bg: "bg-violet-brand/10" },
    { icon: Mail, title: t("contact.email_title"), line1: "info@nextgenlms.com", line2: "support@nextgenlms.com", color: "text-emerald-accent", bg: "bg-emerald-accent/10" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <section className="gradient-section pt-28 pb-16">
          <div className="max-w-[80vw] mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{t("contact.page_title")}</h1>
            <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{t("contact.page_title")}</span>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {infoCards.map((card, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className={`rounded-full ${card.bg} p-4 w-fit mx-auto mb-4`}>
                    <card.icon className={`h-7 w-7 ${card.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.line1}</p>
                  <p className="text-sm text-muted-foreground">{card.line2}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t("contact.form_title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("contact.form_desc")}</p>
                <img src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=500&h=350&fit=crop" alt="Contact" className="rounded-2xl w-full object-cover" />
              </div>
              <div className="bg-card border border-border rounded-2xl p-8">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.name_placeholder")} className="bg-background" />
                    <Input placeholder={t("contact.email_placeholder")} type="email" className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.phone_placeholder")} type="tel" className="bg-background" />
                    <Input placeholder={t("contact.subject_placeholder")} className="bg-background" />
                  </div>
                  <Textarea placeholder={t("contact.message_placeholder")} rows={5} className="bg-background" />
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    {t("contact.send_button")}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
