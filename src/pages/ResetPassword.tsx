import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Flame } from "lucide-react";

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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        markReady(session.user.email);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        markReady(session.user.email);
      }
    });

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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(220 50% 14%), hsl(220 40% 22%))" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl bg-card text-card-foreground p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(16 90% 45%))" }}
          >
            <Flame className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold font-display tracking-tight">Ignition</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {linkType === "invite"
                ? "Finish accepting your invite by setting a password."
                : "Set a new password to continue."}
            </p>
          </div>
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
        {success && <p className="text-sm font-medium" style={{ color: "hsl(24 95% 53%)" }}>Password updated. Redirecting to dashboard…</p>}

        <Button type="submit" className="w-full" disabled={saving || !ready || success}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Password"}
        </Button>
      </form>

      <p className="mt-8 text-xs" style={{ color: "hsl(220 15% 55%)" }}>
        © {new Date().getFullYear()} LaunchHouse Events
      </p>
    </div>
  );
};

export default ResetPassword;
