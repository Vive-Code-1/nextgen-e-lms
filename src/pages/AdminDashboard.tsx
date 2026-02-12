import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  GraduationCap, LayoutDashboard, BookOpen, Users, ShoppingCart,
  Settings, LogOut, DollarSign, TrendingUp, Save, CheckCircle,
  Bell, ClipboardList, Star, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminLessons from "@/components/admin/AdminLessons";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminAssignments from "@/components/admin/AdminAssignments";

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ courses: 0, students: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Payment settings state
  const [paymentMethods, setPaymentMethods] = useState({
    uddoktapay: true, stripe: true, paypal: true, cod: true, bd_manual: true,
  });
  const [uddoktapayBaseUrl, setUddoktapayBaseUrl] = useState("https://digitaltechdude.paymently.io/api");
  const [uddoktapayApiKey, setUddoktapayApiKey] = useState("••••••••••••••••");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = () => {
    supabase.from("courses").select("id", { count: "exact" }).then(({ count }) =>
      setStats((s) => ({ ...s, courses: count || 0 }))
    );
    supabase.from("profiles").select("id", { count: "exact" }).then(({ count }) =>
      setStats((s) => ({ ...s, students: count || 0 }))
    );
    supabase.from("orders").select("*").then(({ data }) => {
      if (data) {
        setStats((s) => ({
          ...s,
          orders: data.length,
          revenue: data.filter((o: any) => o.payment_status === "completed").reduce((sum: number, o: any) => sum + Number(o.amount), 0),
        }));
        setRecentOrders(data.slice(0, 20));
      }
    });

    supabase.from("site_settings").select("*").then(({ data }) => {
      if (data) {
        const methods = data.find((s: any) => s.key === "payment_methods");
        const baseUrl = data.find((s: any) => s.key === "uddoktapay_base_url");
        if (methods?.value) setPaymentMethods(methods.value as any);
        if (baseUrl?.value) setUddoktapayBaseUrl(baseUrl.value as string);
      }
    });
  };

  const savePaymentSettings = async () => {
    setSavingSettings(true);
    try {
      await supabase.from("site_settings").upsert(
        { key: "payment_methods", value: paymentMethods as any, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      await supabase.from("site_settings").upsert(
        { key: "uddoktapay_base_url", value: uddoktapayBaseUrl as any, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      toast({ title: "Settings saved!", description: "Payment settings updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const approveOrder = async (order: any) => {
    try {
      // Update order status to completed
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ payment_status: "completed" } as any)
        .eq("id", order.id);

      if (updateErr) throw updateErr;

      // Create enrollment if course_id exists
      if (order.course_id) {
        await supabase.from("enrollments").upsert(
          { user_id: order.user_id, course_id: order.course_id } as any,
          { onConflict: "user_id,course_id" }
        );
      }

      toast({ title: "অর্ডার অ্যাপ্রুভ হয়েছে!", description: "স্টুডেন্ট কোর্সে এক্সেস পেয়ে গেছে।" });
      fetchData(); // Refresh orders
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;
  if (!user || !isAdmin) return null;

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: FileText, label: "Lessons", id: "lessons" },
    { icon: Bell, label: "Announcements", id: "announcements" },
    { icon: ClipboardList, label: "Assignments", id: "assignments" },
    { icon: Star, label: "Reviews", id: "reviews" },
    { icon: BookOpen, label: "Courses", id: "courses" },
    { icon: Users, label: "Users", id: "users" },
    { icon: ShoppingCart, label: "Orders", id: "orders" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  const statCards = [
    { label: "Total Courses", value: stats.courses, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Total Students", value: stats.students, icon: Users, color: "bg-accent/10 text-accent" },
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "bg-emerald-500/10 text-emerald-500" },
    { label: "Total Orders", value: stats.orders, icon: TrendingUp, color: "bg-violet-500/10 text-violet-500" },
  ];

  const paymentMethodsList = [
    { key: "uddoktapay", label: "UddoktaPay", desc: "bKash, Nagad, Rocket & more" },
    { key: "stripe", label: "Stripe", desc: "Credit/Debit Card" },
    { key: "paypal", label: "PayPal", desc: "Pay with PayPal" },
    { key: "cod", label: "Cash on Delivery", desc: "Pay on delivery" },
    { key: "bd_manual", label: "BD Manual Payment", desc: "Manual bKash/Nagad/Rocket" },
  ];

  const renderOrdersTable = (orders: any[], showApprove = false) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 text-muted-foreground font-medium">Order ID</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Amount</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Method</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
            {showApprove && <th className="text-left py-3 text-muted-foreground font-medium">Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <td className="py-3 text-foreground font-mono text-xs">{order.id.slice(0, 8)}...</td>
              <td className="py-3 text-foreground">${Number(order.amount).toFixed(2)}</td>
              <td className="py-3 text-foreground capitalize">{order.payment_method || "-"}</td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === "completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-accent/10 text-accent"}`}>
                  {order.payment_status}
                </span>
              </td>
              <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
              {showApprove && (
                <td className="py-3">
                  {order.payment_status === "pending" ? (
                    <Button size="sm" variant="outline" onClick={() => approveOrder(order)} className="flex items-center gap-1 text-emerald-600 border-emerald-600 hover:bg-emerald-500/10">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-foreground font-bold text-lg">
            <GraduationCap className="h-7 w-7 text-accent" />
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your LMS platform.</p>
        </div>

        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet.</p>
              ) : renderOrdersTable(recentOrders, true)}
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">All Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet.</p>
            ) : renderOrdersTable(recentOrders, true)}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Payment Settings</h2>

              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment Methods</h3>
                {paymentMethodsList.map((method) => (
                  <div key={method.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                    <Switch
                      checked={(paymentMethods as any)[method.key] ?? false}
                      onCheckedChange={(checked) =>
                        setPaymentMethods((prev) => ({ ...prev, [method.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">UddoktaPay Configuration</h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">API Key</label>
                  <Input value={uddoktapayApiKey} disabled className="bg-muted font-mono text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">API key is managed via Supabase Edge Function secrets.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Base URL</label>
                  <Input value={uddoktapayBaseUrl} onChange={(e) => setUddoktapayBaseUrl(e.target.value)} className="font-mono text-sm" />
                </div>
              </div>

              <Button onClick={savePaymentSettings} disabled={savingSettings} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "lessons" && <AdminLessons />}
        {activeTab === "announcements" && <AdminAnnouncements />}
        {activeTab === "reviews" && <AdminReviews />}
        {activeTab === "assignments" && <AdminAssignments />}
      </main>
    </div>
  );
};

export default AdminDashboard;
