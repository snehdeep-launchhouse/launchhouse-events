import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Lock, RefreshCw, Download, ArrowLeft, FileText, Users, ClipboardList, ShieldCheck, Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ManageAdmins from "@/components/ManageAdmins";
import IgnitionHeader from "@/components/IgnitionHeader";
import IgnitionFooter from "@/components/IgnitionFooter";
import IgnitionLogo from "@/components/IgnitionLogo";

type ReportType = "abandoned" | "build_requests" | "quote_requests" | "manage_admins" | null;

const MASTER_ADMIN_EMAIL = "snehdeep@launchhouse.events";

const BASE_REPORT_CARDS: { key: ReportType; title: string; description: string; icon: React.ReactNode; superOnly?: boolean }[] = [
  { key: "abandoned", title: "Abandoned EB Forms", description: "Partial form submissions that were not completed", icon: <ClipboardList className="w-7 h-7" /> },
  { key: "build_requests", title: "Build Requests", description: "All submitted event build requests", icon: <FileText className="w-7 h-7" /> },
  { key: "quote_requests", title: "Quote Requests", description: "All submitted quote requests", icon: <Users className="w-7 h-7" /> },
  { key: "manage_admins", title: "Manage System Admins", description: "Add, remove, or reset passwords for admin users", icon: <ShieldCheck className="w-7 h-7" />, superOnly: true },
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

/* ── Memoized Report Card ─────────────────────────────────────── */
const ReportCard = memo(({ card, count, onClick }: {
  card: (typeof BASE_REPORT_CARDS)[number];
  count: number | null | undefined;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group rounded-xl border bg-card p-4 sm:p-6 text-left shadow-sm hover:shadow-md hover:border-primary/50 transition-all space-y-3"
    style={{ borderColor: "hsl(220 15% 88%)" }}
  >
    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
      style={{
        background: card.superOnly
          ? "linear-gradient(135deg, hsl(24 95% 53% / 0.12), hsl(16 90% 45% / 0.08))"
          : "hsl(212 100% 44% / 0.08)",
        color: card.superOnly ? "hsl(24 95% 53%)" : "hsl(212 100% 44%)",
      }}
    >
      {card.icon}
    </div>
    <h2 className="text-base font-semibold font-display">{card.title}</h2>
    <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
    {count != null && (
      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        {count} records
      </span>
    )}
  </button>
));
ReportCard.displayName = "ReportCard";

/* ── Fetch helpers for React Query ────────────────────────────── */
const fetchReportData = async (type: ReportType): Promise<Record<string, unknown>[]> => {
  if (!type || type === "manage_admins") return [];
  let query;
  if (type === "abandoned") {
    query = supabase.from("abandoned_eb_forms").select("*").eq("status", "partial").order("created_at", { ascending: false });
  } else if (type === "build_requests") {
    query = supabase.from("build_requests").select("*").order("submitted_at", { ascending: false });
  } else {
    query = supabase.from("quote_requests").select("*").order("submitted_at", { ascending: false });
  }
  const { data } = await query;
  return (data as Record<string, unknown>[]) ?? [];
};

const fetchRecordCounts = async (): Promise<Record<string, number | null>> => {
  const [ab, br, qr] = await Promise.all([
    supabase.from("abandoned_eb_forms").select("id", { count: "exact", head: true }).eq("status", "partial"),
    supabase.from("build_requests").select("id", { count: "exact", head: true }),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }),
  ]);
  return {
    abandoned: ab.count ?? null,
    build_requests: br.count ?? null,
    quote_requests: qr.count ?? null,
  };
};

