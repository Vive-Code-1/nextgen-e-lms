import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
}

const AdminAnalyticsChart = () => {
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, created_at, payment_status")
        .eq("payment_status", "completed");

      if (!orders) return;

      const monthMap = new Map<string, number>();
      const now = new Date();

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthMap.set(key, 0);
      }

      orders.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + Number(o.amount));
        }
      });

      setData(Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue })));
    };
    fetch();
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Monthly Earnings</h3>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm">No revenue data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250, 30%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(244, 20%, 46%)" />
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
