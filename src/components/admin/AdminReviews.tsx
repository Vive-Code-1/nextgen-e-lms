import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle, XCircle, Plus, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminReviews = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New review form
  const [studentName, setStudentName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, courses(title)")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profile info separately for each review
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const enriched = data.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      }));
      setReviews(enriched);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, title").order("title");
    setCourses(data || []);
  };

  useEffect(() => { fetchReviews(); fetchCourses(); }, []);

  const updateStatus = async (id: string, approved: boolean) => {
    await supabase.from("reviews").update({ approved }).eq("id", id);
    toast({ title: approved ? "Review approved" : "Review rejected" });
    fetchReviews();
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `review-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  };

  const submitReview = async () => {
    if (!selectedCourse || !comment.trim() || !user) return;
    setSaving(true);

    // Update profile name/avatar if provided
    if (studentName || imageUrl) {
      const updateData: any = {};
      if (studentName) updateData.full_name = studentName;
      if (imageUrl) updateData.avatar_url = imageUrl;
      await supabase.from("profiles").update(updateData).eq("id", user.id);
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      course_id: selectedCourse,
      rating,
      comment,
      approved: true,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review added!" });
      setDialogOpen(false);
      setStudentName(""); setSelectedCourse(""); setRating(5); setComment(""); setImageUrl("");
      fetchReviews();
    }
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Reviews Management</h2>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add New Review</Button>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {r.profile?.avatar_url ? (
                    <img src={r.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {(r.profile?.full_name || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{r.profile?.full_name || r.profile?.email || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{r.courses?.title || "Unknown course"}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.approved ? "bg-emerald-500/10 text-emerald-500" : "bg-accent/10 text-accent"}`}>
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{r.comment}</p>
              <div className="flex gap-2">
                {!r.approved && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, true)} className="text-emerald-600">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                  </Button>
                )}
                {r.approved && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, false)} className="text-destructive">
                    <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student Name</Label>
              <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter student name" />
            </div>
            <div>
              <Label>Student Image</Label>
              <div className="mt-1 flex items-center gap-3">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                    <button onClick={() => setImageUrl("")} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" />Upload</span></Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  </label>
                )}
                {uploading && <span className="text-xs text-primary">Uploading...</span>}
              </div>
            </div>
            <div>
              <Label>Course *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                    <Star className={`h-6 w-6 transition-colors ${s <= rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Review Comment *</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Write the review..." />
            </div>
            <Button onClick={submitReview} disabled={saving || !selectedCourse || !comment.trim()} className="w-full">
              {saving ? "Saving..." : "Add Review"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
