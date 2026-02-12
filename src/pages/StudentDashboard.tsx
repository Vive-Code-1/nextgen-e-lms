import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, LayoutDashboard, Bell, BookOpen, Wrench, Gift,
  FileText, Star, CreditCard, User, LogOut, ChevronRight, PlayCircle,
  Award, CheckCircle, ClipboardList
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Bell, label: "Announcements" },
  { icon: BookOpen, label: "My Courses" },
  { icon: Wrench, label: "Tools" },
  { icon: Gift, label: "Promotions" },
  { icon: ClipboardList, label: "Assignments" },
  { icon: Gift, label: "Free Gifts" },
  { icon: Star, label: "Reviews" },
  { icon: CreditCard, label: "Subscriptions" },
  { icon: User, label: "Profile" },
];

const StudentDashboard = () => {
  const { user, isLoading, signOut, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("enrollments")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .then(({ count }) => setEnrollmentCount(count || 0));
    }
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;
  if (!user) return null;

  const stats = [
    { label: "Total Courses", value: enrollmentCount, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Running Courses", value: enrollmentCount, icon: PlayCircle, color: "bg-accent/10 text-accent" },
    { label: "Completed Courses", value: 0, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Certificates", value: 0, icon: Award, color: "bg-violet-500/10 text-violet-500" },
  ];

  const quickLinks = [
    { icon: BookOpen, label: "My Courses", color: "text-primary" },
    { icon: ClipboardList, label: "Assignments", color: "text-accent" },
    { icon: Gift, label: "Promotions", color: "text-emerald-500" },
    { icon: Gift, label: "Free Gifts", color: "text-pink-500" },
    { icon: User, label: "Profile", color: "text-violet-500" },
    { icon: Star, label: "Reviews", color: "text-amber-500" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
            <GraduationCap className="h-7 w-7 text-accent" />
            NextGen LMS
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {profile?.full_name || user.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your learning progress overview.</p>
        </div>

        {/* Stats */}
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

        {/* Course Support Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Course Support</h3>
              <p className="text-sm opacity-90">Need help with your courses? Watch our tutorial videos or contact support.</p>
            </div>
            <Button variant="secondary" size="sm" className="shrink-0">
              Watch Video
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((ql) => (
              <div key={ql.label} className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <ql.icon className={`h-8 w-8 mx-auto mb-2 ${ql.color}`} />
                <p className="text-xs font-medium text-foreground">{ql.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
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
      </main>
    </div>
  );
};

export default StudentDashboard;
