import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Clock, Users, BookOpen, Play, Heart, Share2, ChevronRight, Award, Monitor, FileText, Download, Smartphone } from "lucide-react";

const courseData: Record<string, any> = {
  "complete-graphics-design-masterclass": {
    title: "Complete Graphics Design Masterclass",
    subtitle: "Learn professional graphics design from scratch to advanced level",
    category: "Graphics Design",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=450&fit=crop",
    rating: 4.8,
    reviews: 245,
    price: 49.99,
    originalPrice: 99.99,
    students: 1200,
    duration: "40 hrs",
    lessons: 85,
    level: "All Levels",
    instructor: {
      name: "Nadia Islam",
      role: "Senior Graphics Designer",
      avatar: "https://i.pravatar.cc/100?img=5",
      courses: 12,
      students: 4500,
      bio: "Nadia is a professional graphics designer with 8+ years of experience working with international brands.",
    },
    description: "This comprehensive masterclass covers everything from basics of design principles to advanced techniques in Adobe Photoshop, Illustrator, and InDesign. You'll build a professional portfolio by the end.",
    whatYouLearn: [
      "Master Adobe Photoshop, Illustrator & InDesign",
      "Design logos, branding materials & social media graphics",
      "Understand color theory, typography & composition",
      "Create print-ready & digital designs",
      "Build a professional design portfolio",
      "Learn client management & freelancing tips",
    ],
    requirements: ["No prior design experience needed", "A computer with internet access", "Adobe Creative Suite (free trial available)"],
    chapters: [
      { title: "Getting Started with Design", lectures: [{ name: "Introduction to Graphics Design", duration: "12:30", preview: true }, { name: "Setting Up Your Workspace", duration: "15:00" }, { name: "Understanding Design Principles", duration: "20:00" }] },
      { title: "Mastering Adobe Photoshop", lectures: [{ name: "Photoshop Interface Overview", duration: "18:00" }, { name: "Layers & Masks", duration: "25:00" }, { name: "Photo Retouching Techniques", duration: "30:00" }] },
      { title: "Adobe Illustrator Essentials", lectures: [{ name: "Vector Graphics Fundamentals", duration: "22:00" }, { name: "Logo Design Workshop", duration: "35:00" }, { name: "Icon Design & Illustrations", duration: "28:00" }] },
    ],
    includes: ["40 hours on-demand video", "25 downloadable resources", "Lifetime access", "Mobile access", "15 assignments", "Certificate of completion"],
  },
  "professional-video-editing-with-premiere-pro": {
    title: "Professional Video Editing with Premiere Pro",
    subtitle: "Master video editing and create cinematic content",
    category: "Video Editing",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=450&fit=crop",
    rating: 4.7, reviews: 189, price: 44.99, originalPrice: 79.99, students: 890, duration: "35 hrs", lessons: 72, level: "Intermediate",
    instructor: { name: "James Wilson", role: "Video Production Expert", avatar: "https://i.pravatar.cc/100?img=12", courses: 8, students: 3200, bio: "James has produced content for major media companies and YouTube creators." },
    description: "Learn professional video editing with Adobe Premiere Pro. From basic cuts to advanced color grading and motion graphics.",
    whatYouLearn: ["Master Adobe Premiere Pro", "Color grading & correction", "Audio editing & mixing", "Motion graphics basics", "Export settings for all platforms", "Storytelling through editing"],
    requirements: ["Basic computer skills", "Adobe Premiere Pro installed"],
    chapters: [
      { title: "Premiere Pro Basics", lectures: [{ name: "Interface Overview", duration: "15:00", preview: true }, { name: "Importing & Organizing Media", duration: "20:00" }] },
      { title: "Advanced Editing", lectures: [{ name: "Color Grading", duration: "30:00" }, { name: "Audio Mixing", duration: "25:00" }] },
    ],
    includes: ["35 hours on-demand video", "20 downloadable resources", "Lifetime access", "Mobile access", "10 assignments", "Certificate of completion"],
  },
};

// Generate entries for remaining courses with shared template
const defaultCourse = (title: string, cat: string, img: string, price: number, orig: number, rating: number, students: number, dur: string) => ({
  title, subtitle: `Master ${cat} with hands-on projects`, category: cat, image: img, rating, reviews: 150, price, originalPrice: orig, students, duration: dur, lessons: 60, level: "All Levels",
  instructor: { name: "Expert Instructor", role: `${cat} Specialist`, avatar: "https://i.pravatar.cc/100?img=15", courses: 10, students: 3000, bio: `Industry expert with extensive experience in ${cat}.` },
  description: `Comprehensive course covering all aspects of ${cat}. Build real projects and gain practical skills.`,
  whatYouLearn: [`Master core ${cat} concepts`, "Build real-world projects", "Industry best practices", "Professional workflow", "Portfolio development", "Career guidance"],
  requirements: ["No prior experience needed", "Computer with internet access"],
  chapters: [
    { title: "Fundamentals", lectures: [{ name: "Introduction", duration: "15:00", preview: true }, { name: "Core Concepts", duration: "25:00" }] },
    { title: "Advanced Topics", lectures: [{ name: "Advanced Techniques", duration: "30:00" }, { name: "Real Projects", duration: "35:00" }] },
  ],
  includes: [`${dur} on-demand video`, "15 downloadable resources", "Lifetime access", "Mobile access", "12 assignments", "Certificate of completion"],
});

