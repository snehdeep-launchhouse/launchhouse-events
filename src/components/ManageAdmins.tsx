import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Mail, UserPlus, ArrowLeft, RefreshCw, ShieldCheck, Send } from "lucide-react";
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

  const masterAdmin = admins.find((a) => a.id === MASTER_ADMIN_ID);
  const invitedUsers = admins.filter((a) => a.id !== MASTER_ADMIN_ID);

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
    try {
      const res = await supabase.functions.invoke("send-reset-password", {
        body: { email: admin.email },
      });
      if (res.error) {
        toast({ title: "Error", description: res.error.message, variant: "destructive" });
      } else {
        const result = res.data as { success: boolean; error?: string };
        if (!result.success) {
          toast({ title: "Error", description: result.error ?? "Unknown error", variant: "destructive" });
        } else {
          toast({ title: "Reset link sent", description: `Reset link sent to ${admin.email}.` });
        }
      }
    } catch {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleResendInvite = async (admin: AdminUser) => {
    if (!admin.email) return;
    setActionLoading(admin.id);
    try {
      const res = await supabase.functions.invoke("invite-admin", {
        body: { email: admin.email },
      });
      if (res.error) {
        toast({ title: "Resend failed", description: res.error.message, variant: "destructive" });
      } else {
        const result = res.data as { success: boolean; error?: string };
        if (!result.success) {
          toast({ title: "Resend failed", description: result.error ?? "Unknown error", variant: "destructive" });
        } else {
          toast({ title: "Invite resent", description: `Invitation re-sent to ${admin.email}.` });
        }
      }
    } catch {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display">Manage System Admins</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Invite, remove, or reset passwords for admin users</p>
          </div>
        </div>

        {/* Master Admin Card */}
        {masterAdmin && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{masterAdmin.email ?? "—"}</span>
                  <Badge className="bg-primary text-primary-foreground">Master Admin</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Owner · Full system access</p>
              </div>
            </div>
          </div>
        )}

        {/* Invite New User */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Invite New User
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" required />
            </div>
            <Button type="submit" disabled={creating} className="gap-1.5">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {creating ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </div>

        {/* Invited Users List */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-display">Invited Users</h2>
            <Button variant="outline" size="sm" onClick={fetchAdmins} disabled={loading} className="gap-1.5">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : invitedUsers.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No invited users yet.</p>
          ) : (
            <div className="space-y-3">
              {invitedUsers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-3 sm:p-4 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.email ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px] sm:max-w-none">{user.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    {user.status === "invited" ? (
                      <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50">Not Accepted</Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Accepted</Badge>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {user.status === "invited" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(user)}
                          disabled={actionLoading === user.id}
                          className="gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Resend</span> <span className="xs:hidden">↻</span>
                        </Button>
                      )}
                      {isMasterAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(user)}
                          disabled={actionLoading === user.id}
                          className="gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Password</span> <span className="sm:hidden">Reset</span>
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(user)}
                        disabled={actionLoading === user.id}
                        className="gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;
