import { useEffect, useState, useMemo } from "react";
import { MousePointerClick, Eye, TrendingUp, Loader2, Plug, ShoppingBag, Globe, MessageSquareText, Mail, CalendarDays, CalendarIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import successCoachImg from "@/assets/success-coach.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BuilderHomeProps {
  isPro: boolean;
  userName?: string | null;
}

const BuilderHome = ({ isPro, userName }: BuilderHomeProps) => {
  const { user } = useAuth();
  const [clicks, setClicks] = useState(0);
  const [impressions, setImpressions] = useState(0);
  const [conversations, setConversations] = useState(0);
  const [chartData, setChartData] = useState<Record<string, { date: string; value: number }[]>>({});
  const [activeChart, setActiveChart] = useState<"Conversations" | "Impressions" | "Clicks" | "CTR">("Conversations");
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 9));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [pickingFrom, setPickingFrom] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        const { data: config } = await supabase
          .from("widget_configurations")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!config) {
          setIsLoading(false);
          return;
        }

        const since = startOfDay(dateFrom).toISOString();
        const until = new Date(startOfDay(dateTo).getTime() + 86400000 - 1).toISOString();

        const [clicksRes, impressionsRes, convsRes] = await Promise.all([
          (supabase.from("widget_events") as any)
            .select("id", { count: "exact", head: true })
            .eq("widget_id", config.id)
            .eq("event_type", "click")
            .gte("created_at", since)
            .lte("created_at", until),
          (supabase.from("widget_events") as any)
            .select("id", { count: "exact", head: true })
            .eq("widget_id", config.id)
            .eq("event_type", "impression")
            .gte("created_at", since)
            .lte("created_at", until),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("widget_owner_id", user.id)
            .gte("created_at", since)
            .lte("created_at", until),
        ]);

        setClicks(clicksRes.count ?? 0);
        setImpressions(impressionsRes.count ?? 0);
        setConversations(convsRes.count ?? 0);

        // Fetch daily data for charts
        const [convRows, eventRows] = await Promise.all([
          supabase
            .from("conversations")
            .select("created_at")
            .eq("widget_owner_id", user.id)
            .gte("created_at", since)
            .lte("created_at", until)
            .order("created_at", { ascending: true }),
          (supabase.from("widget_events") as any)
            .select("created_at, event_type")
            .eq("widget_id", config.id)
            .in("event_type", ["click", "impression"])
            .gte("created_at", since)
            .lte("created_at", until)
            .order("created_at", { ascending: true }),
        ]);

        // Build day map
        const days = eachDayOfInterval({ start: startOfDay(dateFrom), end: startOfDay(dateTo) });
        const dayKeys = days.map((d) => format(d, "MMM d"));

        const makeEmpty = () => Object.fromEntries(dayKeys.map((k) => [k, 0]));
        const convsMap = makeEmpty();
        const clicksMap = makeEmpty();
        const impressionsMap = makeEmpty();

        (convRows.data || []).forEach((row: any) => {
          const key = format(new Date(row.created_at), "MMM d");
          if (key in convsMap) convsMap[key]++;
        });
        (eventRows.data || []).forEach((row: any) => {
          const key = format(new Date(row.created_at), "MMM d");
          if (row.event_type === "click" && key in clicksMap) clicksMap[key]++;
          if (row.event_type === "impression" && key in impressionsMap) impressionsMap[key]++;
        });

        const toArray = (map: Record<string, number>) =>
          Object.entries(map).map(([date, value]) => ({ date, value }));

        const ctrArray = dayKeys.map((key) => {
          const imp = impressionsMap[key] || 0;
          const clk = clicksMap[key] || 0;
          return { date: key, value: imp > 0 ? parseFloat(((clk / imp) * 100).toFixed(1)) : 0 };
        });

        setChartData({
          Conversations: toArray(convsMap),
          Clicks: toArray(clicksMap),
          Impressions: toArray(impressionsMap),
          CTR: ctrArray,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user, dateFrom, dateTo]);

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) + "%" : "0%";

  const metricCards = [
    { icon: Eye, label: "Impressions", value: impressions, color: "#5b5b65" },
    { icon: MousePointerClick, label: "Clicks", value: clicks, color: "#5b5b65" },
    { icon: TrendingUp, label: "CTR", value: ctr, color: "#5b5b65" },
    { icon: MessageSquareText, label: "Conversations", value: conversations, color: "#5b5b65" },
  ];

  const integrations = [
    { icon: ShoppingBag, name: "Shopify", description: "Connect your store", available: false },
    { icon: Globe, name: "WordPress", description: "Install plugin", available: false },
    { icon: Plug, name: "Zapier", description: "Automate workflows", available: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafa] p-8 lg:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">My Workspace</p>
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}{userName ? `, ${userName} 👋` : " 👋"}
          </h1>
        </div>

        {/* Metrics cards */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "#5b5b65" }}>Performance</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 text-sm font-normal text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateFrom, "MMM d, yyyy")} – {format(dateTo, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex border-b border-border">
                  {[
                    { label: "Last 7 days", days: 6 },
                    { label: "Last 30 days", days: 29 },
                    { label: "Last 90 days", days: 89 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setDateFrom(subDays(new Date(), preset.days));
                        setDateTo(new Date());
                        setPickingFrom(false);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {pickingFrom ? (
                  <div>
                    <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">End date</p>
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(d) => { if (d) { setDateTo(d); setPickingFrom(false); } }}
                      disabled={(d) => d > new Date() || d < dateFrom}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">Start date</p>
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(d) => { if (d) { setDateFrom(d); setPickingFrom(true); } }}
                      disabled={(d) => d > new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metricCards.map((metric) => {
              const isClickable = metric.label === "Impressions" || metric.label === "Clicks" || metric.label === "Conversations" || metric.label === "CTR";
              const isActive = isClickable && activeChart === metric.label;
              return (
                <div
                  key={metric.label}
                  onClick={() => isClickable && setActiveChart(metric.label as any)}
                  className={`group flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
                    isClickable ? "cursor-pointer" : ""
                  } ${
                    isActive
                      ? "border-[#818cf8] bg-[#818cf8]/5 shadow-md"
                      : "border-border bg-background hover:shadow-md"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: isActive ? "rgba(129,140,248,0.15)" : `${metric.color}15` }}
                  >
                    <metric.icon className="h-5 w-5" style={{ color: isActive ? "#818cf8" : metric.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic chart */}
        <div>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "#5b5b65" }}>{activeChart}</h2>
          <div className="rounded-2xl border border-border bg-background p-6 pb-4">
            <div className="h-[200px]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData[activeChart] || []} margin={{ top: 20, right: 10, bottom: 0, left: 10 }}>
                    <defs>
                      <linearGradient id="chatsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#b0b0b8" }} dy={12} />
                    <YAxis hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3) || 1]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 14, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 13, padding: "8px 14px" }}
                      cursor={{ stroke: "#c7c7cf", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area type="natural" dataKey="value" stroke="#818cf8" strokeWidth={2} fill="url(#chatsFill)" dot={false} activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick insights */}
          <div>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "#5b5b65" }}>Quick insights</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(91,91,101,0.1)" }}>
                  <Eye className="h-5 w-5" style={{ color: "#5b5b65" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Widget status</p>
                  <p className="text-xs text-muted-foreground">
                    {impressions > 0 ? "Active — receiving traffic" : "No impressions yet"}
                  </p>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${impressions > 0 ? "bg-green-500" : "bg-muted-foreground/30"}`} />
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(91,91,101,0.1)" }}>
                  <MessageSquareText className="h-5 w-5" style={{ color: "#5b5b65" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Unread conversations</p>
                  <p className="text-xs text-muted-foreground">
                    {conversations > 0 ? `${conversations} total conversations` : "No conversations yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(91,91,101,0.1)" }}>
                  <TrendingUp className="h-5 w-5" style={{ color: "#5b5b65" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Engagement rate</p>
                  <p className="text-xs text-muted-foreground">
                    {ctr} click-through rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "#5b5b65" }}>Integrations</h2>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 opacity-60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                    <integration.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    coming soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Coach */}
        <div>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "#5b5b65" }}>Your Success Coach</h2>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-4 mb-5">
              <img src={successCoachImg} alt="Success Coach" className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-[#e0a030]" />
              <div>
                <p className="text-base font-semibold text-foreground">Widjet Team</p>
                <p className="text-sm text-muted-foreground">support@getwidjet.com</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="mailto:support@getwidjet.com"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Mail className="h-4 w-4" style={{ color: "#5b5b65" }} />
                Contact Us
              </a>
              <a
                href="https://cal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <CalendarDays className="h-4 w-4" style={{ color: "#5b5b65" }} />
                Book a Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderHome;
