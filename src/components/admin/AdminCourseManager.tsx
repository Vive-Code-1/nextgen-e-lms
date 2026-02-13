import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Save, X, BookOpen, GripVertical } from "lucide-react";

const AdminCourseManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  // Course form
  const [form, setForm] = useState({
    title: "", slug: "", description: "", image_url: "",
    instructor_name: "", category: "", price: "", original_price: "", duration: "",
  });

  // Lessons for curriculum tab
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonForm, setLessonForm] = useState({ title: "", video_url: "", notes: "", sort_order: 0 });
  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const fetchLessons = async (courseId: string) => {
    const { data } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("sort_order");
    setLessons(data || []);
  };

  const openNewCourse = () => {
    setEditingCourse(null);
    setForm({ title: "", slug: "", description: "", image_url: "", instructor_name: "", category: "", price: "", original_price: "", duration: "" });
    setLessons([]);
    setDialogOpen(true);
  };

  const openEditCourse = (c: any) => {
    setEditingCourse(c);
    setForm({
      title: c.title || "", slug: c.slug || "", description: c.description || "",
      image_url: c.image_url || "", instructor_name: c.instructor_name || "",
      category: c.category || "", price: c.price?.toString() || "",
      original_price: c.original_price?.toString() || "", duration: c.duration || "",
    });
    fetchLessons(c.id);
    setDialogOpen(true);
  };

  const saveCourse = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    const payload = {
      title: form.title, slug: form.slug, description: form.description || null,
      image_url: form.image_url || null, instructor_name: form.instructor_name || null,
      category: form.category || null, price: form.price ? Number(form.price) : 0,
      original_price: form.original_price ? Number(form.original_price) : 0,
      duration: form.duration || null,
    };

    if (editingCourse) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editingCourse.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Course updated!" });
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Course created!" });
    }
    fetchCourses();
    setDialogOpen(false);
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course and all its lessons?")) return;
    await supabase.from("courses").delete().eq("id", id);
    toast({ title: "Course deleted" });
    fetchCourses();
  };

  // Lesson CRUD
  const saveLesson = async () => {
    if (!lessonForm.title.trim() || !editingCourse) return;
    if (editingLesson) {
      await supabase.from("lessons").update({
        title: lessonForm.title, video_url: lessonForm.video_url || null,
        notes: lessonForm.notes || null, sort_order: lessonForm.sort_order,
      }).eq("id", editingLesson);
      toast({ title: "Lesson updated!" });
    } else {
      await supabase.from("lessons").insert({
        course_id: editingCourse.id, title: lessonForm.title,
        video_url: lessonForm.video_url || null, notes: lessonForm.notes || null,
        sort_order: lessonForm.sort_order,
      });
      toast({ title: "Lesson added!" });
    }
    setLessonForm({ title: "", video_url: "", notes: "", sort_order: 0 });
    setEditingLesson(null);
    fetchLessons(editingCourse.id);
  };

  const deleteLesson = async (id: string) => {
    if (!editingCourse) return;
    await supabase.from("lessons").delete().eq("id", id);
    toast({ title: "Lesson deleted" });
    fetchLessons(editingCourse.id);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Course Manager</h2>
        <Button onClick={openNewCourse}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
      </div>

      {/* Course list table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Course</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Instructor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                <th className="py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {c.image_url && <img src={c.image_url} alt="" className="h-10 w-14 rounded-lg object-cover" />}
                      <span className="text-foreground font-medium">{c.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{c.instructor_name || "-"}</td>
                  <td className="py-3 px-4 text-foreground font-bold">৳{Number(c.price || 0).toFixed(0)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.category || "-"}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" onClick={() => openEditCourse(c)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteCourse(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Builder Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "New Course"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              {editingCourse && <TabsTrigger value="curriculum" className="flex-1">Curriculum</TabsTrigger>}
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Slug *</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. web-development-101" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Image URL</label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Instructor Name</label>
                <Input value={form.instructor_name} onChange={(e) => setForm({ ...form, instructor_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Category</label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </TabsContent>

            {editingCourse && (
              <TabsContent value="curriculum" className="space-y-4 mt-4">
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">{editingLesson ? "Edit Lesson" : "Add Lesson"}</h4>
                  <Input placeholder="Lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
                  <Input placeholder="Video URL (embed)" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
                  <Textarea placeholder="Notes / Prompts" value={lessonForm.notes} onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })} />
                  <Input type="number" placeholder="Sort order" value={lessonForm.sort_order} onChange={(e) => setLessonForm({ ...lessonForm, sort_order: Number(e.target.value) })} className="w-32" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveLesson}><Save className="h-4 w-4 mr-1" />{editingLesson ? "Update" : "Add"}</Button>
                    {editingLesson && (
                      <Button size="sm" variant="outline" onClick={() => { setEditingLesson(null); setLessonForm({ title: "", video_url: "", notes: "", sort_order: 0 }); }}>
                        <X className="h-4 w-4 mr-1" />Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {lessons.length === 0 && <p className="text-muted-foreground text-sm">No lessons yet.</p>}
                  {lessons.map((l, i) => (
                    <div key={l.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{i + 1}. {l.title}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => {
                          setEditingLesson(l.id);
                          setLessonForm({ title: l.title, video_url: l.video_url || "", notes: l.notes || "", sort_order: l.sort_order });
                        }}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Price (৳)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Original Price (৳)</label>
                  <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Duration</label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 8 weeks" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCourse}><Save className="h-4 w-4 mr-2" />{editingCourse ? "Update Course" : "Create Course"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseManager;