const extraCourses: Record<string, any> = {
  "digital-marketing-social-media-strategy": defaultCourse("Digital Marketing & Social Media Strategy", "Digital Marketing", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop", 59.99, 129.99, 4.9, 1500, "30 hrs"),
  "seo-mastery-rank-1-on-google": defaultCourse("SEO Mastery: Rank #1 on Google", "SEO", "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=800&h=450&fit=crop", 39.99, 59.99, 4.6, 780, "25 hrs"),
  "full-stack-web-development-bootcamp": defaultCourse("Full-Stack Web Development Bootcamp", "Website Development", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop", 54.99, 109.99, 4.8, 650, "45 hrs"),
  "dropshipping-business-from-scratch": defaultCourse("Dropshipping Business from Scratch", "Dropshipping", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop", 34.99, 69.99, 4.5, 920, "35 hrs"),
  "advanced-graphics-design-portfolio": defaultCourse("Advanced Graphics Design Portfolio", "Graphics Design", "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop", 54.99, 89.99, 4.7, 540, "28 hrs"),
  "full-stack-javascript-development": defaultCourse("Full Stack JavaScript Development", "Website Development", "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop", 64.99, 139.99, 4.9, 1100, "50 hrs"),
};

const allCourses = { ...courseData, ...extraCourses };

const CourseDetails = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const currency = language === "en" ? "$" : "৳";

  const course = slug ? allCourses[slug] : null;

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
        {/* Header Banner */}
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
            <p className="text-white/80 text-lg mb-4">{course.subtitle}</p>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <Badge className="bg-accent text-accent-foreground">{course.category}</Badge>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(course.rating) ? "fill-yellow-400 text-yellow-400" : "text-white/40"}`} />
                ))}
                <span className="ml-1">{course.rating} ({course.reviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.students} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Course Preview */}
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img src={course.image} alt={course.title} className="w-full h-auto object-cover" />
                </div>

                {/* Overview */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-3">Course Description</h2>
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">What You'll Learn</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {course.whatYouLearn.map((item: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 shrink-0">
                            <span className="text-accent text-xs">✓</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">Requirements</h3>
                    <ul className="space-y-1.5">
                      {course.requirements.map((req: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Course Content */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Course Content</h2>
                  <Accordion type="multiple" className="space-y-2">
                    {course.chapters.map((ch: any, i: number) => (
                      <AccordionItem key={i} value={`ch-${i}`} className="border border-border rounded-xl px-4">
                        <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            {ch.title}
                            <span className="text-xs text-muted-foreground font-normal ml-2">{ch.lectures.length} lectures</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {ch.lectures.map((lec: any, j: number) => (
                              <div key={j} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Play className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm text-foreground">{lec.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {lec.preview && <span className="text-xs text-accent font-medium">Preview</span>}
                                  <span className="text-xs text-muted-foreground">{lec.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Instructor */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">About the Instructor</h2>
                  <div className="flex items-start gap-4">
                    <img src={course.instructor.avatar} alt={course.instructor.name} className="w-20 h-20 rounded-full object-cover" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{course.instructor.name}</h3>
                      <p className="text-sm text-accent font-medium">{course.instructor.role}</p>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{course.instructor.courses} Courses</span>
                        <span>{course.instructor.students} Students</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">{course.instructor.bio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-primary">{currency}{course.price}</span>
                    <span className="text-lg text-muted-foreground line-through">{currency}{course.originalPrice}</span>
                    <Badge className="bg-destructive text-destructive-foreground">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2"><Heart className="h-4 w-4" />Wishlist</Button>
                    <Button variant="outline" className="flex-1 gap-2"><Share2 className="h-4 w-4" />Share</Button>
                  </div>

                  <Link to={`/checkout/${slug}`} className="block">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6">
                      {t("courses.enroll")}
                    </Button>
                  </Link>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">This Course Includes:</h4>
                    <div className="space-y-2.5">
                      {[
                        { icon: Monitor, text: course.includes[0] },
                        { icon: Download, text: course.includes[1] },
                        { icon: Clock, text: course.includes[2] },
                        { icon: Smartphone, text: course.includes[3] },
                        { icon: FileText, text: course.includes[4] },
                        { icon: Award, text: course.includes[5] },
                      ].map(({ icon: Icon, text }, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-foreground mb-3">Course Features</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between"><span>Enrolled</span><span className="font-medium text-foreground">{course.students}</span></div>
                      <div className="flex justify-between"><span>Duration</span><span className="font-medium text-foreground">{course.duration}</span></div>
                      <div className="flex justify-between"><span>Lectures</span><span className="font-medium text-foreground">{course.lessons}</span></div>
                      <div className="flex justify-between"><span>Level</span><span className="font-medium text-foreground">{course.level}</span></div>
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
