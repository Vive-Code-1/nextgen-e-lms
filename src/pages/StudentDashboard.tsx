import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap, LayoutDashboard, Bell, BookOpen, ClipboardList,
  Star, User, LogOut, ShoppingBag, Menu, X
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import DashboardHome from "@/components/dashboard/DashboardHome";
import MyCourses from "@/components/dashboard/MyCourses";
import LessonPlayer from "@/components/dashboard/LessonPlayer";
import Announcements from "@/components/dashboard/Announcements";
import Assignments from "@/components/dashboard/Assignments";
import Reviews from "@/components/dashboard/Reviews";
import Profile from "@/components/dashboard/Profile";
import PurchaseHistory from "@/components/dashboard/PurchaseHistory";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "My Courses", id: "courses" },
  { icon: ShoppingBag, label: "Purchase History", id: "purchases" },
  { icon: Bell, label: "Announcements", id: "announcements" },
  { icon: ClipboardList, label: "Assignments", id: "assignments" },
  { icon: Star, label: "Reviews", id: "reviews" },
  { icon: User, label: "Profile", id: "profile" },
];

const StudentDashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;
  if (!user) return null;

  const openCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setActiveTab("lesson-player");
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const renderContent = () => {
    if (activeTab === "lesson-player" && activeCourseId) {
      return <LessonPlayer courseId={activeCourseId} onBack={() => setActiveTab("courses")} />;
    }
    switch (activeTab) {
      case "dashboard": return <DashboardHome onNavigate={handleNavigate} />;
      case "courses": return <MyCourses onOpenCourse={openCourse} />;
      case "purchases": return <PurchaseHistory />;
      case "announcements": return <Announcements />;
      case "assignments": return <Assignments />;
      case "reviews": return <Reviews />;
      case "profile": return <Profile />;
      default: return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[hsl(244,47%,20%)] hidden lg:flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
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
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[hsl(244,47%,20%)] flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <span className="text-white font-bold">NextGen LMS</span>
              <button onClick={() => setMobileOpen(false)} className="text-white"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {sidebarLinks.map(({ icon: Icon, label, id }) => (
                <button key={id} onClick={() => handleNavigate(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === id ? "bg-primary text-primary-foreground" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[hsl(244,47%,20%)] text-white">
          <button onClick={() => setMobileOpen(true)}><Menu className="h-6 w-6" /></button>
          <span className="font-bold">NextGen LMS</span>
          <div className="w-6" />
        </div>

        <DashboardTopBar activeTab={activeTab} sidebarLinks={sidebarLinks} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 lg:p-8 overflow-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
