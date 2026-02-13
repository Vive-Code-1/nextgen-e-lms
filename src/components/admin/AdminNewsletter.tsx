import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    const { data } = await supabase.from("newsletter_subscribers" as any).select("*").order("created_at", { ascending: false });
    setSubscribers((data as any as Subscriber[]) || []);
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: "Subscriber removed" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Newsletter Subscribers ({subscribers.length})</h2>
      {subscribers.length === 0 ? (
        <p className="text-muted-foreground text-sm">No subscribers yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed Date</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(sub.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
