import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap, LayoutDashboard, Bell, BookOpen, ClipboardList,
  Star, User, LogOut
} from "lucide-react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MyCourses from "@/components/dashboard/MyCourses";
import LessonPlayer from "@/components/dashboard/LessonPlayer";
import Announcements from "@/components/dashboard/Announcements";
import Assignments from "@/components/dashboard/Assignments";
import Reviews from "@/components/dashboard/Reviews";
import Profile from "@/components/dashboard/Profile";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Bell, label: "Announcements", id: "announcements" },
  { icon: BookOpen, label: "My Courses", id: "courses" },
  { icon: ClipboardList, label: "Assignments", id: "assignments" },
  { icon: Star, label: "Reviews", id: "reviews" },
  { icon: User, label: "Profile", id: "profile" },
];

const StudentDashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;
  if (!user) return null;

  const openCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setActiveTab("lesson-player");
  };

  const renderContent = () => {
    if (activeTab === "lesson-player" && activeCourseId) {
      return <LessonPlayer courseId={activeCourseId} onBack={() => setActiveTab("courses")} />;
    }
    switch (activeTab) {
      case "dashboard": return <DashboardHome onNavigate={setActiveTab} />;
      case "courses": return <MyCourses onOpenCourse={openCourse} />;
      case "announcements": return <Announcements />;
      case "assignments": return <Assignments />;
      case "reviews": return <Reviews />;
      case "profile": return <Profile />;
      default: return <DashboardHome onNavigate={setActiveTab} />;
    }
  };

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
          {sidebarLinks.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
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

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-50">
        {sidebarLinks.slice(0, 5).map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto pb-20 lg:pb-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;
