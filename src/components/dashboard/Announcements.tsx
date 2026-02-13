import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const daysAgo = (date: string) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAnnouncements(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  const latest = announcements[0];
  const rest = announcements.slice(1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">Stay updated with the latest news</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned / Latest */}
          {latest && (
            <div className="bg-card border-l-4 border-l-primary border border-border rounded-2xl p-6 relative">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary text-primary-foreground text-[10px]">New</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {daysAgo(latest.created_at)}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">{latest.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{latest.content}</p>
              {latest.content.length > 150 && (
                <button
                  onClick={() => setSelectedAnnouncement(latest)}
                  className="text-primary text-sm font-medium mt-2 flex items-center gap-1 hover:underline"
                >
                  Read More <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((a, i) => (
                <div
                  key={a.id}
                  className="bg-card border-l-4 border-l-accent border border-border rounded-xl p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-bold text-destructive">
                      #{i + 2}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">{a.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{a.content}</p>
                  {a.content.length > 100 && (
                    <button
                      onClick={() => setSelectedAnnouncement(a)}
                      className="text-primary text-xs font-medium mt-2 flex items-center gap-1 hover:underline"
                    >
                      Read More <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Read More Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-2">
            {selectedAnnouncement && new Date(selectedAnnouncement.created_at).toLocaleDateString()}
          </p>
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {selectedAnnouncement?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
