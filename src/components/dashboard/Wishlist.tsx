import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface WishlistItem {
  id: string;
  course_id: string;
  title: string;
  image_url: string | null;
  slug: string;
  price: number | null;
  instructor_name: string | null;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("wishlist")
        .select("id, course_id, courses(title, image_url, slug, price, instructor_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setItems(
        (data || []).map((w: any) => ({
          id: w.id,
          course_id: w.course_id,
          title: w.courses?.title || "Untitled",
          image_url: w.courses?.image_url,
          slug: w.courses?.slug || "",
          price: w.courses?.price,
          instructor_name: w.courses?.instructor_name,
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleRemove = async (id: string) => {
    await supabase.from("wishlist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Removed from wishlist" });
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">My Wishlist</h2>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm">Browse courses and save your favorites!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                {item.instructor_name && (
                  <p className="text-xs text-muted-foreground mb-2">By {item.instructor_name}</p>
                )}
                {item.price !== null && (
                  <p className="text-lg font-bold text-primary mb-3">৳{item.price}</p>
                )}
                <div className="mt-auto flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                    <Link to={`/courses/${item.slug}`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> View Course
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
