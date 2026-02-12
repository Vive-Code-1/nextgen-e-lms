import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  course_title: string;
  submission?: {
    id: string;
    content: string;
    status: string;
    marks: number | null;
    feedback: string | null;
  };
}

const Assignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // Get enrolled course ids
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);
      const courseIds = enrollments?.map((e: any) => e.course_id).filter(Boolean) || [];
      if (courseIds.length === 0) { setLoading(false); return; }

      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*, courses(title)")
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      const assignmentIds = assignmentData?.map((a: any) => a.id) || [];
      const { data: submissions } = assignmentIds.length > 0
        ? await supabase
            .from("assignment_submissions")
            .select("*")
            .eq("user_id", user.id)
            .in("assignment_id", assignmentIds)
        : { data: [] };

      const subMap = new Map((submissions || []).map((s: any) => [s.assignment_id, s]));

      setAssignments(
        (assignmentData || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          due_date: a.due_date,
          course_title: a.courses?.title || "",
          submission: subMap.get(a.id),
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleSubmit = async (assignmentId: string) => {
    if (!user || !submissionText.trim()) return;
    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      user_id: user.id,
      content: submissionText.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Submitted!", description: "Your assignment has been submitted." });
      setSubmitting(null);
      setSubmissionText("");
      // Refresh
      const { data } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("assignment_id", assignmentId)
        .single();
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, submission: data || undefined } : a))
      );
    }
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-accent" />;
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Assignments</h2>
      {assignments.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-foreground">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">{a.course_title}</p>
                </div>
                {a.due_date && (
                  <span className="text-xs text-muted-foreground">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                )}
              </div>
              {a.description && <p className="text-sm text-muted-foreground mb-3">{a.description}</p>}

              {a.submission ? (
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(a.submission.status)}
                    <span className="text-sm font-medium text-foreground capitalize">{a.submission.status}</span>
                    {a.submission.marks !== null && (
                      <span className="ml-auto text-sm font-bold text-primary">Marks: {a.submission.marks}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Your submission: {a.submission.content}</p>
                  {a.submission.feedback && (
                    <p className="text-xs text-foreground">Feedback: {a.submission.feedback}</p>
                  )}
                </div>
              ) : submitting === a.id ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Enter your submission (text or link)..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSubmit(a.id)}>
                      <Send className="h-4 w-4 mr-1" /> Submit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSubmitting(null); setSubmissionText(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setSubmitting(a.id)}>
                  Submit Assignment
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;
