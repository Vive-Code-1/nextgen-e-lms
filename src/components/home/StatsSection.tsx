import { Users, BookOpen, UserCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountUp } from "@/hooks/useCountUp";

const StatItem = ({ icon: Icon, value, suffix, label }: { icon: any; value: number; suffix: string; label: string }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <div className="rounded-full bg-accent/10 p-3 mb-1">
        <Icon className="h-7 w-7 text-accent" />
      </div>
      <span className="text-3xl md:text-4xl font-extrabold text-accent">{count}{suffix}</span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

const StatsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-secondary/50 py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatItem icon={Users} value={500} suffix="+" label={t("stats.students")} />
          <StatItem icon={BookOpen} value={120} suffix="+" label={t("stats.courses")} />
          <StatItem icon={UserCheck} value={50} suffix="+" label={t("stats.instructors")} />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
