import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, ClipboardList } from "lucide-react";

const AdminAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewingSubs, setViewingSubs] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    supabase.from("courses").select("id, title").then(({ data }) => setCourses(data || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    supabase
      .from("assignments")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAssignments(data || []));
  }, [selectedCourse]);

  const handleAdd = async () => {
    if (!title.trim() || !user || !selectedCourse) return;
    const { error } = await supabase.from("assignments").insert({
      course_id: selectedCourse, title, description: description || null,
      due_date: dueDate || null, created_by: user.id,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Assignment created!" });
    setTitle(""); setDescription(""); setDueDate("");
    const { data } = await supabase.from("assignments").select("*").eq("course_id", selectedCourse).order("created_at", { ascending: false });
    setAssignments(data || []);
  };

  const viewSubmissions = async (assignmentId: string) => {
    setViewingSubs(assignmentId);
    const { data } = await supabase
      .from("assignment_submissions")
      .select("*, profiles:user_id(full_name, email)")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });
    setSubmissions(data || []);
  };

  const updateSubmission = async (subId: string, status: string, marks: number | null, feedback: string) => {
    await supabase.from("assignment_submissions").update({ status, marks, feedback: feedback || null }).eq("id", subId);
    toast({ title: `Submission ${status}` });
    if (viewingSubs) viewSubmissions(viewingSubs);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Assignments Management</h2>
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground block mb-1">Select Course</label>
        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); setViewingSubs(null); }}
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Choose a course...</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourse && !viewingSubs && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5 mb-4 space-y-3">
            <Input placeholder="Assignment title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-48" />
            <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />Create Assignment</Button>
          </div>

          <div className="space-y-2">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{a.title}</p>
                  {a.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
                <Button size="sm" variant="outline" onClick={() => viewSubmissions(a.id)}>
                  <ClipboardList className="h-4 w-4 mr-1" />Submissions
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {viewingSubs && (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setViewingSubs(null)} className="mb-4">← Back to assignments</Button>
          <h3 className="font-semibold text-foreground mb-3">Submissions</h3>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <SubmissionCard key={s.id} submission={s} onUpdate={updateSubmission} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SubmissionCard = ({ submission: s, onUpdate }: { submission: any; onUpdate: (id: string, status: string, marks: number | null, feedback: string) => void }) => {
  const [marks, setMarks] = useState(s.marks?.toString() || "");
  const [feedback, setFeedback] = useState(s.feedback || "");

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground text-sm">{(s as any).profiles?.full_name || (s as any).profiles?.email || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">{new Date(s.submitted_at).toLocaleString()}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${s.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : s.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
          {s.status}
        </span>
      </div>
      <p className="text-sm text-foreground bg-muted rounded-lg p-3">{s.content}</p>
      <div className="flex gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Marks</label>
          <Input value={marks} onChange={(e) => setMarks(e.target.value)} className="w-20" type="number" />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-foreground block mb-1">Feedback</label>
          <Input value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onUpdate(s.id, "approved", marks ? Number(marks) : null, feedback)} className="text-emerald-600">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onUpdate(s.id, "rejected", marks ? Number(marks) : null, feedback)} className="text-destructive">
          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
        </Button>
      </div>
    </div>
  );
};

export default AdminAssignments;
