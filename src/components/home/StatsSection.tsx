import { BookOpen, Users, Award, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { icon: BookOpen, value: 10, label: "stats.online_courses", color: "text-coral-pink", bg: "bg-coral-pink/10" },
  { icon: Users, value: 200, label: "stats.expert_tutors", color: "text-violet-brand", bg: "bg-violet-brand/10" },
  { icon: Award, value: 6, label: "stats.certified_courses", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: GraduationCap, value: 60, label: "stats.online_students", color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

const StatCard = ({ icon: Icon, value, label, color, bg }: { icon: any; value: number; label: string; color: string; bg: string }) => {
  const { t } = useLanguage();
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex items-center gap-4 bg-white/70 backdrop-blur-md shadow-lg border border-white/30 rounded-2xl p-5">
      <div className={`rounded-full ${bg} p-3 shrink-0`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <span className="text-2xl md:text-3xl font-extrabold text-foreground">{count}K</span>
        <p className="text-sm text-muted-foreground">{t(label)}</p>
      </div>
    </div>
  );
};

const StatsSection = ({ embedded = false }: { embedded?: boolean }) => {
  if (embedded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    );
  }

  return (
    <section className="relative z-10 -mt-28">
      <div className="max-w-[80vw] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
