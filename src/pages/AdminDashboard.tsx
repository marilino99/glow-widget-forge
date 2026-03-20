import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Users, MessageCircle, Bot, BarChart3,
  Globe, Loader2, RefreshCw, UserCheck, Mail,
  TrendingUp, ArrowUpDown, Search, Contact,
} from "lucide-react";

interface TopUser {
  userId: string;
  email: string;
  contactName: string;
  websiteUrl: string | null;
  aiResponses: number;
  visitorMessages: number;
  conversations: number;
  contacts: number;
  chatbotEnabled: boolean;
  signupDate: string | null;
  lastActive: string | null;
}

interface ActiveWidgetUser {
  email: string;
  contactName: string;
  websiteUrl: string | null;
  widgetId: string;
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
  newUsersInPeriod: number;
  activationRate: number;
  totalContacts: number;
  avgMessagesPerUser: number;
  activeUsersInPeriod: number;
  usersWithConversationsInPeriod: number;
  activeWidgetUsers: ActiveWidgetUser[];
}

const ADMIN_USER_ID = "43c72ef7-a716-4d7f-af75-1a64aba01c24";

type SortKey = "aiResponses" | "visitorMessages" | "conversations" | "contacts" | "signupDate" | "lastActive";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("aiResponses");
  const [sortAsc, setSortAsc] = useState(false);
  const [showActiveWidgets, setShowActiveWidgets] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.id !== ADMIN_USER_ID)) {
      navigate("/builder");
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async (days?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const d = days ?? timeRange;

      const res = await supabase.functions.invoke(`admin-stats?days=${d}`, {
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

  const handleTimeChange = (val: string) => {
    setTimeRange(val);
    fetchStats(val);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!stats) return [];
    let users = [...stats.topUsers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.websiteUrl && u.websiteUrl.toLowerCase().includes(q)) ||
          u.contactName.toLowerCase().includes(q)
      );
    }
    users.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === "signupDate" || sortKey === "lastActive") {
        av = a[sortKey] || "";
        bv = b[sortKey] || "";
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      av = a[sortKey];
      bv = b[sortKey];
      return sortAsc ? av - bv : bv - av;
    });
    return users;
  }, [stats, searchQuery, sortKey, sortAsc]);

  const inactiveUsers = useMemo(() => {
    if (!stats) return [];
    return stats.topUsers.filter((u) => u.conversations === 0 && u.aiResponses === 0);
  }, [stats]);

  if (authLoading || !user || user.id !== ADMIN_USER_ID) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalAuthUsers, icon: Users, color: "text-blue-500" },
        { label: "New in Period", value: stats.newUsersInPeriod, icon: TrendingUp, color: "text-green-500" },
        { label: "Active Users", value: stats.activeUsersInPeriod, icon: UserCheck, color: "text-amber-500" },
        { label: "Users w/ Convs", value: stats.usersWithConversationsInPeriod, icon: MessageCircle, color: "text-orange-500" },
        { label: "Activation Rate", value: `${stats.activationRate}%`, icon: BarChart3, color: "text-emerald-500" },
        { label: "Conversations", value: stats.totalConversations, icon: MessageCircle, color: "text-violet-500" },
        { label: "Messages", value: stats.totalMessages, icon: MessageCircle, color: "text-pink-500" },
        { label: "Contacts", value: stats.totalContacts, icon: Contact, color: "text-teal-500" },
        { label: "Avg Msgs/User", value: stats.avgMessagesPerUser, icon: Bot, color: "text-indigo-500" },
        { label: "Widgets", value: stats.totalWidgets, icon: Globe, color: "text-sky-500" },
         { label: "Active Widgets", value: stats.activeWidgets, icon: Globe, color: "text-lime-500", onClick: () => setShowActiveWidgets(true) },
       ]
     : [];

   const signupDays = stats
     ? Object.entries(stats.recentSignups).sort(([a], [b]) => a.localeCompare(b))
     : [];

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-4 py-3 text-right cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === field ? "text-primary" : ""}`} />
      </span>
    </th>
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "2-digit" });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/builder")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex-1" />
        <Select value={timeRange} onValueChange={handleTimeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Today</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={loading} className="gap-2">
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
        <div className="mx-auto max-w-7xl space-y-8 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md ${card.onClick ? "cursor-pointer" : ""}`}
                    onClick={card.onClick}
                  >
                    <div className="flex items-center gap-2">
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                      <span className="text-[11px] text-muted-foreground">{card.label}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                      {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Signups Chart */}
              {signupDays.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-sm font-semibold text-foreground">
                    Signups — {timeRange === "all" ? "All Time" : `Last ${timeRange} days`}
                  </h2>
                  <div className="flex items-end gap-1" style={{ height: 120 }}>
                    {signupDays.map(([day, count]) => {
                      const max = Math.max(...signupDays.map(([, c]) => c));
                      const h = max > 0 ? (count / max) * 100 : 0;
                      return (
                        <div key={day} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[10px] font-medium text-foreground">{count}</span>
                          <div
                            className="w-full rounded-t-sm bg-primary/80"
                            style={{ height: `${Math.max(h, 4)}%` }}
                          />
                          <span className="text-[9px] text-muted-foreground">
                            {day.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    All Users ({filteredUsers.length})
                  </h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search email, website..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3 w-10">#</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Widget</th>
                        <th className="px-4 py-3">Website</th>
                        <th className="px-4 py-3 text-center">Chatbot</th>
                        <th className="px-4 py-3">Signup</th>
                        <th className="px-4 py-3">Last Active</th>
                        <SortHeader label="AI" field="aiResponses" />
                        <SortHeader label="Msgs" field="visitorMessages" />
                        <SortHeader label="Convs" field="conversations" />
                        <SortHeader label="Contacts" field="contacts" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr
                          key={u.userId}
                          className="border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground text-xs">{u.email}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{u.contactName}</td>
                          <td className="px-4 py-2.5 text-xs">
                            {u.websiteUrl ? (
                              <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {u.websiteUrl.replace(/^https?:\/\//, "").slice(0, 25)}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block h-2 w-2 rounded-full ${u.chatbotEnabled ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(u.signupDate)}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(u.lastActive)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">{u.aiResponses}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{u.visitorMessages}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{u.conversations}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{u.contacts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inactive Users */}
              {inactiveUsers.length > 0 && (
                <div className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="text-sm font-semibold text-foreground">
                      Inactive Users ({inactiveUsers.length})
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        No conversations or AI responses
                      </span>
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Signup</th>
                          <th className="px-4 py-3">Website</th>
                          <th className="px-4 py-3 text-center">Chatbot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inactiveUsers.slice(0, 20).map((u) => (
                          <tr key={u.userId} className="border-b border-border last:border-0 hover:bg-muted/50">
                            <td className="px-4 py-2.5 text-xs text-foreground">{u.email}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDate(u.signupDate)}</td>
                            <td className="px-4 py-2.5 text-xs">
                              {u.websiteUrl ? (
                                <a href={u.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {u.websiteUrl.replace(/^https?:\/\//, "").slice(0, 25)}
                                </a>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block h-2 w-2 rounded-full ${u.chatbotEnabled ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminDashboard;
