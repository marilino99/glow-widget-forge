import { Button } from "@/components/ui/button";
import { Check, CircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLandingLang();

  const plans = [
    {
      name: t("pricing.free.name"),
      monthlyPrice: 0,
      annualPrice: 0,
      description: t("pricing.free.desc"),
      cta: t("pricing.free.cta"),
      highlighted: false,
      featuresLabel: t("pricing.free.featuresLabel"),
      features: [t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3"), t("pricing.free.f4"), t("pricing.free.f5"), t("pricing.free.f6")],
    },
    {
      name: t("pricing.pro.name"),
      monthlyPrice: 19,
      annualPrice: 16,
      description: t("pricing.pro.desc"),
      cta: t("pricing.pro.cta"),
      highlighted: true,
      badge: t("pricing.pro.badge"),
      featuresLabel: t("pricing.pro.featuresLabel"),
      features: [t("pricing.pro.f1"), t("pricing.pro.f2"), t("pricing.pro.f3"), t("pricing.pro.f4"), t("pricing.pro.f5"), t("pricing.pro.f6"), t("pricing.pro.f7"), t("pricing.pro.f8")],
    },
    {
      name: t("pricing.business.name"),
      monthlyPrice: 99,
      annualPrice: 79,
      description: t("pricing.business.desc"),
      cta: t("pricing.business.cta"),
      highlighted: false,
      featuresLabel: t("pricing.business.featuresLabel"),
      features: [t("pricing.business.f1"), t("pricing.business.f2"), t("pricing.business.f3"), t("pricing.business.f4"), t("pricing.business.f5"), t("pricing.business.f6")],
    },
  ];

  const handleProCheckout = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signup");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { returnUrl: window.location.origin, billingInterval: isAnnual ? "year" : "month" },
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
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            {t("pricing.title")}{" "}
            <span className="text-muted-foreground/60">{t("pricing.titleFaded")}</span>.
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 }} className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary" />
            <span>{t("pricing.guarantee")}</span>
          </div>
          <div className="flex items-center gap-3">
            {isAnnual && (
              <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-primary">
                {t("pricing.saveYearly")}
              </motion.span>
            )}
            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1">
              <button onClick={() => setIsAnnual(false)} className={cn("relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors", !isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {!isAnnual && <motion.span layoutId="pricing-pill" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                <span className="relative z-10">{t("pricing.monthly")}</span>
              </button>
              <button onClick={() => setIsAnnual(true)} className={cn("relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors", isAnnual ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {isAnnual && <motion.span layoutId="pricing-pill" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                <span className="relative z-10">{t("pricing.yearly")}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isHighlighted = plan.highlighted;

            const card = (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className={cn("relative flex flex-col rounded-2xl border overflow-hidden", isHighlighted ? "bg-[hsl(220,20%,6%)] text-white border-transparent" : "border-border")}>
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
                    {plan.badge && <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{plan.badge}</span>}
                  </div>
                  <div className="h-[72px] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span key={price} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}>
                          ${price}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <p className={cn("mt-1 text-xs", isHighlighted ? "text-white/50" : "text-muted-foreground")}>
                      {plan.monthlyPrice === 0 ? t("pricing.forever") : isAnnual ? t("pricing.billedYearly") : t("pricing.billedMonthly")}
                    </p>
                  </div>
                  <Button
                    className={cn("relative z-10 mt-5 w-full rounded-lg font-semibold transition-all duration-300", isHighlighted ? "bg-white text-black hover:bg-white/90 border-0 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-[1.02]" : plan.name === t("pricing.free.name") || plan.name === t("pricing.business.name") ? "bg-background text-foreground border border-foreground hover:bg-muted" : "bg-foreground text-background hover:bg-foreground/90 border-0")}
                    size="lg"
                    onClick={plan.name === t("pricing.free.name") ? () => navigate("/signup") : plan.name === t("pricing.pro.name") ? handleProCheckout : undefined}
                    disabled={plan.name === t("pricing.pro.name") && loading}
                  >
                    {plan.cta}
                  </Button>
                </div>
                <div className={cn("mx-6 my-5 h-px", isHighlighted ? "bg-white/15" : "bg-border")} />
                <div className="flex-1 px-6 pb-6">
                  <p className={cn("mb-4 text-[10px] font-bold uppercase tracking-[0.15em]", isHighlighted ? "text-white/50" : "text-muted-foreground")}>{plan.featuresLabel}</p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className={cn("flex items-start gap-2.5 text-sm", isHighlighted ? "text-white" : "text-foreground")}>
                        {isHighlighted ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 fill-white text-[hsl(0,0%,15%)]" /> : <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 fill-muted-foreground/30 text-background" />}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );

            if (isHighlighted) {
              return (
                <div key={plan.name} className="relative rounded-2xl p-[2px]" style={{ background: "linear-gradient(135deg, hsla(270,80%,55%,1), hsla(330,80%,55%,1), hsla(25,95%,55%,1), hsla(190,80%,50%,1))", backgroundSize: "300% 300%", animation: "gradient-rotate 4s ease infinite" }}>
                  {card}
                </div>
              );
            }
            return card;
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
