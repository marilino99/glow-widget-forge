import { ArrowLeft, MousePointerClick, Eye, TrendingUp, Loader2, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MetricsPanelProps {
  onBack: () => void;
  isPro: boolean;
  onUpgrade: () => void;
}

const MetricsPanel = ({ onBack, isPro, onUpgrade }: MetricsPanelProps) => {
  const { user } = useAuth();
  const [clicks, setClicks] = useState(0);
  const [impressions, setImpressions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

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

        const [clicksRes, impressionsRes] = await Promise.all([
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
        ]);

        setClicks(clicksRes.count ?? 0);
        setImpressions(impressionsRes.count ?? 0);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user, isPro]);

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + "%" : "0%";

  const metrics = [
    { icon: MousePointerClick, label: "Clicks", value: isLoading ? "..." : clicks.toLocaleString() },
    { icon: Eye, label: "Impressions", value: isLoading ? "..." : impressions.toLocaleString() },
    { icon: TrendingUp, label: "CTR", value: isLoading ? "..." : ctr },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">Metrics</h2>
        {isPro && isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isPro ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Pro Feature</h3>
            <p className="mb-6 max-w-[260px] text-sm text-muted-foreground">
              Upgrade to Pro to unlock detailed analytics about your widget's performance.
            </p>
            <Button onClick={onUpgrade} className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              Last 30 days of widget performance.
            </p>
            <div className="space-y-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel;
