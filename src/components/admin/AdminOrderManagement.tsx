import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, CheckCircle, Trash2, RotateCcw, AlertTriangle, Search, Phone,
} from "lucide-react";

type Order = {
  id: string;
  amount: number;
  currency: string | null;
  payment_method: string | null;
  payment_status: string | null;
  sender_phone: string | null;
  trx_id: string | null;
  transaction_id: string | null;
  created_at: string | null;
  deleted_at: string | null;
  user_id: string;
  course_id: string | null;
  customer_name?: string;
  customer_email?: string;
  course_title?: string;
};

type CheckoutAttempt = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  course_slug: string | null;
  course_title: string | null;
  ip_address: string | null;
  created_at: string;
  is_converted: boolean;
};

const MANUAL_METHODS = ["bkash_manual", "nagad_manual", "rocket_manual", "cod"];

const ALL_PAYMENT_METHODS = [
  { value: "uddoktapay", label: "UddoktaPay" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "bkash_manual", label: "bKash (Manual)" },
  { value: "nagad_manual", label: "Nagad (Manual)" },
  { value: "rocket_manual", label: "Rocket (Manual)" },
  { value: "cod", label: "Cash on Delivery" },
];

const AdminOrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Incomplete orders
  const [incompleteOrders, setIncompleteOrders] = useState<CheckoutAttempt[]>([]);
  const [incompleteLoading, setIncompleteLoading] = useState(false);

  // Manual order dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string | null; email: string | null }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string; price: number | null }[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [newOrder, setNewOrder] = useState({
    user_id: "", course_id: "", amount: "", payment_method: "cod",
    payment_status: "pending", sender_phone: "", trx_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (activeTab === "incomplete") fetchIncompleteOrders();
  }, [activeTab]);

  const fetchIncompleteOrders = async () => {
    setIncompleteLoading(true);
    const { data, error } = await supabase
      .from("checkout_attempts" as any)
      .select("*")
      .eq("is_converted", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading incomplete orders", description: error.message, variant: "destructive" });
    } else {
      setIncompleteOrders((data || []) as unknown as CheckoutAttempt[]);
    }
    setIncompleteLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading orders", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const userIds = [...new Set((data || []).map((o: any) => o.user_id))];
    const courseIds = [...new Set((data || []).filter((o: any) => o.course_id).map((o: any) => o.course_id))];

    const [profilesRes, coursesRes] = await Promise.all([
      userIds.length ? supabase.from("profiles").select("id, full_name, email").in("id", userIds) : { data: [] },
      courseIds.length ? supabase.from("courses").select("id, title").in("id", courseIds) : { data: [] },
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
    const courseMap = new Map((coursesRes.data || []).map((c: any) => [c.id, c]));

    const enriched: Order[] = (data || []).map((o: any) => {
      const profile = profileMap.get(o.user_id);
      const course = courseMap.get(o.course_id);
      return {
        ...o,
        customer_name: profile?.full_name || "Unknown",
        customer_email: profile?.email || "",
        course_title: course?.title || "—",
      };
    });

    setOrders(enriched);
    setSelected(new Set());
    setLoading(false);
  };

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "pending": return orders.filter(o => !o.deleted_at && o.payment_status === "pending");
      case "completed": return orders.filter(o => !o.deleted_at && o.payment_status === "completed");
      case "trash": return orders.filter(o => !!o.deleted_at);
      default: return orders.filter(o => !o.deleted_at);
    }
  }, [orders, activeTab]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const approveOrder = async (order: Order) => {
    const { error } = await supabase.from("orders").update({ payment_status: "completed" } as any).eq("id", order.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (order.course_id) {
      await supabase.from("enrollments").upsert(
        { user_id: order.user_id, course_id: order.course_id } as any,
        { onConflict: "user_id,course_id" }
      );
    }
    toast({ title: "Order approved!" });
    fetchOrders();
  };

  const bulkApprove = async () => {
    const pending = filteredOrders.filter(o => selected.has(o.id) && o.payment_status === "pending" && MANUAL_METHODS.includes(o.payment_method || ""));
    if (!pending.length) { toast({ title: "No pending manual orders selected" }); return; }
    for (const o of pending) { await approveOrder(o); }
  };

  const bulkTrash = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const { error } = await supabase.from("orders").update({ deleted_at: new Date().toISOString() } as any).in("id", ids);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${ids.length} order(s) moved to trash` });
    fetchOrders();
  };

  const bulkRestore = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const { error } = await supabase.from("orders").update({ deleted_at: null } as any).in("id", ids);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${ids.length} order(s) restored` });
    fetchOrders();
  };

  const bulkDelete = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const { error } = await supabase.from("orders").delete().in("id", ids);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `${ids.length} order(s) permanently deleted` });
    fetchOrders();
  };

  const trashOrder = async (id: string) => {
    await supabase.from("orders").update({ deleted_at: new Date().toISOString() } as any).eq("id", id);
    toast({ title: "Moved to trash" });
    fetchOrders();
  };

  const restoreOrder = async (id: string) => {
    await supabase.from("orders").update({ deleted_at: null } as any).eq("id", id);
    toast({ title: "Order restored" });
    fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
    toast({ title: "Order permanently deleted" });
    fetchOrders();
  };

  const openDialog = async () => {
    setDialogOpen(true);
    const [p, c] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("courses").select("id, title, price"),
    ]);
    setProfiles(p.data || []);
    setCourses((c.data || []) as any);
  };

  const filteredProfiles = useMemo(() => {
    if (!userSearch) return profiles;
    const q = userSearch.toLowerCase();
    return profiles.filter(p => (p.full_name || "").toLowerCase().includes(q) || (p.email || "").toLowerCase().includes(q));
  }, [profiles, userSearch]);

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setNewOrder(prev => ({
      ...prev,
      course_id: courseId,
      amount: course?.price?.toString() || prev.amount,
    }));
  };

  const submitOrder = async () => {
    if (!newOrder.user_id || !newOrder.course_id || !newOrder.amount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: newOrder.user_id,
        course_id: newOrder.course_id,
        amount: parseFloat(newOrder.amount),
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status,
        sender_phone: newOrder.sender_phone || null,
        trx_id: newOrder.trx_id || null,
      } as any);
      if (error) throw error;

      if (newOrder.payment_status === "completed") {
        await supabase.from("enrollments").upsert(
          { user_id: newOrder.user_id, course_id: newOrder.course_id } as any,
          { onConflict: "user_id,course_id" }
        );
      }

      toast({ title: "Order created!" });
      setDialogOpen(false);
      setNewOrder({ user_id: "", course_id: "", amount: "", payment_method: "cod", payment_status: "pending", sender_phone: "", trx_id: "" });
      setUserSearch("");
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.payment_status === "completed") {
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>;
    }
    if (MANUAL_METHODS.includes(order.payment_method || "")) {
      return <Badge className="bg-accent/10 text-accent border-accent/20">Pending</Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processing</Badge>;
  };

  const getMethodBadge = (method: string | null) => {
    const label = ALL_PAYMENT_METHODS.find(m => m.value === method)?.label || method || "—";
    return <Badge variant="outline" className="capitalize">{label}</Badge>;
  };

  const deleteIncompleteAttempt = async (id: string) => {
    await supabase.from("checkout_attempts" as any).delete().eq("id", id);
    toast({ title: "Attempt deleted" });
    fetchIncompleteOrders();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Order Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Customer *</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={newOrder.user_id} onValueChange={v => setNewOrder(p => ({ ...p, user_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {filteredProfiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name || "No Name"} ({p.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Course *</label>
                <Select value={newOrder.course_id} onValueChange={handleCourseSelect}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title} — ৳{c.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Amount *</label>
                  <Input type="number" value={newOrder.amount} onChange={e => setNewOrder(p => ({ ...p, amount: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Payment Method</label>
                  <Select value={newOrder.payment_method} onValueChange={v => setNewOrder(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_PAYMENT_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={newOrder.payment_status} onValueChange={v => setNewOrder(p => ({ ...p, payment_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sender Phone</label>
                  <Input value={newOrder.sender_phone} onChange={e => setNewOrder(p => ({ ...p, sender_phone: e.target.value }))} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Trx ID</label>
                  <Input value={newOrder.trx_id} onChange={e => setNewOrder(p => ({ ...p, trx_id: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitOrder} disabled={submitting}>{submitting ? "Creating..." : "Create Order"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelected(new Set()); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Incomplete Orders Tab */}
      {activeTab === "incomplete" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {incompleteLoading ? (
            <p className="p-6 text-muted-foreground text-sm">Loading...</p>
          ) : incompleteOrders.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">No incomplete orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Name</th>
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Email</th>
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Phone</th>
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Course</th>
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Date</th>
                    <th className="py-3 px-4 text-left text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incompleteOrders.map(attempt => (
                    <tr key={attempt.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-foreground">{attempt.full_name || "—"}</td>
                      <td className="py-3 px-4 text-foreground">{attempt.email || "—"}</td>
                      <td className="py-3 px-4 text-foreground">
                        {attempt.phone ? (
                          <a href={`tel:${attempt.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Phone className="h-3.5 w-3.5" />
                            {attempt.phone}
                          </a>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs max-w-[150px] truncate">{attempt.course_title || attempt.course_slug || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(attempt.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {attempt.phone && (
                            <a href={`tel:${attempt.phone}`}>
                              <Badge className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20">
                                <Phone className="h-3 w-3 mr-1" /> Call
                              </Badge>
                            </a>
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteIncompleteAttempt(attempt.id)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-border">
              <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
              <div className="flex-1" />
              {activeTab !== "trash" && (
                <>
                  <Button size="sm" variant="outline" onClick={bulkApprove} className="text-emerald-600 border-emerald-600 hover:bg-emerald-500/10">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkTrash} className="text-destructive border-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Trash
                  </Button>
                </>
              )}
              {activeTab === "trash" && (
                <>
                  <Button size="sm" variant="outline" onClick={bulkRestore}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                  </Button>
                  <Button size="sm" variant="destructive" onClick={bulkDelete}>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Delete Permanently
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {loading ? (
              <p className="p-6 text-muted-foreground text-sm">Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="p-6 text-muted-foreground text-sm">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-3 px-4 text-left">
                        <Checkbox checked={selected.size === filteredOrders.length && filteredOrders.length > 0} onCheckedChange={toggleAll} />
                      </th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Order ID</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Customer</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Course</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Amount</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Method</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Status</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Date</th>
                      <th className="py-3 px-4 text-left text-muted-foreground font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <Checkbox checked={selected.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-foreground">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-foreground font-medium text-xs">{order.customer_name}</p>
                            <p className="text-muted-foreground text-xs">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground text-xs max-w-[150px] truncate">{order.course_title}</td>
                        <td className="py-3 px-4 text-foreground">৳{Number(order.amount).toFixed(2)}</td>
                        <td className="py-3 px-4">{getMethodBadge(order.payment_method)}</td>
                        <td className="py-3 px-4">{getStatusBadge(order)}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {activeTab === "trash" ? (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => restoreOrder(order.id)} title="Restore">
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteOrder(order.id)} title="Delete permanently">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                {order.payment_status === "pending" && MANUAL_METHODS.includes(order.payment_method || "") && (
                                  <Button size="sm" variant="outline" onClick={() => approveOrder(order)} className="text-emerald-600 border-emerald-600 hover:bg-emerald-500/10">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => trashOrder(order.id)} title="Move to trash">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrderManagement;
