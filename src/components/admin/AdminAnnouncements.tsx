import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Bell } from "lucide-react";

const AdminAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    const { error } = await supabase.from("announcements").insert({ title, content, created_by: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Announcement posted!" });
    setTitle(""); setContent("");
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Deleted" });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Announcements</h2>
      <div className="bg-card border border-border rounded-2xl p-5 mb-4 space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />Post Announcement</Button>
      </div>
      <div className="space-y-2">
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-foreground text-sm">{a.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
