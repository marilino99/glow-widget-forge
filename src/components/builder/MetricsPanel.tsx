import { ArrowLeft, MousePointerClick, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const metrics = [
  {
    icon: MousePointerClick,
    label: "Clicks",
    value: "1,243",
    change: "+12.5%",
    positive: true,
  },
  {
    icon: Eye,
    label: "Impressions",
    value: "24,891",
    change: "+8.3%",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "CTR",
    value: "4.99%",
    change: "+2.1%",
    positive: true,
  },
];

interface MetricsPanelProps {
  onBack: () => void;
}

const MetricsPanel = ({ onBack }: MetricsPanelProps) => {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold text-foreground">Metrics</h2>
      </div>

      {/* Metrics cards */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-4 text-xs text-muted-foreground">
          Track your widget performance with real-time metrics.
        </p>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:animate-bounce">
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold text-foreground">{metric.value}</p>
              </div>
              <span className={`text-xs font-medium ${metric.positive ? "text-emerald-500" : "text-destructive"}`}>
                {metric.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;
