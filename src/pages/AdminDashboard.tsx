import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, LayoutDashboard, BookOpen, Users, ShoppingCart,
  Settings, LogOut, DollarSign, TrendingUp
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ courses: 0, students: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      // Fetch stats
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
          setRecentOrders(data.slice(0, 10));
        }
      });
    }
  }, [user, isAdmin]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Loading...</span></div>;
  if (!user || !isAdmin) return null;

  const sidebarLinks = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
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

        {/* Stats */}
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

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-medium">Order ID</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Method</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
