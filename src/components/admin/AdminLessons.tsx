import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, X, BookOpen } from "lucide-react";

const AdminLessons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", video_url: "", notes: "", sort_order: 0 });

  useEffect(() => {
    supabase.from("courses").select("id, title").then(({ data }) => setCourses(data || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("sort_order")
      .then(({ data }) => setLessons(data || []));
  }, [selectedCourse]);

  const resetForm = () => { setForm({ title: "", video_url: "", notes: "", sort_order: 0 }); setEditing(null); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editing) {
      const { error } = await supabase.from("lessons").update({
        title: form.title, video_url: form.video_url || null, notes: form.notes || null, sort_order: form.sort_order
      }).eq("id", editing);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lesson updated!" });
    } else {
      const { error } = await supabase.from("lessons").insert({
        course_id: selectedCourse, title: form.title, video_url: form.video_url || null,
        notes: form.notes || null, sort_order: form.sort_order,
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Lesson added!" });
    }
    resetForm();
    const { data } = await supabase.from("lessons").select("*").eq("course_id", selectedCourse).order("sort_order");
    setLessons(data || []);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("lessons").delete().eq("id", id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Lesson deleted" });
  };

  const startEdit = (l: any) => {
    setEditing(l.id);
    setForm({ title: l.title, video_url: l.video_url || "", notes: l.notes || "", sort_order: l.sort_order });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Lessons Management</h2>
      <div className="mb-4">
        <label className="text-sm font-medium text-foreground block mb-1">Select Course</label>
        <select value={selectedCourse} onChange={(e) => { setSelectedCourse(e.target.value); resetForm(); }}
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Choose a course...</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourse && (
        <>
          <div className="bg-card border border-border rounded-2xl p-5 mb-4 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">{editing ? "Edit Lesson" : "Add Lesson"}</h3>
            <Input placeholder="Lesson title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Video URL (embed)" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
            <Textarea placeholder="Notes / Prompts" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <Input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-32" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="h-4 w-4 mr-1" />{editing ? "Update" : "Add"}</Button>
              {editing && <Button size="sm" variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-1" />Cancel</Button>}
            </div>
          </div>

          <div className="space-y-2">
            {lessons.length === 0 && <p className="text-muted-foreground text-sm">No lessons yet for this course.</p>}
            {lessons.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <span className="text-sm text-foreground">{i + 1}. {l.title}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(l)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLessons;
