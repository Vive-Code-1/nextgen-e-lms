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
  { icon: Mail, title: t("contact.email_title"), line1: "info@nextgenlms.com", line2: "support@nextgenlms.com", color: "text-emerald-accent", bg: "bg-emerald-accent/10" }];


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

        {/* Contact Section */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-stretch">
              <div className="space-y-4">
                {infoCards.map((card, i) =>
                  <div key={i} className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-lg transition-shadow">
                    <div className={`rounded-full ${card.bg} p-3 w-fit mx-auto mb-2`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.line1}</p>
                    <p className="text-sm text-muted-foreground">{card.line2}</p>
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <form className="space-y-4 flex flex-col flex-1" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.name_placeholder")} className="h-12 bg-background" />
                    <Input placeholder={t("contact.email_placeholder")} type="email" className="h-12 bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.phone_placeholder")} type="tel" className="h-12 bg-background" />
                    <Input placeholder={t("contact.subject_placeholder")} className="h-12 bg-background" />
                  </div>
                  <Textarea placeholder={t("contact.message_placeholder")} rows={7} className="bg-background flex-1" />
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    {t("contact.send_button")}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Google Map */}
        <section className="pb-16 bg-muted/50">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="rounded-2xl overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233668.0384390866!2d90.27891109302494!3d23.780573258035968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563962e0b151d!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
                className="w-full h-[400px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map - Dhaka, Bangladesh"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>);

};

export default Contact;