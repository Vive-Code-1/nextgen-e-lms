import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContactLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLeads = async () => {
    const { data } = await supabase.from("contact_leads" as any).select("*").order("created_at", { ascending: false });
    setLeads((data as any as Lead[]) || []);
  };

  useEffect(() => { fetchLeads(); }, []);

  const toggleRead = async (lead: Lead) => {
    await supabase.from("contact_leads" as any).update({ is_read: !lead.is_read } as any).eq("id", lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, is_read: !l.is_read } : l));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Contact Form Leads</h2>
      {leads.length === 0 ? (
        <p className="text-muted-foreground text-sm">No contact submissions yet.</p>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className={!lead.is_read ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || "—"}</TableCell>
                  <TableCell>{lead.subject || "—"}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)} className="text-left text-sm hover:text-primary transition-colors">
                      {expanded === lead.id ? lead.message : lead.message.slice(0, 50) + (lead.message.length > 50 ? "..." : "")}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => toggleRead(lead)} className="gap-1">
                      {lead.is_read ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <Badge variant={lead.is_read ? "secondary" : "default"} className="text-xs">
                        {lead.is_read ? "Read" : "New"}
                      </Badge>
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

export default AdminContactLeads;
