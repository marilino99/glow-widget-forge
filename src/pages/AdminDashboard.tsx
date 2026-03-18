import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Users, MessageCircle, Bot, BarChart3,
  Globe, Loader2, RefreshCw,
} from "lucide-react";

interface TopUser {
  userId: string;
  email: string;
  contactName: string;
  websiteUrl: string | null;
  aiResponses: number;
  visitorMessages: number;
  conversations: number;
}

interface AdminStats {
  totalUsers: number;
  totalAuthUsers: number;
  totalWidgets: number;
  totalConversations: number;
  totalMessages: number;
  activeWidgets: number;
  recentSignups: Record<string, number>;
  topUsers: TopUser[];
}

const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.id !== ADMIN_USER_ID)) {
      navigate("/builder");
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await supabase.functions.invoke("admin-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.error) throw res.error;
      setStats(res.data as AdminStats);
    } catch (e: any) {
      setError(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) fetchStats();
  }, [user]);

  if (authLoading || (!user || user.id !== ADMIN_USER_ID)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalAuthUsers, icon: Users, color: "text-blue-500" },
        { label: "Widgets Created", value: stats.totalWidgets, icon: BarChart3, color: "text-emerald-500" },
        { label: "Active Widgets", value: stats.activeWidgets, icon: Globe, color: "text-violet-500" },
        { label: "Conversations", value: stats.totalConversations, icon: MessageCircle, color: "text-orange-500" },
        { label: "Total Messages", value: stats.totalMessages, icon: MessageCircle, color: "text-pink-500" },
        { label: "AI Responses", value: stats.topUsers.reduce((s, u) => s + u.aiResponses, 0), icon: Bot, color: "text-cyan-500" },
      ]
    : [];

  const signupDays = stats
    ? Object.entries(stats.recentSignups)
        .sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/builder")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-6xl space-y-8 p-6">
          {/* Stat Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                      <span className="text-xs text-muted-foreground">{card.label}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Signups last 7 days */}
              {signupDays.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-sm font-semibold text-foreground">
                    Signups — Last 7 Days
                  </h2>
                  <div className="flex items-end gap-2" style={{ height: 120 }}>
                    {signupDays.map(([day, count]) => {
                      const max = Math.max(...signupDays.map(([, c]) => c));
                      const h = max > 0 ? (count / max) * 100 : 0;
                      return (
                        <div key={day} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-xs font-medium text-foreground">{count}</span>
                          <div
                            className="w-full rounded-t-md bg-primary/80"
                            style={{ height: `${Math.max(h, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {day.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Users Table */}
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    Top Users by AI Responses
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Widget Name</th>
                        <th className="px-6 py-3">Website</th>
                        <th className="px-6 py-3 text-right">AI Responses</th>
                        <th className="px-6 py-3 text-right">Visitor Msgs</th>
                        <th className="px-6 py-3 text-right">Conversations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.topUsers.map((u, i) => (
                        <tr
                          key={u.userId}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-6 py-3 font-medium text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-6 py-3 font-medium text-foreground">
                            {u.email}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {u.contactName}
                          </td>
                          <td className="px-6 py-3">
                            {u.websiteUrl ? (
                              <a
                                href={u.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {u.websiteUrl.replace(/^https?:\/\//, "").slice(0, 30)}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold text-foreground">
                            {u.aiResponses}
                          </td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {u.visitorMessages}
                          </td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {u.conversations}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;
