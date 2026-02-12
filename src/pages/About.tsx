import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Award, Users, Star, Globe, Monitor, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCountUp } from "@/hooks/useCountUp";

const StatItem = ({ value, label }: { value: number; label: string }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <span className="text-3xl md:text-4xl font-extrabold text-white">{count}K+</span>
      <p className="text-white/70 text-sm mt-1">{label}</p>
    </div>
  );
};

const About = () => {
  const { t } = useLanguage();

  const skills = [
    { icon: Clock, title: t("about.skill1_title"), desc: t("about.skill1_desc") },
    { icon: BookOpen, title: t("about.skill2_title"), desc: t("about.skill2_desc") },
    { icon: Award, title: t("about.skill3_title"), desc: t("about.skill3_desc") },
  ];

  const instructors = [
    { name: "Md. Rahman", role: t("about.instructor_role1"), quote: t("about.instructor_quote1"), rating: 4.8 },
    { name: "Fatima Akter", role: t("about.instructor_role2"), quote: t("about.instructor_quote2"), rating: 4.9 },
    { name: "Arif Hossain", role: t("about.instructor_role3"), quote: t("about.instructor_quote3"), rating: 4.7 },
  ];

  const faqs = [
    { q: t("about.faq1_q"), a: t("about.faq1_a") },
    { q: t("about.faq2_q"), a: t("about.faq2_a") },
    { q: t("about.faq3_q"), a: t("about.faq3_a") },
    { q: t("about.faq4_q"), a: t("about.faq4_a") },
    { q: t("about.faq5_q"), a: t("about.faq5_a") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
        <section className="gradient-section pt-28 pb-16">
          <div className="max-w-[80vw] mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{t("about.page_title")}</h1>
            <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{t("about.page_title")}</span>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-muted rounded-2xl aspect-[4/3] flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=450&fit=crop" alt="Students learning" className="rounded-2xl w-full h-full object-cover" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">{t("about.section_title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("about.section_desc")}</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-coral-pink/10 p-2 shrink-0 mt-1">
                      <Globe className="h-5 w-5 text-coral-pink" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{t("about.feature1_title")}</h4>
                      <p className="text-sm text-muted-foreground">{t("about.feature1_desc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-violet-brand/10 p-2 shrink-0 mt-1">
                      <Users className="h-5 w-5 text-violet-brand" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{t("about.feature2_title")}</h4>
                      <p className="text-sm text-muted-foreground">{t("about.feature2_desc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">{t("about.skills_title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("about.skills_subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {skills.map((skill, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                    <skill.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{skill.title}</h3>
                  <p className="text-sm text-muted-foreground">{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Counter */}
        <section className="gradient-section py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value={10} label={t("stats.online_courses")} />
              <StatItem value={200} label={t("stats.expert_tutors")} />
              <StatItem value={6} label={t("stats.certified_courses")} />
              <StatItem value={60} label={t("stats.online_students")} />
            </div>
          </div>
        </section>

        {/* Instructors */}
        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">{t("about.instructors_title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("about.instructors_subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {instructors.map((inst, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={inst.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{inst.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{inst.role}</p>
                  <p className="text-sm text-muted-foreground italic mb-3">"{inst.quote}"</p>
                  <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < Math.floor(inst.rating) ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">{inst.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">{t("about.faq_title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("about.faq_subtitle")}</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl mb-3 px-4">
                    <AccordionTrigger className="text-foreground font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
