import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Clock, Users, BookOpen, Play, Share2, ChevronRight, Award, Monitor, FileText, Download, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  topic: string | null;
  sort_order: number;
  video_url: string | null;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const CourseDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const currency = language === "en" ? "$" : "৳";

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!courseData) { setLoading(false); return; }
      setCourse(courseData);

      const [lessonsRes, faqsRes, reviewsRes, enrollRes] = await Promise.all([
        supabase.from("lessons").select("id, title, topic, sort_order, video_url").eq("course_id", courseData.id).order("sort_order"),
        supabase.from("course_faqs").select("id, question, answer, sort_order").eq("course_id", courseData.id).eq("is_enabled", true).order("sort_order"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("course_id", courseData.id).eq("approved", true),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", courseData.id),
      ]);

      setLessons(lessonsRes.data || []);
      setFaqs(faqsRes.data || []);
      setReviewCount(reviewsRes.count || 0);
      setEnrollmentCount(enrollRes.count || 0);
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const handleFreeEnroll = async () => {
    if (!user || !course) return;
    setEnrolling(true);
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: course.id });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Enrolled successfully!" });
    }
    setEnrolling(false);
  };

  // Group lessons by topic
  const topicGroups = lessons.reduce<Record<string, Lesson[]>>((acc, l) => {
    const topic = l.topic || "Lessons";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(l);
    return acc;
  }, {});

  const whatWillLearn = Array.isArray(course?.what_will_learn) ? course.what_will_learn as string[] : [];
  const requirements = Array.isArray(course?.requirements) ? course.requirements as string[] : [];

  const displayPrice = () => {
    if (!course) return null;
    if (course.is_free) return <span className="text-3xl font-extrabold text-primary">Free</span>;
    const price = course.has_discount && course.discount_price ? course.discount_price : course.price;
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-primary">{currency}{price}</span>
        {course.original_price && course.original_price > (price || 0) && (
          <>
            <span className="text-lg text-muted-foreground line-through">{currency}{course.original_price}</span>
            <Badge className="bg-destructive text-destructive-foreground">{Math.round((1 - (price || 0) / course.original_price) * 100)}% OFF</Badge>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-28">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-28">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Course Not Found</h1>
            <Link to="/courses"><Button>Back to Courses</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="gradient-section pt-28 pb-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/courses" className="hover:text-white transition-colors">{t("nav.courses")}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{course.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{course.title}</h1>
            {course.short_description && <p className="text-white/80 text-lg mb-4">{course.short_description}</p>}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {course.category && <Badge className="bg-accent text-accent-foreground">{course.category}</Badge>}
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{enrollmentCount} students</span>
              {course.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>}
              <span>{reviewCount} reviews</span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Image */}
                {course.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-border">
                    <img src={course.image_url} alt={course.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Description */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  {course.description && (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-3">Course Description</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{course.description}</p>
                    </div>
                  )}
                  {whatWillLearn.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3">What You'll Learn</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {whatWillLearn.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-accent text-xs">✓</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{String(item)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3">Requirements</h3>
                      <ul className="space-y-1.5">
                        {requirements.map((req, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {String(req)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Curriculum */}
                {Object.keys(topicGroups).length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Course Content</h2>
                    <p className="text-sm text-muted-foreground mb-4">{lessons.length} lessons</p>
                    <Accordion type="multiple" className="space-y-2">
                      {Object.entries(topicGroups).map(([topic, topicLessons], i) => (
                        <AccordionItem key={i} value={`ch-${i}`} className="border border-border rounded-xl px-4">
                          <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-primary" />
                              {topic}
                              <span className="text-xs text-muted-foreground font-normal ml-2">{topicLessons.length} lectures</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {topicLessons.map(lec => (
                                <div key={lec.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Play className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm text-foreground">{lec.title}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {/* FAQs */}
                {faqs.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {faqs.map((faq, i) => (
                        <AccordionItem key={faq.id} value={`faq-${i}`} className="border border-border rounded-xl px-4">
                          <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-5">
                  {displayPrice()}

                   <Button variant="outline" className="w-full gap-2"><Share2 className="h-4 w-4" />Share</Button>

                  {course.is_free ? (
                    <Button onClick={handleFreeEnroll} disabled={enrolling || !user} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6">
                      {enrolling ? "Enrolling..." : "Enroll Free"}
                    </Button>
                  ) : (
                    <Link to={`/checkout/${slug}`} className="block">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6">
                        {t("courses.enroll")}
                      </Button>
                    </Link>
                  )}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-foreground mb-3">Course Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between"><span>Enrolled</span><span className="font-medium text-foreground">{enrollmentCount}</span></div>
                      {course.duration && <div className="flex justify-between"><span>Duration</span><span className="font-medium text-foreground">{course.duration}</span></div>}
                      <div className="flex justify-between"><span>Lectures</span><span className="font-medium text-foreground">{lessons.length}</span></div>
                      <div className="flex justify-between"><span>Level</span><span className="font-medium text-foreground capitalize">{course.level}</span></div>
                      <div className="flex justify-between"><span>Language</span><span className="font-medium text-foreground">{course.language}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
