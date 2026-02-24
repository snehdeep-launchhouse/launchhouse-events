import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

const AdminSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Account created! Your user ID is: ${data.user?.id ?? "unknown"}. Add this ID to the admin_users table.`);
      }
    } catch (err) {
      setMessage("Network error — please try again from the published URL: https://launchhouse-events.lovable.app/admin-signup");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold font-display">Admin Signup</h1>
          <p className="text-sm text-muted-foreground">Create your admin account</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
        </div>
        {message && <p className="text-sm text-muted-foreground break-all">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
};

export default AdminSignup;
