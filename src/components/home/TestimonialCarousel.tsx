import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollFloat from "@/components/ui/ScrollFloat";

const testimonials = [
  {
    name: "Rahim Uddin",
    role: "Web Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    commentKey: "testimonial.1",
  },
  {
    name: "Fatima Akter",
    role: "Graphic Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    commentKey: "testimonial.2",
  },
  {
    name: "Kamal Hossain",
    role: "Digital Marketer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    rating: 4,
    commentKey: "testimonial.3",
  },
  {
    name: "Nusrat Jahan",
    role: "SEO Specialist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    commentKey: "testimonial.4",
  },
  {
    name: "Arif Rahman",
    role: "Video Editor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    commentKey: "testimonial.5",
  },
  {
    name: "Sumaiya Islam",
    role: "Full Stack Developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    rating: 4,
    commentKey: "testimonial.6",
  },
];

const TestimonialCarousel = () => {
  const { t } = useLanguage();

  const allItems = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-20 bg-background overflow-hidden">
      <div className="max-w-[80vw] mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
          <ScrollFloat textClassName="text-3xl md:text-4xl font-extrabold text-foreground">
            {t("testimonials.title")}
          </ScrollFloat>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("testimonials.subtitle")}
        </p>
      </div>

      <div className="relative">
        {/* Left blur */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right blur */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <div
            className="flex gap-6 hover:[animation-play-state:paused]"
            style={{
              animation: "testimonial-scroll 35s linear infinite",
              width: "max-content",
            }}
          >
            {allItems.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] md:w-[380px]"
              >
                <div className="bg-card border border-border rounded-2xl p-6 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s < item.rating
                            ? "fill-accent text-accent"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    "{t(item.commentKey)}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes testimonial-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default TestimonialCarousel;
