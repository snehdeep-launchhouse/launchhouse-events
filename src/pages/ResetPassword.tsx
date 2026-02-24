import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const resolved = useRef(false);

  const linkType = useMemo(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    return hashParams.get("type");
  }, []);

  useEffect(() => {
    const markReady = (userEmail: string | undefined | null) => {
      if (resolved.current) return;
      resolved.current = true;
      setEmail(userEmail ?? null);
      setReady(true);
    };

    // Listen for auth state changes — this fires when the client processes the
    // hash fragment tokens (recovery / invite links).
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        markReady(session.user.email);
      }
    });

    // Also check if there's already a session (e.g. page refresh after token exchange).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        markReady(session.user.email);
      }
    });

    // Generous fallback — if after 4s we still don't have a session, show error.
    const timeout = window.setTimeout(() => {
      if (!resolved.current) {
        resolved.current = true;
        setError("This password setup link is invalid or expired. Please request a new invite.");
        setReady(true);
      }
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    // Verify we still have a session before attempting update
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Your session has expired. Please use the invite link again.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    window.setTimeout(() => {
      window.location.href = "/admin-report";
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-display">Set your password</h1>
          <p className="text-sm text-muted-foreground text-center">
            {linkType === "invite" ? "Finish accepting your invite by setting a password." : "Set a new password to continue."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email ?? ""} readOnly disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-primary">Password updated. Redirecting to dashboard…</p>}

        <Button type="submit" className="w-full" disabled={saving || !ready || success}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
