import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Bell, Pencil, X } from "lucide-react";

const AdminAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !user) return;

    if (editingId) {
      const { error } = await supabase.from("announcements").update({ title, content }).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Announcement updated!" });
    } else {
      const { error } = await supabase.from("announcements").insert({ title, content, created_by: user.id });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Announcement posted!" });
    }

    setTitle(""); setContent(""); setEditingId(null);
    fetchAll();
  };

  const handleEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle(""); setContent("");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) cancelEdit();
    toast({ title: "Deleted" });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Announcements</h2>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4 space-y-3">
        {editingId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary">Editing announcement</span>
            <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="h-4 w-4 mr-1" />Cancel</Button>
          </div>
        )}
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button size="sm" onClick={handleSave}>
          {editingId ? <><Pencil className="h-4 w-4 mr-1" />Update Announcement</> : <><Plus className="h-4 w-4 mr-1" />Post Announcement</>}
        </Button>
      </div>
      <div className="space-y-2">
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-foreground text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}><Pencil className="h-4 w-4 text-primary" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
