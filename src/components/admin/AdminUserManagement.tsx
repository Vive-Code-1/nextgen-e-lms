import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, GraduationCap } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
  enrollment_count?: number;
}

const AdminUserManagement = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [instructors, setInstructors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get all user_roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      const studentIds = (roles || []).filter((r: any) => r.role === "student").map((r: any) => r.user_id);
      const instructorIds = (roles || []).filter((r: any) => r.role === "instructor").map((r: any) => r.user_id);

      // Get profiles
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, created_at");

      // Get enrollment counts
      const { data: enrollments } = await supabase.from("enrollments").select("user_id");
      const enrollMap = new Map<string, number>();
      (enrollments || []).forEach((e: any) => {
        enrollMap.set(e.user_id, (enrollMap.get(e.user_id) || 0) + 1);
      });

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      setStudents(
        studentIds.map((id: string) => {
          const p = profileMap.get(id);
          return {
            id, full_name: p?.full_name || null, email: p?.email || null,
            created_at: p?.created_at || null, enrollment_count: enrollMap.get(id) || 0,
          };
        })
      );

      setInstructors(
        instructorIds.map((id: string) => {
          const p = profileMap.get(id);
          return { id, full_name: p?.full_name || null, email: p?.email || null, created_at: p?.created_at || null };
        })
      );

      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">User Management</h2>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Instructors ({instructors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Enrolled</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground font-medium">{s.full_name || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.email || "—"}</td>
                      <td className="py-3 px-4 text-foreground">{s.enrollment_count} courses</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No students yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructors" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((i) => (
                    <tr key={i.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground font-medium">{i.full_name || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{i.email || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{i.created_at ? new Date(i.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {instructors.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No instructors yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserManagement;
