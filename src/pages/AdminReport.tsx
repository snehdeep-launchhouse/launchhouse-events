import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Lock, RefreshCw, Download, ArrowLeft, FileText, Users, ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import ManageAdmins from "@/components/ManageAdmins";

type ReportType = "abandoned" | "build_requests" | "quote_requests" | "manage_admins" | null;

const REPORT_CARDS: { key: ReportType; title: string; description: string; icon: React.ReactNode }[] = [
  { key: "abandoned", title: "Abandoned EB Forms", description: "Partial form submissions that were not completed", icon: <ClipboardList className="w-8 h-8" /> },
  { key: "build_requests", title: "Build Requests", description: "All submitted event build requests", icon: <FileText className="w-8 h-8" /> },
  { key: "quote_requests", title: "Quote Requests", description: "All submitted quote requests", icon: <Users className="w-8 h-8" /> },
  { key: "manage_admins", title: "Manage System Admins", description: "Add, remove, or reset passwords for admin users", icon: <ShieldCheck className="w-8 h-8" /> },
];

/* ── CSV Download helper ──────────────────────────────────────── */
const downloadCSV = (rows: Record<string, unknown>[], filename: string) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Main Component ───────────────────────────────────────────── */
const AdminReport = () => {
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated">("loading");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  /* ── Check existing session on mount ─────────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("admin_users").select("id").eq("id", user.id).single();
        if (data) {
          setCurrentUserId(user.id);
          setCurrentUserEmail(user.email ?? null);
          setAuthState("authenticated");
          return;
        }
      }
      setAuthState("login");
    };
    checkAuth();
  }, []);

  /* ── Login handler ───────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError(error.message);
        return;
      }
      // Verify user is in admin_users table
      const { data, error: adminError } = await supabase.from("admin_users").select("id").eq("id", authData.user.id).single();
      if (adminError || !data) {
        await supabase.auth.signOut();
        setLoginError("You are not authorized to access this dashboard.");
        return;
      }
      setCurrentUserId(authData.user.id);
      setCurrentUserEmail(authData.user.email ?? null);
      setAuthState("authenticated");
    } catch (err) {
      setLoginError("Network error — please try from the published URL.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState("login");
    setActiveReport(null);
    setRecords([]);
  };

  const fetchReport = useCallback(async (type: ReportType) => {
    if (!type) return;
    setLoading(true);
    setRecords([]);
    let query;
    if (type === "abandoned") {
      query = supabase.from("abandoned_eb_forms").select("*").eq("status", "partial").order("created_at", { ascending: false });
    } else if (type === "build_requests") {
      query = supabase.from("build_requests").select("*").order("submitted_at", { ascending: false });
    } else {
      query = supabase.from("quote_requests").select("*").order("submitted_at", { ascending: false });
    }
    const { data } = await query;
    if (data) setRecords(data as Record<string, unknown>[]);
    setLoading(false);
  }, []);

  const openReport = (type: ReportType) => {
    setActiveReport(type);
    if (type && type !== "manage_admins") fetchReport(type);
  };

  const handleRefresh = () => fetchReport(activeReport);

  /* ── Loading Screen ──────────────────────────────────────────── */
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ── Login Screen ─────────────────────────────────────────────── */
  if (authState === "login") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          {loginError && <p className="text-sm text-destructive">{loginError}</p>}
          <Button type="submit" className="w-full" disabled={loginLoading}>
            {loginLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : "Sign In"}
          </Button>
        </form>
      </div>
    );
  }

  /* ── Manage Admins View ─────────────────────────────────────── */
  if (activeReport === "manage_admins") {
    return <ManageAdmins onBack={() => setActiveReport(null)} currentUserId={currentUserId ?? undefined} />;
  }

  /* ── Report Picker (Cards) ────────────────────────────────────── */
  if (!activeReport) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{currentUserEmail}</span>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-1.5"><LogOut className="w-4 h-4" /> Logout</Button>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {REPORT_CARDS.map((card) => (
              <button
                key={card.key}
                onClick={() => openReport(card.key)}
                className="group rounded-xl border border-border bg-card p-6 text-left shadow-sm hover:shadow-md hover:border-primary/50 transition-all space-y-3"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {card.icon}
                </div>
                <h2 className="text-lg font-semibold font-display">{card.title}</h2>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Report Table View ────────────────────────────────────────── */
  const reportTitle = REPORT_CARDS.find((c) => c.key === activeReport)?.title ?? "";
  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveReport(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display">{reportTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${records.length} record${records.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-1.5">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadCSV(records, activeReport ?? "report")} disabled={records.length === 0} className="gap-1.5">
              <Download className="w-4 h-4" /> Download CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5"><LogOut className="w-4 h-4" /> Logout</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No records found.</div>
        ) : (
          <div className="rounded-lg border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="whitespace-nowrap capitalize">{col.replace(/_/g, " ")}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => {
                      const val = row[col];
                      let display: string;
                      if (val === null || val === undefined) {
                        display = "—";
                      } else if (typeof val === "object") {
                        display = JSON.stringify(val);
                      } else {
                        display = String(val);
                      }
                      return <TableCell key={col} className="whitespace-nowrap max-w-[300px] truncate">{display}</TableCell>;
                    })}
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
