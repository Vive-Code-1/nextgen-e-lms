import { Heart, CheckCircle, Users } from "lucide-react";
import BlurText from "@/components/ui/BlurText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const instructors = [
  {
    name: "Sarah Johnson",
    role: "Web Development",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    courses: 15,
    students: 1200,
    verified: true,
  },
  {
    name: "Michael Chen",
    role: "Data Science",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    courses: 12,
    students: 980,
    verified: true,
  },
  {
    name: "Emily Rodriguez",
    role: "UI/UX Design",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    courses: 8,
    students: 750,
    verified: true,
  },
  {
    name: "David Kim",
    role: "Digital Marketing",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    courses: 10,
    students: 1100,
    verified: false,
  },
  {
    name: "Fatima Ahmed",
    role: "SEO Expert",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
    courses: 6,
    students: 620,
    verified: true,
  },
  {
    name: "James Wilson",
    role: "Video Editing",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    courses: 9,
    students: 870,
    verified: true,
  },
];

const InstructorCard = ({ instructor }: { instructor: (typeof instructors)[0] }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={instructor.image}
          alt={instructor.name}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {instructor.courses} {t("instructors.courses_label")}
        </span>
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-coral-pink" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-foreground">{instructor.name}</h3>
          {instructor.verified && (
            <CheckCircle className="h-4 w-4 text-emerald-accent fill-emerald-accent" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{instructor.role}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{instructor.students} {t("instructors.students_label")}</span>
        </div>
      </div>
    </div>
  );
};

const FeaturedInstructors = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="max-w-[80vw] mx-auto px-4" ref={ref}>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mb-3">
            <BlurText text={t("instructors.title")} delay={200} animateBy="words" direction="top" className="text-2xl md:text-4xl font-extrabold text-foreground justify-center" />
          </h2>
          <ScrollReveal
            baseRotation={0}
            containerClassName="text-muted-foreground max-w-2xl mx-auto"
            textClassName="text-muted-foreground"
          >
            {t("instructors.subtitle")}
          </ScrollReveal>
        </div>
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {instructors.map((instructor) => (
                <CarouselItem key={instructor.name} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                  <InstructorCard instructor={instructor} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-6 bg-card border-border" />
            <CarouselNext className="-right-6 bg-card border-border" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstructors;
