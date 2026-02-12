import { BookOpen, Users, Award, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { icon: BookOpen, value: 10, label: "stats.online_courses", color: "text-coral-pink", bg: "bg-coral-pink/10", suffix: "K" },
  { icon: Users, value: 20, label: "stats.expert_tutors", color: "text-violet-brand", bg: "bg-violet-brand/10", suffix: "+" },
  { icon: Award, value: 6, label: "stats.certified_courses", color: "text-blue-500", bg: "bg-blue-500/10", suffix: "K" },
  { icon: GraduationCap, value: 5, label: "stats.online_students", color: "text-cyan-500", bg: "bg-cyan-500/10", suffix: "K" },
];

const StatCard = ({ icon: Icon, value, label, color, bg, suffix }: { icon: any; value: number; label: string; color: string; bg: string; suffix: string }) => {
  const { t } = useLanguage();
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex items-center gap-2 bg-white/10 backdrop-blur-xl shadow-lg border border-white/20 rounded-xl p-2.5">
      <div className={`rounded-full ${bg} p-1.5 shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <span className="text-base md:text-lg font-extrabold text-white">{count}{suffix}</span>
        <p className="text-[10px] text-white/70 leading-tight">{t(label)}</p>
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
