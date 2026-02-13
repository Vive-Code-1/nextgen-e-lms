import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Download } from "lucide-react";

interface Order {
  id: string;
  course_title: string;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
}

const PurchaseHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, courses(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(
        (data || []).map((o: any) => ({
          id: o.id,
          course_title: o.courses?.title || "Unknown Course",
          amount: Number(o.amount),
          currency: o.currency || "BDT",
          payment_status: o.payment_status || "pending",
          payment_method: o.payment_method,
          created_at: o.created_at,
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  const downloadInvoice = (order: Order) => {
    const invoice = `
===========================
       INVOICE
===========================
Order ID: ${order.id.slice(0, 8).toUpperCase()}
Date: ${new Date(order.created_at).toLocaleDateString()}

Course: ${order.course_title}
Amount: ৳${order.amount.toFixed(2)}
Method: ${order.payment_method || "N/A"}
Status: ${order.payment_status.toUpperCase()}
===========================
    NextGen LMS
===========================
    `.trim();
    const blob = new Blob([invoice], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Purchase History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No purchases yet</h3>
          <p className="text-muted-foreground text-sm">Your order history will appear here.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Course</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-foreground font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 px-4 text-foreground">{o.course_title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-foreground font-bold">৳{o.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.payment_status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-accent/10 text-accent"
                      }`}>
                        {o.payment_status === "completed" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost" onClick={() => downloadInvoice(o)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
