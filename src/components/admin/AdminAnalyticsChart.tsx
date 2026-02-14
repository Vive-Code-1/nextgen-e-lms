import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ViewType = "monthly" | "weekly" | "daily";

interface Order {
  amount: number;
  created_at: string;
}

const AdminAnalyticsChart = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState<ViewType>("monthly");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("amount, created_at, payment_status")
        .eq("payment_status", "completed");
      if (data) setOrders(data as Order[]);
    };
    fetchOrders();
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();

    if (activeView === "monthly") {
      const monthMap = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthMap.set(key, 0);
      }
      orders.forEach((o) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + Number(o.amount));
      });
      return Array.from(monthMap.entries()).map(([label, revenue]) => ({ label, revenue }));
    }

    if (activeView === "weekly") {
      const weeks: { start: Date; end: Date; label: string }[] = [];
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - i * 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const label = `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()}-${end.getDate()}`;
        weeks.push({ start, end, label });
      }
      return weeks.map(({ start, end, label }) => {
        const revenue = orders
          .filter((o) => {
            const d = new Date(o.created_at);
            return d >= start && d <= end;
          })
          .reduce((sum, o) => sum + Number(o.amount), 0);
        return { label, revenue };
      });
    }

    // daily
    const days: { date: Date; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ date: d, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    }
    return days.map(({ date, label }) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      const revenue = orders
        .filter((o) => {
          const d = new Date(o.created_at);
          return d >= date && d < nextDay;
        })
        .reduce((sum, o) => sum + Number(o.amount), 0);
      return { label, revenue };
    });
  }, [orders, activeView]);

  const tabs: { key: ViewType; text: string }[] = [
    { key: "monthly", text: "Monthly" },
    { key: "weekly", text: "Weekly" },
    { key: "daily", text: "Daily" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Earnings Overview</h3>
        <div className="flex gap-1 bg-muted rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveView(t.key)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeView === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.text}
            </button>
          ))}
        </div>
      </div>
      {chartData.length === 0 ? (
        <p className="text-muted-foreground text-sm">No revenue data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 30%, 90%)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(244, 20%, 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(244, 20%, 46%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(250, 30%, 90%)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
              formatter={(value: number) => [`৳${value.toFixed(2)}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="hsl(263, 84%, 58%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AdminAnalyticsChart;