/* ── Main Component ───────────────────────────────────────────── */
const AdminReport = () => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated">("loading");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const isSuperAdmin = currentUserEmail === MASTER_ADMIN_EMAIL;
  const visibleCards = useMemo(() => BASE_REPORT_CARDS.filter((c) => !c.superOnly || isSuperAdmin), [isSuperAdmin]);

  /* ── React Query: record counts ── */
  const { data: recordCounts = {} } = useQuery({
    queryKey: ["ignition", "counts"],
    queryFn: fetchRecordCounts,
    enabled: authState === "authenticated",
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  /* ── React Query: report data ── */
  const { data: records = [], isLoading: loading } = useQuery({
    queryKey: ["ignition", "report", activeReport],
    queryFn: () => fetchReportData(activeReport),
    enabled: authState === "authenticated" && !!activeReport && activeReport !== "manage_admins",
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  /* ── Check existing session on mount ── */
  useEffect(() => {
    let cancelled = false;

    const resolveAuth = async (userId: string, userEmail: string | undefined) => {
      if (cancelled) return;
      const { data } = await supabase.from("admin_users").select("id, status").eq("id", userId).single();
      if (cancelled) return;
      if (data) {
        setCurrentUserId(userId);
        setCurrentUserEmail(userEmail ?? null);
        if (data.status === "invited") {
          await supabase.from("admin_users").update({ status: "active" }).eq("id", userId);
        }
        setAuthState("authenticated");
      } else {
        setAuthState("login");
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && authState === "loading") {
        resolveAuth(session.user.id, session.user.email);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        resolveAuth(session.user.id, session.user.email);
      } else {
        if (!cancelled) setAuthState("login");
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Realtime subscription — invalidates React Query cache ── */
  useEffect(() => {
    if (authState !== "authenticated") return;

    const channel = supabase
      .channel("ignition-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "abandoned_eb_forms" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ignition"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "build_requests" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ignition"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "quote_requests" }, () => {
        queryClient.invalidateQueries({ queryKey: ["ignition"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState, queryClient]);

  /* ── Login handler ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setLoginError(error.message); return; }
      const { data, error: adminError } = await supabase.from("admin_users").select("id").eq("id", authData.user.id).single();
      if (adminError || !data) {
        await supabase.auth.signOut();
        setLoginError("You are not authorized to access this dashboard.");
        return;
      }
      setCurrentUserId(authData.user.id);
      setCurrentUserEmail(authData.user.email ?? null);
      await supabase.from("admin_users").update({ status: "active" }).eq("id", authData.user.id);
      setAuthState("authenticated");
    } catch {
      setLoginError("Network error — please try from the published URL.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState("login");
    setActiveReport(null);
    setCurrentUserId(null);
    setCurrentUserEmail(null);
    queryClient.clear();
  };

  const openReport = (type: ReportType) => {
    if (type === "manage_admins" && !isSuperAdmin) return;
    setActiveReport(type);
  };

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["ignition", "report", activeReport] });
  }, [queryClient, activeReport]);

  /* ── Loading Screen ── */
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <IgnitionLogo size={48} />
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-3/4 mx-auto rounded-lg" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Authenticating…</p>
        </div>
      </div>
    );
  }

  /* ── Login Screen ── */
  if (authState === "login") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, hsl(220 50% 14%), hsl(220 40% 22%))" }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(16 90% 45%))" }}
              >
                <Flame className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold font-display">Ignition</h1>
              <p className="text-sm text-muted-foreground">Sign in to access the dashboard</p>
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
        <div className="text-center py-4 text-white/40 text-xs">© {new Date().getFullYear()} LaunchHouse Events</div>
      </div>
    );
  }

  /* ── Manage Admins View (super admin only) ── */
  if (activeReport === "manage_admins") {
    if (!isSuperAdmin) {
      setActiveReport(null);
      return null;
    }
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <IgnitionHeader userEmail={currentUserEmail} onLogout={handleLogout} />
        <div className="flex-1">
          <ManageAdmins onBack={() => setActiveReport(null)} currentUserId={currentUserId ?? undefined} />
        </div>
        <IgnitionFooter />
      </div>
    );
  }

  /* ── Report Picker (Cards) ── */
  if (!activeReport) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <IgnitionHeader userEmail={currentUserEmail} onLogout={handleLogout} />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">Select a report to view live data.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleCards.map((card) => (
                <ReportCard
                  key={card.key}
                  card={card}
                  count={recordCounts[card.key as string]}
                  onClick={() => openReport(card.key)}
                />
              ))}
            </div>
          </div>
        </div>
        <IgnitionFooter />
      </div>
    );
  }

  /* ── Report Table View ── */
  const reportTitle = BASE_REPORT_CARDS.find((c) => c.key === activeReport)?.title ?? "";
  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <IgnitionHeader userEmail={currentUserEmail} onLogout={handleLogout} />
      <div className="flex-1 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" onClick={() => setActiveReport(null)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold font-display">{reportTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading..." : `${records.length} record${records.length !== 1 ? "s" : ""}`}
                  <span className="ml-2 text-xs text-primary/60">● Live</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-1.5">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(records, activeReport ?? "report")} disabled={records.length === 0} className="gap-1.5">
                <Download className="w-4 h-4" /> CSV
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No records found.</div>
          ) : (
            <div className="rounded-lg border overflow-auto" style={{ borderColor: "hsl(220 15% 88%)" }}>
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
                        if (val === null || val === undefined) display = "—";
                        else if (typeof val === "object") display = JSON.stringify(val);
                        else display = String(val);
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
      <IgnitionFooter />
    </div>
  );
};

export default AdminReport;
