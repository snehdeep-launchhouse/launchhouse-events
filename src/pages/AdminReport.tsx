import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Lock, RefreshCw, Download, ArrowLeft, FileText, Users, ClipboardList } from "lucide-react";

const ADMIN_USER = "admin";
const ADMIN_PASS = "launchhouse@123";

type ReportType = "abandoned" | "build_requests" | "quote_requests" | null;

const REPORT_CARDS: { key: ReportType; title: string; description: string; icon: React.ReactNode }[] = [
  { key: "abandoned", title: "Abandoned EB Forms", description: "Partial form submissions that were not completed", icon: <ClipboardList className="w-8 h-8" /> },
  { key: "build_requests", title: "Build Requests", description: "All submitted event build requests", icon: <FileText className="w-8 h-8" /> },
  { key: "quote_requests", title: "Quote Requests", description: "All submitted quote requests", icon: <Users className="w-8 h-8" /> },
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
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
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
    fetchReport(type);
  };

  const handleRefresh = () => fetchReport(activeReport);

  /* ── Login Screen ─────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display">Admin Dashboard</h1>
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

  /* ── Report Picker (Cards) ────────────────────────────────────── */
  if (!activeReport) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Select a report to view</p>
            </div>
            <Button variant="outline" onClick={() => setAuthenticated(false)}>Logout</Button>
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
        {/* Header */}
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
            <Button variant="outline" size="sm" onClick={() => setAuthenticated(false)}>Logout</Button>
          </div>
        </div>

        {/* Table */}
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
