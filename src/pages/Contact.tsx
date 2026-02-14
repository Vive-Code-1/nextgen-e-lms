import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const infoCards = [
    { icon: MapPin, title: t("contact.address_title"), line1: t("contact.address_line1"), line2: t("contact.address_line2"), color: "text-coral-pink", bg: "bg-coral-pink/10" },
    { icon: Phone, title: t("contact.phone_title"), line1: "+880 1234 567 890", line2: "+880 9876 543 210", color: "text-violet-brand", bg: "bg-violet-brand/10" },
    { icon: Mail, title: t("contact.email_title"), line1: "info@nextgenlms.com", line2: "support@nextgenlms.com", color: "text-emerald-accent", bg: "bg-emerald-accent/10" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_leads" as any).insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || null,
      message: form.message,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }
  };

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
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-card border border-border rounded-2xl h-full flex flex-col divide-y divide-border justify-center">
                {infoCards.map((card, i) => (
                  <div key={i} className="p-6 flex items-start gap-4 text-left">
                    <div className={`rounded-full ${card.bg} p-3 shrink-0`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground">{card.line1}</p>
                      <p className="text-sm text-muted-foreground">{card.line2}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <form className="space-y-4 flex flex-col flex-1" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.name_placeholder")} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="h-12 bg-background" />
                    <Input placeholder={t("contact.email_placeholder")} type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="h-12 bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder={t("contact.phone_placeholder")} type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="h-12 bg-background" />
                    <Input placeholder={t("contact.subject_placeholder")} value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} className="h-12 bg-background" />
                  </div>
                  <Textarea placeholder={t("contact.message_placeholder")} rows={7} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} className="bg-background flex-1" />
                  <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    {loading ? "Sending..." : t("contact.send_button")}
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
    </div>
  );
};

export default Contact;
