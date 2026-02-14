import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import BlurText from "@/components/ui/BlurText";
import ScrollRevealText from "@/components/ui/ScrollReveal";
import { Link } from "react-router-dom";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { supabase } from "@/integrations/supabase/client";

const spotlightColors: Record<string, string> = {
  "Graphics Design": "rgba(124, 58, 237, 0.15)",
  "Design": "rgba(124, 58, 237, 0.15)",
  "Video Editing": "rgba(255, 70, 103, 0.15)",
  "Video": "rgba(255, 70, 103, 0.15)",
  "Digital Marketing": "rgba(251, 191, 36, 0.15)",
  "Marketing": "rgba(251, 191, 36, 0.15)",
  "SEO": "rgba(16, 185, 129, 0.15)",
  "Website Development": "rgba(30, 27, 75, 0.15)",
  "Development": "rgba(30, 27, 75, 0.15)",
  "Dropshipping": "rgba(6, 182, 212, 0.15)",
  "Business": "rgba(6, 182, 212, 0.15)",
};

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  price: number | null;
  discount_price: number | null;
  has_discount: boolean;
  is_free: boolean;
  level: string;
}

const CourseCard = ({ course }: { course: Course }) => {
  const { language } = useLanguage();
  const currency = language === 'en' ? '$' : '৳';

  const displayPrice = () => {
    if (course.is_free) return <span className="text-lg font-bold text-accent">Free</span>;
    const price = course.has_discount && course.discount_price ? course.discount_price : course.price;
    return <span className="text-lg font-bold text-accent">{currency}{price}</span>;
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card flex flex-col h-full">
      <div className="overflow-hidden">
        <img
          src={course.image_url || "/placeholder.svg"}
          alt={course.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-5 space-y-3 flex flex-col flex-1">
        {course.category && (
          <Badge className="bg-accent/10 text-accent border-0 hover:bg-accent/20 text-xs font-medium w-fit">
            {course.category}
          </Badge>
        )}
        <h3 className="font-semibold text-base text-primary leading-snug line-clamp-2">{course.title}</h3>
        <div className="flex-1" />
        <div className="flex items-center justify-between pt-1">
          {displayPrice()}
          <Link to={`/courses/${course.slug}`}>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 hover:scale-105">
              Enroll Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const PopularCourses = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, slug, category, image_url, price, discount_price, has_discount, is_free, level")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(8);
      setCourses(data || []);
    };
    fetchCourses();
  }, []);

  if (courses.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            <BlurText text={t("courses.title")} delay={200} animateBy="words" direction="top" className="text-3xl md:text-4xl font-bold text-foreground justify-center" />
          </h2>
          <ScrollRevealText baseRotation={0} containerClassName="text-muted-foreground max-w-2xl mx-auto" textClassName="text-muted-foreground">
            {t("courses.subtitle")}
          </ScrollRevealText>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <SpotlightCard key={course.id} spotlightColor={spotlightColors[course.category || ""] || "rgba(124, 58, 237, 0.15)"} className="bg-card">
              <CourseCard course={course} />
            </SpotlightCard>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/courses">
            <Button variant="outline" size="lg" className="px-8 font-semibold">{t("courses.view_all")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
