import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle, CheckCircle, Award } from "lucide-react";

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { user, profile } = useAuth();
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("enrollments")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .then(({ count }) => setEnrollmentCount(count || 0));
  }, [user]);

  const stats = [
    { label: "Total Courses", value: enrollmentCount, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Running Courses", value: enrollmentCount, icon: PlayCircle, color: "bg-accent/10 text-accent" },
    { label: "Completed Courses", value: completedCount, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Certificates", value: 0, icon: Award, color: "bg-violet-500/10 text-violet-500" },
  ];

  const quickLinks = [
    { icon: BookOpen, label: "My Courses", color: "text-primary", tab: "courses" },
    { icon: Award, label: "Assignments", color: "text-accent", tab: "assignments" },
    { icon: CheckCircle, label: "Reviews", color: "text-emerald-500", tab: "reviews" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || user?.email?.split("@")[0]}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your learning progress overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Course Support</h3>
            <p className="text-sm opacity-90">Need help with your courses? Watch our tutorial videos or contact support.</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">Watch Video</Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {quickLinks.map((ql) => (
            <div
              key={ql.label}
              onClick={() => onNavigate(ql.tab)}
              className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <ql.icon className={`h-8 w-8 mx-auto mb-2 ${ql.color}`} />
              <p className="text-xs font-medium text-foreground">{ql.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">FAQ</h2>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {[
            { q: "How do I access my courses?", a: "Go to 'My Courses' from the sidebar to view all your enrolled courses." },
            { q: "How do I get my certificate?", a: "Complete all lessons in a course to automatically receive your certificate." },
            { q: "Can I download course materials?", a: "Yes, downloadable resources are available within each lesson page." },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
              <h4 className="font-semibold text-foreground text-sm mb-1">{faq.q}</h4>
              <p className="text-xs text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
