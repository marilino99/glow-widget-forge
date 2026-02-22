import { useEffect, useState } from "react";
import { MousePointerClick, Eye, TrendingUp, Loader2, Plug, ShoppingBag, Globe, MessageSquareText } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

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

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const since = thirtyDaysAgo.toISOString();

        const [clicksRes, impressionsRes, convsRes] = await Promise.all([
          (supabase.from("widget_events") as any)
            .select("id", { count: "exact", head: true })
            .eq("widget_id", config.id)
            .eq("event_type", "click")
            .gte("created_at", since),
          (supabase.from("widget_events") as any)
            .select("id", { count: "exact", head: true })
            .eq("widget_id", config.id)
            .eq("event_type", "impression")
            .gte("created_at", since),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("widget_owner_id", user.id),
        ]);

        setClicks(clicksRes.count ?? 0);
        setImpressions(impressionsRes.count ?? 0);
        setConversations(convsRes.count ?? 0);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

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
            {getGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
        </div>

        {/* Metrics cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "#5b5b65" }}>Performance</h2>
          <p className="mb-4 text-xs" style={{ color: "#5b5b65" }}>Last 30 days</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metricCards.map((metric) => (
              <div
                key={metric.label}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all hover:shadow-md"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${metric.color}15` }}
                >
                  <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
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
            ))}
          </div>
        </div>

        {/* Bottom sections */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick metrics */}
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
      </div>
    </div>
  );
};

export default BuilderHome;
