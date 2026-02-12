import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react";

interface LessonPlayerProps {
  courseId: string;
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  video_url: string | null;
  notes: string | null;
  sort_order: number;
  completed: boolean;
}

const LessonPlayer = ({ courseId, onBack }: LessonPlayerProps) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", courseId)
        .single();
      setCourseTitle(course?.title || "");

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order");

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);

      const completedSet = new Set(progress?.filter((p: any) => p.completed).map((p: any) => p.lesson_id) || []);

      const mapped = (lessonData || []).map((l: any) => ({
        ...l,
        completed: completedSet.has(l.id),
      }));

      setLessons(mapped);
      if (mapped.length > 0) setActiveLesson(mapped[0]);
      setLoading(false);
    };
    fetch();
  }, [user, courseId]);

  const toggleComplete = async (lesson: Lesson) => {
    if (!user) return;
    const newVal = !lesson.completed;

    if (newVal) {
      await supabase.from("lesson_progress").upsert(
        { user_id: user.id, lesson_id: lesson.id, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
    } else {
      await supabase
        .from("lesson_progress")
        .update({ completed: false, completed_at: null })
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id);
    }

    setLessons((prev) =>
      prev.map((l) => (l.id === lesson.id ? { ...l, completed: newVal } : l))
    );
    if (activeLesson?.id === lesson.id) setActiveLesson({ ...lesson, completed: newVal });
  };

  if (loading) return <p className="text-muted-foreground">Loading lessons...</p>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </button>
      <h2 className="text-xl font-bold text-foreground mb-6">{courseTitle}</h2>

      {lessons.length === 0 ? (
        <p className="text-muted-foreground">No lessons available yet.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson list */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 space-y-1 max-h-[600px] overflow-auto">
            <h3 className="font-semibold text-foreground text-sm mb-3">Lessons</h3>
            {lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveLesson(l)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeLesson?.id === l.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {l.completed ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{i + 1}. {l.title}</span>
              </button>
            ))}
          </div>

          {/* Active lesson */}
          <div className="lg:col-span-2 space-y-4">
            {activeLesson && (
              <>
                {activeLesson.video_url && (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={activeLesson.video_url}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{activeLesson.title}</h3>
                  <Button
                    size="sm"
                    variant={activeLesson.completed ? "secondary" : "default"}
                    onClick={() => toggleComplete(activeLesson)}
                  >
                    {activeLesson.completed ? "Completed ✓" : "Mark Complete"}
                  </Button>
                </div>
                {activeLesson.notes && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Notes / Prompts</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{activeLesson.notes}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlayer;
