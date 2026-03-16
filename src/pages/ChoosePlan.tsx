import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Boxes } from "lucide-react";

const detectCurrency = (): "EUR" | "USD" => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("America/")) return "USD";
  } catch {}
  return "EUR";
};

const ChoosePlan = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [currency] = useState<"EUR" | "USD">(detectCurrency);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, isLoading: subLoading, refreshSubscription } = useSubscription();
  const { toast } = useToast();

  const currencySymbol = currency === "EUR" ? "€" : "$";

  // If already subscribed, go to builder
  useEffect(() => {
    if (!subLoading && plan !== "free") {
      navigate("/builder", { replace: true });
    }
  }, [subLoading, plan, navigate]);

  // Poll for subscription after checkout
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSubscription();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSubscription]);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 19,
      annualPrice: 16,
      monthlyPriceEur: 18,
      annualPriceEur: 15,
      description: "Everything you need to get started with your AI widget.",
      features: ["3 AI-powered widgets", "500 AI responses/month", "Lead capture & contacts", "FAQ & product carousel", "Email support", "Custom branding"],
      planKey: "starter",
      highlighted: false,
    },
    {
      name: "Business",
      monthlyPrice: 49,
      annualPrice: 39,
      monthlyPriceEur: 48,
      annualPriceEur: 38,
      description: "For growing businesses that need more power and integrations.",
      features: ["10 AI-powered widgets", "10,000 AI responses/month", "All Starter features", "Shopify & Calendly integrations", "Remove branding", "Priority support"],
      planKey: "business",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      monthlyPrice: 99,
      annualPrice: 79,
      monthlyPriceEur: 0,
      annualPriceEur: 0,
      description: "Custom solutions for large organizations.",
      features: ["Unlimited widgets", "Unlimited AI responses", "All Business features", "Custom integrations", "Dedicated account manager", "SLA guarantee"],
      planKey: "enterprise",
      highlighted: false,
    },
  ];

  const handleCheckout = async (planKey: string) => {
    if (planKey === "enterprise") {
      window.open("mailto:hello@widjet.io?subject=Enterprise Plan", "_blank");
      return;
    }
    setLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { returnUrl: window.location.origin, billingInterval: isAnnual ? "year" : "month", plan: planKey, currency },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  if (subLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto max-w-4xl w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold text-foreground">Widjet</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Choose your plan to get started
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a plan to unlock your AI-powered widgets.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-full bg-muted p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn("relative rounded-full px-5 py-1.5 text-sm font-bold transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {!isAnnual && <motion.span layoutId="plan-pill" className="absolute inset-0 rounded-full bg-background shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn("relative rounded-full px-5 py-1.5 text-sm font-bold transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {isAnnual && <motion.span layoutId="plan-pill" className="absolute inset-0 rounded-full bg-background shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
              <span className="relative z-10">Yearly (save ~20%)</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((p, i) => {
            const price = currency === "EUR"
              ? (isAnnual ? p.annualPriceEur : p.monthlyPriceEur)
              : (isAnnual ? p.annualPrice : p.monthlyPrice);
            const isHighlighted = p.highlighted;

            const card = (
              <motion.div
                key={p.name}
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
                  </>
                )}
                <div className="flex flex-col p-6 pb-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-xl font-bold", isHighlighted ? "text-white" : "text-foreground")}>{p.name}</h3>
                    {p.badge && <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{p.badge}</span>}
                  </div>
                  <div className="h-[72px] flex flex-col justify-center">
                    {p.planKey === "enterprise" ? (
                      <span className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}>Let's talk</span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <AnimatePresence mode="wait">
                          <motion.span key={`${price}-${currency}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}>
                            {currencySymbol}{price}
                          </motion.span>
                        </AnimatePresence>
                        <span className={cn("text-sm", isHighlighted ? "text-white" : "text-foreground")}>per month</span>
                      </div>
                    )}
                  </div>
                  <p className={cn("mt-2 text-sm", isHighlighted ? "text-white/70" : "text-muted-foreground")}>{p.description}</p>
                  <Button
                    className={cn(
                      "relative z-10 mt-5 w-full rounded-lg font-semibold transition-all duration-300",
                      isHighlighted
                        ? "bg-white text-black hover:bg-white/90 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02]"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    )}
                    size="lg"
                    onClick={() => handleCheckout(p.planKey)}
                    disabled={loading === p.planKey}
                  >
                    {loading === p.planKey ? <Loader2 className="h-4 w-4 animate-spin" /> : p.planKey === "enterprise" ? "Contact Us" : "Get Started"}
                  </Button>
                </div>
                <div className={cn("mx-6 my-5 h-px", isHighlighted ? "bg-white/15" : "bg-border")} />
                <div className="flex-1 px-6 pb-6">
                  <ul className="space-y-2.5">
                    {p.features.map((feature) => (
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
                <div key={p.name} className="relative rounded-2xl p-[2px] h-full" style={{ background: "linear-gradient(135deg, hsla(270,80%,55%,1), hsla(330,80%,55%,1), hsla(25,95%,55%,1), hsla(190,80%,50%,1))", backgroundSize: "300% 300%", animation: "gradient-rotate 4s ease infinite" }}>
                  {card}
                </div>
              );
            }
            return card;
          })}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlan;
