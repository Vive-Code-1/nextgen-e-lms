import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ScrollFloat from "@/components/ui/ScrollFloat";
import ScrollRevealText from "@/components/ui/ScrollReveal";

const courses = [
  {
    titleKey: "courses.graphics_design_course",
    catKey: "categories.graphics_design",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop",
    rating: 4.8,
    price: "$49.99",
  },
  {
    titleKey: "courses.video_editing_course",
    catKey: "categories.video_editing",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop",
    rating: 4.7,
    price: "$44.99",
  },
  {
    titleKey: "courses.digital_marketing_course",
    catKey: "categories.digital_marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    rating: 4.9,
    price: "$59.99",
  },
  {
    titleKey: "courses.seo_course",
    catKey: "categories.seo",
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=250&fit=crop",
    rating: 4.6,
    price: "$39.99",
  },
  {
    titleKey: "courses.web_dev_course",
    catKey: "categories.web_dev",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
    rating: 4.8,
    price: "$54.99",
  },
  {
    titleKey: "courses.dropshipping_course",
    catKey: "categories.dropshipping",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
    rating: 4.5,
    price: "$34.99",
  },
];

const CourseCard = ({ course }: { course: (typeof courses)[0] }) => {
  const { t } = useLanguage();
  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card">
      <div className="overflow-hidden">
        <img
          src={course.image}
          alt={t(course.titleKey)}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-5 space-y-3">
        <Badge className="bg-accent/10 text-accent border-0 hover:bg-accent/20 text-xs font-medium">
          {t(course.catKey)}
        </Badge>
        <h3 className="font-semibold text-base text-primary leading-snug">
          {t(course.titleKey)}
        </h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.floor(course.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">{course.rating}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-accent">{course.price}</span>
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 hover:scale-105">
            {t("courses.enroll")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PopularCourses = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-[80vw] mx-auto px-4" ref={ref}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            <ScrollFloat textClassName="text-3xl md:text-4xl font-bold text-foreground">
              {t("courses.title")}
            </ScrollFloat>
          </h2>
          <ScrollRevealText
            baseRotation={0}
            containerClassName="text-muted-foreground max-w-2xl mx-auto"
            textClassName="text-muted-foreground"
          >
            {t("courses.subtitle")}
          </ScrollRevealText>
        </div>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {courses.map((course) => (
            <CourseCard key={course.titleKey} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;
