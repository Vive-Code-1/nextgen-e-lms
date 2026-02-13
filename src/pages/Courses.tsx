import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

const filterLevels = ["beginner", "intermediate", "advanced"];

const categoryDisplayNames: Record<string, string> = {
  "Design": "Graphics Design",
  "Video": "Video Editing",
  "Marketing": "Digital Marketing",
  "SEO": "SEO",
  "Development": "Website Development",
  "Website Development": "Website Development",
  "Business": "Dropshipping",
};

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  discount_price: number | null;
  has_discount: boolean;
  is_free: boolean;
  level: string;
  instructor_name: string | null;
  duration: string | null;
}

const Courses = () => {
  const { t, language } = useLanguage();
  const currency = language === 'en' ? '$' : '৳';
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategories([cat]);
    const s = searchParams.get("search");
    setSearchText(s || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, category, image_url, price, original_price, discount_price, has_discount, is_free, level, instructor_name, duration")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const toggleCategory = (cat: string) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const toggleLevel = (lvl: string) => setSelectedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);

  const filteredCourses = courses.filter(c => {
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(c.category || "");
    const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(c.level.toLowerCase());
    const matchSearch = !searchText || c.title.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  const displayPrice = (c: Course) => {
    if (c.is_free) return <span className="text-lg font-extrabold text-primary">Free</span>;
    const price = c.has_discount && c.discount_price ? c.discount_price : c.price;
    return (
      <div>
        <span className="text-lg font-extrabold text-primary">{currency}{price}</span>
        {c.original_price && c.original_price > (price || 0) && (
          <span className="text-xs text-muted-foreground line-through ml-2">{currency}{c.original_price}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="gradient-section pt-28 pb-16">
          <div className="max-w-[80vw] mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{t("coursepage.page_title")}</h1>
            <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
              <Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{t("coursepage.page_title")}</span>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-foreground mb-4">{t("coursepage.filters")}</h3>
                  <Accordion type="multiple" defaultValue={["categories", "level"]}>
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{t("coursepage.categories")}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {[...new Set(courses.map(c => c.category).filter(Boolean))].map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                              <span className="text-sm text-muted-foreground">{categoryDisplayNames[cat as string] || cat}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="level">
                      <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{t("coursepage.level")}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {filterLevels.map(lvl => (
                            <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={selectedLevels.includes(lvl)} onCheckedChange={() => toggleLevel(lvl)} />
                              <span className="text-sm text-muted-foreground capitalize">{lvl}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              {/* Grid */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{t("coursepage.showing")} <strong>{filteredCourses.length}</strong> {t("coursepage.courses_label")}</p>
                </div>

                {loading ? (
                  <p className="text-muted-foreground">Loading courses...</p>
                ) : filteredCourses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">No courses found.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="relative overflow-hidden">
                          <img src={course.image_url || "/placeholder.svg"} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                          {course.category && <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{course.category}</span>}
                          {course.is_free && <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">Free</span>}
                        </div>
                        <div className="p-5 space-y-3">
                          {course.instructor_name && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                {course.instructor_name[0]?.toUpperCase()}
                              </div>
                              <span className="text-xs text-muted-foreground">{course.instructor_name}</span>
                            </div>
                          )}
                          <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2">{course.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {course.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>}
                            <span className="capitalize">{course.level}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            {displayPrice(course)}
                            <Link to={`/courses/${course.slug}`}>
                              <Button size="sm" variant="outline" className="text-xs">{t("coursepage.view_course")}</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
