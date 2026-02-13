import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

interface QuizAttempt {
  id: string;
  lesson_title: string;
  course_title: string;
  score: number;
  total: number;
  passed: boolean;
  answers: any[];
  created_at: string;
}

const QuizAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*, lessons(title, course_id, courses(title))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAttempts(
        (data || []).map((a: any) => ({
          id: a.id,
          lesson_title: a.lessons?.title || "Unknown",
          course_title: a.lessons?.courses?.title || "Unknown",
          score: a.score,
          total: a.total,
          passed: a.passed,
          answers: a.answers || [],
          created_at: a.created_at,
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Quiz Attempts</h2>
      {attempts.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No quiz attempts yet</h3>
          <p className="text-muted-foreground text-sm">Complete quizzes in your courses to see results here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Course</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Quiz</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Result</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <>
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground">{a.course_title}</td>
                      <td className="py-3 px-4 text-foreground">{a.lesson_title}</td>
                      <td className="py-3 px-4 text-foreground font-bold">{a.score}/{a.total}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          a.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        }`}>
                          {a.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {a.passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                          {expanded === a.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {expanded === a.id && a.answers.length > 0 && (
                      <tr key={`${a.id}-details`}>
                        <td colSpan={6} className="px-4 py-3 bg-muted/30">
                          <div className="space-y-2">
                            {a.answers.map((ans: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                {ans.correct ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                                )}
                                <div>
                                  <p className="text-foreground font-medium">{ans.question}</p>
                                  <p className="text-muted-foreground">Your answer: {ans.selected} {!ans.correct && `(Correct: ${ans.correctAnswer})`}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempts;
