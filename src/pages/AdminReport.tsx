import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Lock } from "lucide-react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "launchhouse@123";

type AbandonedForm = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  last_page_visited: number;
  status: string | null;
  created_at: string;
  updated_at: string;
};

const AdminReport = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [records, setRecords] = useState<AbandonedForm[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const fetchRecords = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("abandoned_eb_forms")
        .select("*")
        .eq("status", "partial")
        .order("created_at", { ascending: false });
      if (!error && data) setRecords(data as AbandonedForm[]);
      setLoading(false);
    };
    fetchRecords();
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display">Admin Report</h1>
            <p className="text-sm text-muted-foreground">Enter credentials to continue</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          {loginError && <p className="text-sm text-destructive">{loginError}</p>}
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Abandoned EB Form Report</h1>
            <p className="text-sm text-muted-foreground">Showing records with status: partial</p>
          </div>
          <Button variant="outline" onClick={() => setAuthenticated(false)}>Logout</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No partial records found.</div>
        ) : (
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Last Page</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.first_name}</TableCell>
                    <TableCell>{r.last_name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.company_name}</TableCell>
                    <TableCell>{r.last_page_visited}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(r.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReport;
