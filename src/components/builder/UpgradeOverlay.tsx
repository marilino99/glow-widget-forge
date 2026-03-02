import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradeOverlayProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const detectCurrency = (): "EUR" | "USD" => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("America/")) return "USD";
  } catch {}
  return "EUR";
};

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceEur: 0,
    annualPriceEur: 0,
    description: "Perfect for individuals that want to start and try things out.",
    cta: "Current plan",
    highlighted: false,
    featuresLabel: "Key features:",
    features: ["1 AI widget", "100 AI responses/mo", "Customizable theme & colors", "Contact card", "WhatsApp integration", "FAQ section", "Product carousel", "Escalate to human"],
    planKey: "free",
  },
  {
    name: "Plus",
    monthlyPrice: 19,
    annualPrice: 16,
    monthlyPriceEur: 18,
    annualPriceEur: 15,
    description: "For growing businesses that need advanced support & scalability.",
    cta: "Get Started",
    highlighted: false,
    featuresLabel: "Everything in Free",
    features: ["3 AI widgets", "2,000 AI responses/mo", "AI summaries", "Advanced analytics", "24/7 Priority support", "Custom branding", "Widget size & position control", "Team collaboration (coming soon)"],
    planKey: "starter",
  },
  {
    name: "Business",
    monthlyPrice: 49,
    annualPrice: 39,
    monthlyPriceEur: 48,
    annualPriceEur: 38,
    description: "For large teams looking for powerful and customizable AI support.",
    cta: "Get Started",
    highlighted: true,
    badge: "POPULAR",
    featuresLabel: "Everything in Plus",
    features: ["10 AI widgets", "10,000 AI responses/mo", "Advanced analytics", "Custom branding", "Priority support", "Team collaboration"],
    planKey: "business",
  },
  {
    name: "Enterprise",
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyPriceEur: 0,
    annualPriceEur: 0,
    description: "For organizations needing high-volume support & custom integrations.",
    cta: "Contact Sales",
    highlighted: false,
    featuresLabel: "Everything in Business",
    features: ["Unlimited conversations", "API access", "Dedicated account manager", "SLA guarantee", "SSO & advanced security", "White labeling"],
    planKey: "enterprise",
  },
];

const UpgradeOverlay = ({ onBack, onUpgrade }: UpgradeOverlayProps) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<"EUR" | "USD">(detectCurrency);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currencySymbol = currency === "EUR" ? "€" : "$";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePaidCheckout = async (planKey: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { returnUrl: window.location.origin, billingInterval: isAnnual ? "year" : "month", plan: planKey },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#ffffff] overflow-auto">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-border">
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
      <div className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Simple, fair{" "}
              <span className="text-muted-foreground/60">pricing</span>.
            </h1>
          </div>

          {/* Toggle + Currency */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center rounded-full bg-[#f6f5f4] p-1">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={cn("relative rounded-full px-5 py-1 text-sm font-bold transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {!isAnnual && <motion.span layoutId="upgrade-pill" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                  <span className="relative z-10">Pay monthly</span>
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={cn("relative rounded-full px-5 py-1 text-sm font-bold transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {isAnnual && <motion.span layoutId="upgrade-pill" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                  <span className="relative z-10">Pay yearly</span>
                </button>
              </div>
              <span className="text-sm font-medium text-[hsl(270,70%,55%)]">Save up to 20% with yearly</span>
            </div>
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Price in</span>
                <span className="font-semibold text-foreground">{currency}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", currencyOpen && "rotate-180")} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 rounded-lg border border-border bg-background shadow-lg z-20 overflow-hidden">
                  {(["EUR", "USD"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                      className={cn("block w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors", currency === c && "font-semibold text-foreground bg-muted")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 items-stretch">
            {plans.map((plan, i) => {
              const price = currency === "EUR"
                ? (isAnnual ? plan.annualPriceEur : plan.monthlyPriceEur)
                : (isAnnual ? plan.annualPrice : plan.monthlyPrice);
              const displayPrice = price === 0 ? "0" : price % 1 === 0 ? String(price) : price.toFixed(2);
              const isHighlighted = plan.highlighted;

              const card = (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl border overflow-hidden h-full",
                    isHighlighted ? "bg-[hsl(220,20%,6%)] text-white border-transparent" : "border-border"
                  )}
                >
                  {isHighlighted && (
                    <>
                      <motion.div className="pointer-events-none absolute -top-1/4 -left-1/4 h-[80%] w-[60%] rounded-full opacity-20 blur-[80px]" style={{ background: "hsl(270,70%,50%)" }} animate={{ x: [0, 50, 0], y: [0, 40, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                      <motion.div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[70%] w-[55%] rounded-full opacity-15 blur-[80px]" style={{ background: "hsl(25,95%,55%)" }} animate={{ x: [0, -40, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
                      <motion.div className="pointer-events-none absolute top-1/3 left-1/3 h-[50%] w-[40%] rounded-full opacity-10 blur-[70px]" style={{ background: "hsl(330,80%,55%)" }} animate={{ x: [0, -30, 30, 0], y: [0, 20, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
                    </>
                  )}
                  <div className="flex flex-col p-6 pb-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("text-xl font-bold", isHighlighted ? "text-white" : "text-foreground")}>{plan.name}</h3>
                      {"badge" in plan && plan.badge && (
                        <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{plan.badge}</span>
                      )}
                    </div>
                    <div className="h-[72px] flex flex-col justify-center">
                      {plan.planKey === "enterprise" ? (
                        <span className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}>Let's talk</span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={`${price}-${currency}`}
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.2 }}
                              className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}
                            >
                              {currencySymbol}{displayPrice}
                            </motion.span>
                          </AnimatePresence>
                          <span className={cn("text-sm", isHighlighted ? "text-white" : "text-[#78736f]")}>{plan.monthlyPrice === 0 ? "forever" : "per month"}</span>
                        </div>
                      )}
                    </div>
                    <p className={cn("mt-2 text-sm", isHighlighted ? "text-white" : "text-foreground")}>{plan.description}</p>
                    <Button
                      className={cn(
                        "relative z-10 mt-5 w-full rounded-lg font-semibold transition-all duration-300",
                        isHighlighted
                          ? "bg-white text-black hover:bg-white/90 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02]"
                          : "bg-background text-foreground border border-foreground hover:bg-muted"
                      )}
                      size="lg"
                      onClick={
                        plan.planKey === "free"
                          ? onBack
                          : plan.planKey === "starter" || plan.planKey === "business"
                          ? () => handlePaidCheckout(plan.planKey)
                          : undefined
                      }
                      disabled={plan.planKey === "free" || ((plan.planKey === "starter" || plan.planKey === "business") && loading)}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                  <div className={cn("mx-6 my-5 h-px", isHighlighted ? "bg-white/15" : "bg-border")} />
                  <div className="flex-1 px-6 pb-6">
                    <p className={cn("mb-4 text-sm", isHighlighted ? "text-white/50" : "text-muted-foreground")}>{plan.featuresLabel}</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className={cn("flex items-start gap-2.5 text-sm", isHighlighted ? "text-white" : "text-foreground")}>
                          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", isHighlighted ? "text-white" : "text-muted-foreground")} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );

              if (isHighlighted) {
                return (
                  <div key={plan.name} className="relative rounded-2xl p-[2px] h-full" style={{ background: "linear-gradient(135deg, hsla(270,80%,55%,1), hsla(330,80%,55%,1), hsla(25,95%,55%,1), hsla(190,80%,50%,1))", backgroundSize: "300% 300%", animation: "gradient-rotate 4s ease infinite" }}>
                    {card}
                  </div>
                );
              }
              return card;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
