import { useEffect, useMemo, useState } from "react";
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

  const linkType = useMemo(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    return hashParams.get("type");
  }, []);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (session?.user) {
        setEmail(session.user.email ?? null);
        setReady(true);
        return;
      }

      // Give the auth client a moment to process recovery/invite hash tokens.
      window.setTimeout(async () => {
        const { data: { session: delayedSession } } = await supabase.auth.getSession();
        if (!active) return;

        if (delayedSession?.user) {
          setEmail(delayedSession.user.email ?? null);
          setReady(true);
          return;
        }

        setError("This password setup link is invalid or expired.");
        setReady(true);
      }, 500);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session?.user) return;
      setEmail(session.user.email ?? null);
      setReady(true);
    });

    hydrateSession();

    return () => {
      active = false;
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
