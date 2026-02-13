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
  total_marks: number;
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
    const fetchData = async () => {
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
        .eq("status", "published")
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
          total_marks: a.total_marks || 0,
          course_title: a.courses?.title || "",
          submission: subMap.get(a.id),
        }))
      );
      setLoading(false);
    };
    fetchData();
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

  const statusLabel = (status: string) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-foreground text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-primary font-medium mb-2">{a.course_title}</p>
                {a.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{a.description}</p>}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  {a.due_date && <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                  {a.total_marks > 0 && <span>Marks: {a.total_marks}</span>}
                </div>
              </div>

              {a.submission ? (
                <div className="bg-muted rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    {statusIcon(a.submission.status)}
                    <span className="text-xs font-medium text-foreground">{statusLabel(a.submission.status)}</span>
                    {a.submission.marks !== null && (
                      <span className="ml-auto text-xs font-bold text-primary">{a.submission.marks}/{a.total_marks || "—"}</span>
                    )}
                  </div>
                  {a.submission.feedback && (
                    <p className="text-xs text-muted-foreground">Feedback: {a.submission.feedback}</p>
                  )}
                </div>
              ) : submitting === a.id ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your submission..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSubmit(a.id)} className="flex-1">
                      <Send className="h-3.5 w-3.5 mr-1" /> Submit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSubmitting(null); setSubmissionText(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setSubmitting(a.id)} className="w-full mt-2">
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
