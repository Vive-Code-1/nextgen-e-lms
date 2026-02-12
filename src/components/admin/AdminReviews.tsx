import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle, XCircle } from "lucide-react";

const AdminReviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*, courses(title), profiles:user_id(full_name, email)")
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, approved: boolean) => {
    await supabase.from("reviews").update({ approved }).eq("id", id);
    toast({ title: approved ? "Review approved" : "Review rejected" });
    fetch();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Reviews Management</h2>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground text-sm">{(r as any).profiles?.full_name || (r as any).profiles?.email || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{(r as any).courses?.title}</p>
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
    </div>
  );
};

export default AdminReviews;
