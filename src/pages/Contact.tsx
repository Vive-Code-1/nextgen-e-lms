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

  const infoItems = [
    {
      icon: MapPin,
      title: t("contact.address_title"),
      line1: t("contact.address_line1"),
      line2: t("contact.address_line2"),
      color: "text-coral-pink",
      bg: "bg-coral-pink/10",
      border: "border-coral-pink/20",
    },
    {
      icon: Phone,
      title: t("contact.phone_title"),
      line1: "+880 1234 567 890",
      line2: "+880 9876 543 210",
      color: "text-violet-brand",
      bg: "bg-violet-brand/10",
      border: "border-violet-brand/20",
    },
    {
      icon: Mail,
      title: t("contact.email_title"),
      line1: "info@nextgenlms.com",
      line2: "support@nextgenlms.com",
      color: "text-emerald-accent",
      bg: "bg-emerald-accent/10",
      border: "border-emerald-accent/20",
    },
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

        {/* Contact Section - Two Columns */}
        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left - Info Cards */}
              <div className="space-y-5">
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6">{t("contact.form_title")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{t("contact.form_desc")}</p>
                {infoItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 bg-card border ${item.border} rounded-2xl p-5 hover:shadow-lg transition-shadow`}
                  >
                    <div className={`rounded-xl ${item.bg} p-3 flex-shrink-0`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.line1}</p>
                      <p className="text-sm text-muted-foreground">{item.line2}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right - Contact Form */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-6">{t("contact.send_button")}</h3>
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
