import { ArrowLeft, X, Sparkles, BarChart3, Zap, Globe, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeOverlayProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const features = [
  {
    icon: BarChart3,
    title: "Advanced analytics.",
    description: "Track clicks, impressions, and CTR to optimize your widget's performance.",
  },
  {
    icon: Zap,
    title: "Priority support.",
    description: "Get faster responses and dedicated help when you need it.",
  },
  {
    icon: Palette,
    title: "Remove branding.",
    description: "Hide all Widjet branding and make your widget truly your own.",
  },
  {
    icon: Globe,
    title: "Custom domain.",
    description: "Use your own domain for a fully branded experience.",
  },
];

const UpgradeOverlay = ({ onBack, onUpgrade }: UpgradeOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-auto">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Title section */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Do more with{" "}
              <span className="relative">
                Widjet
                <span className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-purple-500" />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Upgrade to access advanced features designed for growing businesses.
            </p>
          </div>

          {/* Pro plan card */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-2xl font-bold text-foreground">Pro</h2>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm text-muted-foreground">€</span>
                  <span className="text-4xl font-bold text-foreground">9.90</span>
                </div>
                <span className="text-sm text-muted-foreground">per month</span>
              </div>
            </div>

            <Button
              onClick={onUpgrade}
              className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 rounded-xl text-base"
            >
              Upgrade to Pro
            </Button>
            <p className="text-center text-sm text-muted-foreground mb-8">
              Pay €9.90 Every Month
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title}>
                  <feature.icon className="h-5 w-5 text-purple-500 mb-2" />
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{feature.title}</span>{" "}
                    <span className="text-muted-foreground">{feature.description}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
