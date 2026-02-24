import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, Mail, UserPlus, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
  status: string;
}

const MASTER_ADMIN_ID = "b426c88b-14a2-46ed-93f3-08cb00282b83";

interface ManageAdminsProps {
  onBack: () => void;
  currentUserId?: string;
}

const ManageAdmins = ({ onBack, currentUserId }: ManageAdminsProps) => {
  const isMasterAdmin = currentUserId === MASTER_ADMIN_ID;
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("admin_users").select("id, email, created_at, status").order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAdmins((data as AdminUser[]) ?? []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
        return;
      }

      const res = await supabase.functions.invoke("invite-admin", {
        body: { email: newEmail.trim() },
      });

      if (res.error) {
        toast({ title: "Invite failed", description: res.error.message, variant: "destructive" });
        return;
      }

      const result = res.data as { success: boolean; error?: string };
      if (!result.success) {
        toast({ title: "Invite failed", description: result.error ?? "Unknown error", variant: "destructive" });
        return;
      }

      toast({ title: "Invite sent", description: `Invitation email sent to ${newEmail.trim()}.` });
      setNewEmail("");
      fetchAdmins();
    } catch {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRemove = async (admin: AdminUser) => {
    if (!confirm(`Remove admin access for ${admin.email ?? admin.id}?`)) return;
    setActionLoading(admin.id);
    const { error } = await supabase.from("admin_users").delete().eq("id", admin.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Removed", description: `${admin.email ?? "User"} no longer has admin access.` });
      fetchAdmins();
    }
    setActionLoading(null);
  };

  const handleResetPassword = async (admin: AdminUser) => {
    if (!admin.email) {
      toast({ title: "Error", description: "No email on record for this user.", variant: "destructive" });
      return;
    }
    setActionLoading(admin.id);
    const { error } = await supabase.auth.resetPasswordForEmail(admin.email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset link sent", description: `Reset link sent to ${admin.email}.` });
    }
    setActionLoading(null);
  };

  const statusBadge = (status: string) => {
    if (status === "invited") return <Badge variant="secondary">Invited</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-display">Manage System Admins</h1>
            <p className="text-sm text-muted-foreground">Invite, remove, or reset passwords for admin users</p>
          </div>
        </div>

        {/* Invite New Admin */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Invite New Admin
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="admin@example.com" required />
            </div>
            <Button type="submit" disabled={creating} className="gap-1.5">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {creating ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </div>

        {/* Admin List */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display">Current Admins</h2>
            <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={loading} className="gap-1.5">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No admin users found.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.email ?? "—"}</TableCell>
                      <TableCell>{statusBadge(admin.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">{admin.id}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {isMasterAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(admin)}
                            disabled={actionLoading === admin.id}
                            className="gap-1"
                          >
                            <Mail className="w-3.5 h-3.5" /> Send Password Reset
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemove(admin)}
                          disabled={actionLoading === admin.id}
                          className="gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;
