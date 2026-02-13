import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ExternalLink, Edit, Trash2, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseOption {
  id: string;
  title: string;
  reviewId?: string;
  existingReview?: { rating: number; comment: string; approved: boolean };
}

const Reviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses(id, title)")
      .eq("user_id", user.id);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id);

    const reviewMap = new Map((reviews || []).map((r: any) => [r.course_id, r]));

    setCourses(
      (enrollments || []).map((e: any) => ({
        id: e.courses?.id,
        title: e.courses?.title || "",
        reviewId: reviewMap.get(e.course_id)?.id,
        existingReview: reviewMap.get(e.course_id)
          ? { rating: reviewMap.get(e.course_id).rating, comment: reviewMap.get(e.course_id).comment, approved: reviewMap.get(e.course_id).approved }
          : undefined,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !selectedCourse) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, course_id: selectedCourse, rating, comment,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Your review is pending admin approval." });
      setSelectedCourse(""); setComment(""); setRating(5);
      fetchData();
    }
    setSubmitting(false);
  };

  const handleEdit = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.reviewId) return;
    const { error } = await supabase.from("reviews").update({ rating: editRating, comment: editComment }).eq("id", course.reviewId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review updated!" });
      setEditingId(null);
      fetchData();
    }
  };

  const handleDelete = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course?.reviewId || !confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", course.reviewId);
    toast({ title: "Review deleted" });
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Reviews</h2>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-2">Review us on Facebook</h3>
        <p className="text-sm text-muted-foreground mb-3">Leave a review on our Facebook page too!</p>
        <Button variant="outline" size="sm" asChild>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" /> Go to Facebook Page
          </a>
        </Button>
      </div>

      {/* Existing reviews */}
      <div className="space-y-4 mb-6">
        {courses.filter((c) => c.existingReview).map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
            {editingId === c.id ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setEditRating(s)}>
                      <Star className={`h-5 w-5 ${s <= editRating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(c.id)}><Save className="h-4 w-4 mr-1" />Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-4 w-4 mr-1" />Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.existingReview?.approved ? "bg-emerald-500/10 text-emerald-500" : "bg-accent/10 text-accent"}`}>
                      {c.existingReview?.approved ? "Approved" : "Pending"}
                    </span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                      setEditingId(c.id);
                      setEditRating(c.existingReview!.rating);
                      setEditComment(c.existingReview!.comment || "");
                    }}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= (c.existingReview?.rating || 0) ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{c.existingReview?.comment}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Submit new review */}
      {courses.filter((c) => !c.existingReview).length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Select Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Choose a course...</option>
                {courses.filter((c) => !c.existingReview).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star className={`h-6 w-6 ${s <= rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Comment</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." />
            </div>
            <Button onClick={handleSubmit} disabled={!selectedCourse || submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
