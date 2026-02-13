import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, CheckCircle, Award } from "lucide-react";

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
}

interface ResumeInfo {
  courseId: string;
  courseTitle: string;
  courseImage: string | null;
  lessonTitle: string;
  progress: number;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const { user, profile } = useAuth();
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Get enrollments
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      const courseIds = (enrollments || []).map((e: any) => e.course_id).filter(Boolean);
      setEnrollmentCount(courseIds.length);

      if (courseIds.length === 0) return;

      // Get all lessons for enrolled courses
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds);

      const lessonIds = (lessons || []).map((l: any) => l.id);

      // Get progress
      const { data: progress } = lessonIds.length > 0
        ? await supabase
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds)
            .eq("completed", true)
        : { data: [] };

      const completedSet = new Set((progress || []).map((p: any) => p.lesson_id));

      // Calculate per-course completion
      let active = 0, completed = 0;
      courseIds.forEach((cid: string) => {
        const courseLessons = (lessons || []).filter((l: any) => l.course_id === cid);
        if (courseLessons.length === 0) { active++; return; }
        const done = courseLessons.filter((l: any) => completedSet.has(l.id)).length;
        if (done >= courseLessons.length) completed++;
        else active++;
      });
      setActiveCount(active);
      setCompletedCount(completed);

      // Pick up where you left off - find most recent lesson_progress
      const { data: recentProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at, lessons(id, title, course_id, courses(id, title, image_url))")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (recentProgress && recentProgress.length > 0) {
        const rp = recentProgress[0] as any;
        const course = rp.lessons?.courses;
        if (course) {
          const courseLessons = (lessons || []).filter((l: any) => l.course_id === course.id);
          const doneCount = courseLessons.filter((l: any) => completedSet.has(l.id)).length;
          const pct = courseLessons.length > 0 ? Math.round((doneCount / courseLessons.length) * 100) : 0;
          setResumeInfo({
            courseId: course.id,
            courseTitle: course.title,
            courseImage: course.image_url,
            lessonTitle: rp.lessons?.title || "",
            progress: pct,
          });
        }
      }
    };

    fetchStats();
  }, [user]);

  const stats = [
    { label: "Enrolled Courses", value: enrollmentCount, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Active Courses", value: activeCount, icon: PlayCircle, color: "bg-accent/10 text-accent" },
    { label: "Completed Courses", value: completedCount, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Certificates", value: completedCount, icon: Award, color: "bg-violet-500/10 text-violet-500" },
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

      {/* Pick up where you left off */}
      {resumeInfo && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row">
            {resumeInfo.courseImage && (
              <img src={resumeInfo.courseImage} alt="" className="h-32 sm:h-auto sm:w-48 object-cover" />
            )}
            <div className="p-5 flex-1 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground mb-1">Pick Up Where You Left Off</p>
              <h3 className="font-bold text-foreground mb-1">{resumeInfo.courseTitle}</h3>
              <p className="text-xs text-muted-foreground mb-3">Last: {resumeInfo.lessonTitle}</p>
              <div className="flex items-center gap-3">
                <Progress value={resumeInfo.progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">{resumeInfo.progress}%</span>
              </div>
              <Button
                size="sm"
                className="mt-3 w-fit bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => onNavigate("courses")}
              >
                <PlayCircle className="h-4 w-4 mr-2" /> Resume
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: "My Courses", color: "text-primary", tab: "courses" },
            { icon: Award, label: "Assignments", color: "text-accent", tab: "assignments" },
            { icon: CheckCircle, label: "Reviews", color: "text-emerald-500", tab: "reviews" },
            { icon: PlayCircle, label: "Purchases", color: "text-violet-500", tab: "purchases" },
          ].map((ql) => (
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
    </>
  );
};

export default DashboardHome;
