import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ChevronRight, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const courseImages = [
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
];

const courses = [
  { title: "Complete Graphics Design Masterclass", category: "Graphics Design", instructor: "Nadia Islam", rating: 4.8, reviews: 245, price: 4999, originalPrice: 9999, students: 1200, duration: "40 hrs", image: 0 },
  { title: "Professional Video Editing with Premiere Pro", category: "Video Editing", instructor: "James Wilson", rating: 4.7, reviews: 189, price: 3999, originalPrice: 7999, students: 890, duration: "35 hrs", image: 1 },
  { title: "Digital Marketing & Social Media Strategy", category: "Digital Marketing", instructor: "Sara Khan", rating: 4.9, reviews: 312, price: 5999, originalPrice: 12999, students: 1500, duration: "30 hrs", image: 2 },
  { title: "SEO Mastery: Rank #1 on Google", category: "SEO", instructor: "Tanvir Hasan", rating: 4.6, reviews: 156, price: 2999, originalPrice: 5999, students: 780, duration: "25 hrs", image: 3 },
  { title: "Full-Stack Web Development Bootcamp", category: "Website Development", instructor: "Md. Rahman", rating: 4.8, reviews: 201, price: 5499, originalPrice: 10999, students: 650, duration: "45 hrs", image: 4 },
  { title: "Dropshipping Business from Scratch", category: "Dropshipping", instructor: "Kamal Ahmed", rating: 4.5, reviews: 178, price: 3499, originalPrice: 6999, students: 920, duration: "35 hrs", image: 5 },
  { title: "Advanced Graphics Design Portfolio", category: "Graphics Design", instructor: "Arif Hossain", rating: 4.7, reviews: 134, price: 4499, originalPrice: 8999, students: 540, duration: "28 hrs", image: 6 },
  { title: "Full Stack JavaScript Development", category: "Website Development", instructor: "Fatima Akter", rating: 4.9, reviews: 267, price: 6999, originalPrice: 13999, students: 1100, duration: "50 hrs", image: 7 },
  { title: "Advanced SEO & Content Strategy", category: "SEO", instructor: "David Kim", rating: 4.4, reviews: 98, price: 2499, originalPrice: 4999, students: 430, duration: "20 hrs", image: 8 },
  { title: "Social Media Marketing Mastery", category: "Digital Marketing", instructor: "Emily Rodriguez", rating: 4.8, reviews: 220, price: 4999, originalPrice: 9999, students: 980, duration: "32 hrs", image: 9 },
  { title: "After Effects Motion Graphics", category: "Video Editing", instructor: "Michael Chen", rating: 4.6, reviews: 145, price: 4499, originalPrice: 8999, students: 670, duration: "38 hrs", image: 10 },
  { title: "E-commerce & Dropshipping Mastery", category: "Dropshipping", instructor: "Sarah Johnson", rating: 4.7, reviews: 190, price: 3999, originalPrice: 7999, students: 850, duration: "30 hrs", image: 11 },
];

const filterCategories = ["Graphics Design", "Video Editing", "Digital Marketing", "SEO", "Website Development", "Dropshipping"];
const filterLevels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const getFilterPrices = (lang: string) => lang === 'en'
  ? ["Free", "Under $30", "$30 - $50", "Above $50"]
  : ["ফ্রি", "৳3000 এর নিচে", "৳3000 - ৳5000", "৳5000 এর উপরে"];

const Courses = () => {
  const { t, language } = useLanguage();
  const currency = language === 'en' ? '$' : '৳';
  const filterPrices = getFilterPrices(language);
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && filterCategories.includes(cat)) {
      setSelectedCategories([cat]);
    }
    const s = searchParams.get("search");
    if (s) setSearchText(s);
  }, [searchParams]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category);
    const matchesSearch = !searchText || c.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Page Header */}
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

        {/* Course Grid with Sidebar */}
        <section className="py-16">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-foreground mb-4">{t("coursepage.filters")}</h3>
                  <Accordion type="multiple" defaultValue={["categories", "level", "price"]}>
                    <AccordionItem value="categories">
                      <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{t("coursepage.categories")}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {filterCategories.map((cat) => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={() => toggleCategory(cat)}
                              />
                              <span className="text-sm text-muted-foreground">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="level">
                      <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{t("coursepage.level")}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {filterLevels.map((lvl) => (
                            <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox />
                              <span className="text-sm text-muted-foreground">{lvl}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="price">
                      <AccordionTrigger className="text-foreground font-semibold hover:no-underline">{t("coursepage.price")}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {filterPrices.map((p) => (
                            <label key={p} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox />
                              <span className="text-sm text-muted-foreground">{p}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              {/* Course Grid */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">{t("coursepage.showing")} <strong>{filteredCourses.length}</strong> {t("coursepage.courses_label")}</p>
                  <div className="flex gap-2">
                    {["Newest", "Trending", "Top Rated"].map((sort) => (
                      <Button key={sort} variant="outline" size="sm" className="text-xs">
                        {sort}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course, i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="relative overflow-hidden">
                        <img src={courseImages[course.image]} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">{course.category}</span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <img src={`https://i.pravatar.cc/30?img=${i + 5}`} alt={course.instructor} className="w-6 h-6 rounded-full" />
                          <span className="text-xs text-muted-foreground">{course.instructor}</span>
                        </div>
                        <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2">{course.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.students}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`h-3.5 w-3.5 ${j < Math.floor(course.rating) ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">({course.reviews})</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div>
                            <span className="text-lg font-extrabold text-primary">{currency}{language === 'en' ? (course.price / 100).toFixed(2) : course.price}</span>
                            <span className="text-xs text-muted-foreground line-through ml-2">{currency}{language === 'en' ? (course.originalPrice / 100).toFixed(2) : course.originalPrice}</span>
                          </div>
                          <Link to={`/courses/${course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}>
                            <Button size="sm" variant="outline" className="text-xs">{t("coursepage.view_course")}</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  {[1, 2, 3].map((p) => (
                    <Button key={p} variant={p === 1 ? "default" : "outline"} size="sm" className={p === 1 ? "bg-primary text-primary-foreground" : ""}>
                      {p}
                    </Button>
                  ))}
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

export default Courses;
