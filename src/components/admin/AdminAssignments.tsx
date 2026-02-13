import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, ClipboardList } from "lucide-react";

const AdminAssignments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [formCourse, setFormCourse] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formTotalMarks, setFormTotalMarks] = useState("0");
  const [formStatus, setFormStatus] = useState("published");
  const [saving, setSaving] = useState(false);

  // Submissions view
  const [viewingSubs, setViewingSubs] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const fetchAll = async () => {
    const [{ data: courseData }, { data: assignmentData }] = await Promise.all([
      supabase.from("courses").select("id, title").order("title"),
      supabase.from("assignments").select("*, courses(title)").order("created_at", { ascending: false }),
    ]);
    setCourses(courseData || []);
    const aList = assignmentData || [];
    setAssignments(aList);

    // Fetch submission counts
    if (aList.length > 0) {
      const ids = aList.map((a: any) => a.id);
      const { data: subs } = await supabase
        .from("assignment_submissions")
        .select("assignment_id")
        .in("assignment_id", ids);
      const counts: Record<string, number> = {};
      (subs || []).forEach((s: any) => { counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1; });
      setSubmissionCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setFormCourse(""); setFormTitle(""); setFormDescription(""); setFormInstructions("");
    setFormDueDate(""); setFormTotalMarks("0"); setFormStatus("published"); setEditingId(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setFormCourse(a.course_id);
    setFormTitle(a.title);
    setFormDescription(a.description || "");
    setFormInstructions(a.instructions || "");
    setFormDueDate(a.due_date ? a.due_date.split("T")[0] : "");
    setFormTotalMarks(a.total_marks?.toString() || "0");
    setFormStatus(a.status || "published");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formCourse || !user) return;
    setSaving(true);
    const payload = {
      course_id: formCourse, title: formTitle, description: formDescription || null,
      instructions: formInstructions || null, due_date: formDueDate || null,
      total_marks: Number(formTotalMarks) || 0, status: formStatus,
    };

    if (editingId) {
      const { error } = await supabase.from("assignments").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Assignment updated!" }); }
    } else {
      const { error } = await supabase.from("assignments").insert({ ...payload, created_by: user.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Assignment created!" }); }
    }
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from("assignments").delete().eq("id", id);
    toast({ title: "Assignment deleted" });
    fetchAll();
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

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.courses?.title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (viewingSubs) {
    return (
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
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Assignments</h2>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5">
          <Plus className="h-4 w-4 mr-1" />Add Assignment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-foreground">Assignment Name</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Total Marks</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Submissions</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No assignments found.</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.courses?.title}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{a.total_marks}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewSubmissions(a.id)} className="text-primary hover:underline font-medium">
                      {submissionCounts[a.id] || 0}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-accent/10 text-accent"}`}>
                      {a.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Course *</Label>
              <Select value={formCourse} onValueChange={setFormCourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assignment Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} placeholder="Brief description" />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea value={formInstructions} onChange={(e) => setFormInstructions(e.target.value)} rows={3} placeholder="Detailed instructions..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={formTotalMarks} onChange={(e) => setFormTotalMarks(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formCourse} className="w-full">
              {saving ? "Saving..." : editingId ? "Update Assignment" : "Create Assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
