import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import CourseWizard from "./CourseWizard";

const AdminCourseManager = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const openNewCourse = () => { setEditingCourse(null); setDialogOpen(true); };
  const openEditCourse = (c: any) => { setEditingCourse(c); setDialogOpen(true); };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course and all its lessons?")) return;
    await supabase.from("courses").delete().eq("id", id);
    toast({ title: "Course deleted" });
    fetchCourses();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Course Manager</h2>
        <Button onClick={openNewCourse}><Plus className="h-4 w-4 mr-2" />Add Course</Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Course</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Level</th>
                <th className="py-3 px-4 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {c.image_url && <img src={c.image_url} alt="" className="h-10 w-14 rounded-lg object-cover" />}
                      <div>
                        <span className="text-foreground font-medium block">{c.title}</span>
                        {c.is_free && <span className="text-xs text-primary">Free</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{c.category || "-"}</td>
                  <td className="py-3 px-4 text-foreground font-bold">{c.is_free ? "Free" : `৳${Number(c.price || 0).toFixed(0)}`}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.level || "-"}</td>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "New Course"}</DialogTitle>
          </DialogHeader>
          <CourseWizard course={editingCourse} onClose={() => setDialogOpen(false)} onSaved={fetchCourses} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourseManager;
