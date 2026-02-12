import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle } from "lucide-react";

interface MyCoursesProps {
  onOpenCourse: (courseId: string) => void;
}

interface EnrolledCourse {
  id: string;
  course_id: string;
  title: string;
  image_url: string | null;
  instructor_name: string | null;
  totalLessons: number;
  completedLessons: number;
}

const MyCourses = ({ onOpenCourse }: MyCoursesProps) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchCourses = async () => {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, course_id, courses(id, title, image_url, instructor_name)")
        .eq("user_id", user.id);

      if (!enrollments) { setLoading(false); return; }

      const courseIds = enrollments.map((e: any) => e.course_id).filter(Boolean);
      
      // Get lesson counts
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, course_id")
        .in("course_id", courseIds);

      // Get progress
      const lessonIds = lessons?.map((l: any) => l.id) || [];
      const { data: progress } = lessonIds.length > 0
        ? await supabase
            .from("lesson_progress")
            .select("lesson_id, completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds)
            .eq("completed", true)
        : { data: [] };

      const completedSet = new Set(progress?.map((p: any) => p.lesson_id) || []);

      const result: EnrolledCourse[] = enrollments.map((e: any) => {
        const course = e.courses;
        const courseLessons = lessons?.filter((l: any) => l.course_id === e.course_id) || [];
        return {
          id: e.id,
          course_id: e.course_id,
          title: course?.title || "Untitled",
          image_url: course?.image_url,
          instructor_name: course?.instructor_name,
          totalLessons: courseLessons.length,
          completedLessons: courseLessons.filter((l: any) => completedSet.has(l.id)).length,
        };
      });

      setCourses(result);
      setLoading(false);
    };
    fetchCourses();
  }, [user]);

  if (loading) return <p className="text-muted-foreground">Loading courses...</p>;

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No courses yet</h3>
        <p className="text-muted-foreground text-sm">Enroll in a course to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">My Courses</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => {
          const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
          return (
            <div key={c.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
              {c.image_url && (
                <img src={c.image_url} alt={c.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground mb-1">{c.title}</h3>
                {c.instructor_name && (
                  <p className="text-xs text-muted-foreground mb-3">Mentor: {c.instructor_name}</p>
                )}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{c.completedLessons}/{c.totalLessons} lessons</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2 mb-3" />
                  <Button size="sm" className="w-full" onClick={() => onOpenCourse(c.course_id)}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
