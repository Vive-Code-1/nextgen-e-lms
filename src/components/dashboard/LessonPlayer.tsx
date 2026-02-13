import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowLeft, ChevronDown, ChevronRight, PlayCircle } from "lucide-react";

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
  topic: string | null;
  completed: boolean;
}

interface TopicGroup {
  topic: string;
  lessons: Lesson[];
}

const getEmbedUrl = (url: string): string => {
  if (!url) return "";
  let videoId = "";
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) videoId = shortMatch[1];
  // youtube.com/watch?v=ID
  if (!videoId) {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) videoId = watchMatch[1];
  }
  // youtube.com/embed/ID
  if (!videoId) {
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) videoId = embedMatch[1];
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  return url;
};

const LessonPlayer = ({ courseId, onBack }: LessonPlayerProps) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
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

      const completedSet = new Set(
        progress?.filter((p: any) => p.completed).map((p: any) => p.lesson_id) || []
      );

      const mapped = (lessonData || []).map((l: any) => ({
        ...l,
        completed: completedSet.has(l.id),
      }));

      setLessons(mapped);
      if (mapped.length > 0) {
        setActiveLesson(mapped[0]);
        const firstTopic = mapped[0].topic || "General";
        setExpandedTopics(new Set([firstTopic]));
      }
      setLoading(false);
    };
    fetchData();
  }, [user, courseId]);

  const topicGroups = useMemo((): TopicGroup[] => {
    const map = new Map<string, Lesson[]>();
    lessons.forEach((l) => {
      const topic = l.topic || "General";
      if (!map.has(topic)) map.set(topic, []);
      map.get(topic)!.push(l);
    });
    return Array.from(map.entries()).map(([topic, lessons]) => ({ topic, lessons }));
  }, [lessons]);

  const completedCount = lessons.filter((l) => l.completed).length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    const topic = lesson.topic || "General";
    setExpandedTopics((prev) => new Set(prev).add(topic));
  };

  const updateEnrollmentProgress = async (newProgress: number) => {
    if (!user) return;
    await supabase
      .from("enrollments")
      .update({ progress: newProgress })
      .eq("course_id", courseId)
      .eq("user_id", user.id);
  };

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

    const updatedLessons = lessons.map((l) =>
      l.id === lesson.id ? { ...l, completed: newVal } : l
    );
    setLessons(updatedLessons);
    if (activeLesson?.id === lesson.id) setActiveLesson({ ...lesson, completed: newVal });

    const newCompleted = updatedLessons.filter((l) => l.completed).length;
    const newProgress = totalCount > 0 ? Math.round((newCompleted / totalCount) * 100) : 0;
    updateEnrollmentProgress(newProgress);
  };

  if (loading) return <p className="text-muted-foreground p-8">Loading lessons...</p>;

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </button>

      {/* Course header with progress */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">{courseTitle}</h2>
        <p className="text-sm text-muted-foreground mb-3">
          {completedCount} of {totalCount} lessons completed
        </p>
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="h-2.5 flex-1" />
          <span className="text-sm font-semibold text-primary min-w-[40px] text-right">{progressPercent}%</span>
        </div>
      </div>

      {lessons.length === 0 ? (
        <p className="text-muted-foreground">No lessons available yet.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Topic-grouped lessons */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 max-h-[600px] overflow-auto">
            <h3 className="font-semibold text-foreground text-sm mb-3">Course Curriculum</h3>
            <div className="space-y-1">
              {topicGroups.map((group, gi) => {
                const isExpanded = expandedTopics.has(group.topic);
                const groupCompleted = group.lessons.filter((l) => l.completed).length;
                return (
                  <div key={group.topic} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleTopic(group.topic)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-left">
                        {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                        <span>Section {gi + 1}: {group.topic}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{groupCompleted}/{group.lessons.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border">
                        {group.lessons.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => selectLesson(l)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                              activeLesson?.id === l.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                            }`}
                          >
                            {l.completed ? (
                              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <PlayCircle className="h-4 w-4 shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active lesson video + controls */}
          <div className="lg:col-span-2 space-y-4">
            {activeLesson && (
              <>
                {activeLesson.video_url && (
                  <div
                    className="aspect-video rounded-2xl overflow-hidden bg-black"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <iframe
                      src={getEmbedUrl(activeLesson.video_url)}
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
