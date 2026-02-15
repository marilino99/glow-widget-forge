import { Button } from "@/components/ui/button";
import { Check, CircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    subtitle: "forever",
    description: "Perfect for trying things out",
    cta: "Get Started",
    highlighted: false,
    featuresLabel: "KEY FEATURES:",
    features: ["1 widget", "Customizable theme & colors", "Contact card + WhatsApp integration", "FAQ section", "24/7 support (limited time)"],
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 24,
    subtitle: "Per widget/month, billed monthly",
    description: "For growing businesses",
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Popular",
    featuresLabel: "EVERYTHING IN FREE +",
    features: [
      "Unlimited widgets",
      "Unlimited conversations",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Team collaboration (coming soon)",
    ],
  },
  {
    name: "Business",
    monthlyPrice: 99,
    annualPrice: 79,
    subtitle: "Per widget/month, billed monthly",
    description: "For scaling teams",
    cta: "Contact Sales",
    highlighted: false,
    featuresLabel: "EVERYTHING IN PRO +",
    features: [
      "Unlimited conversations",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "SSO & advanced security",
      "White labeling",
    ],
  },
];

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Simple, fair{" "}
            <span className="text-muted-foreground/60">pricing</span>.
          </h2>
        </motion.div>

        {/* Subbar: guarantee + toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary" />
            <span>100% Money-back Guarantee</span>
          </div>

          <div className="flex items-center gap-3">
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-medium text-primary"
              >
                Save up to 20% with yearly
              </motion.span>
            )}
            <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  !isAnnual
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {!isAnnual && (
                  <motion.span
                    layoutId="pricing-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Monthly</span>
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                  isAnnual
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isAnnual && (
                  <motion.span
                    layoutId="pricing-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Yearly</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan, i) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isHighlighted = plan.highlighted;

            const card = (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border overflow-hidden",
                  isHighlighted
                    ? "bg-[hsl(220,20%,6%)] text-white border-transparent"
                    : "border-border"
                )}
              >
                {isHighlighted && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute -top-1/4 -left-1/4 h-[80%] w-[60%] rounded-full opacity-30 blur-[80px]"
                      style={{ background: "hsl(270,70%,50%)" }}
                      animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[70%] w-[55%] rounded-full opacity-25 blur-[80px]"
                      style={{ background: "hsl(25,95%,55%)" }}
                      animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                    <motion.div
                      className="pointer-events-none absolute top-1/3 left-1/3 h-[50%] w-[40%] rounded-full opacity-20 blur-[70px]"
                      style={{ background: "hsl(330,80%,55%)" }}
                      animate={{ x: [0, -30, 30, 0], y: [0, 20, -20, 0] }}
                      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    />
                  </>
                )}
                {/* Top section: name, price, CTA */}
                <div className="flex flex-col p-6 pb-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-xl font-bold", isHighlighted ? "text-white" : "text-foreground")}>
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Fixed-height price block to align buttons */}
                  <div className="h-[72px] flex flex-col justify-center">
                    <div className="flex items-baseline gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={price}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className={cn("text-4xl font-bold tracking-tight", isHighlighted ? "text-white" : "text-foreground")}
                        >
                          ${price}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <p className={cn("mt-1 text-xs", isHighlighted ? "text-white/50" : "text-muted-foreground")}>
                      {plan.monthlyPrice === 0
                        ? "forever"
                        : isAnnual
                          ? "Billed yearly"
                          : "Billed monthly"}
                    </p>
                  </div>

                  <Button
                    className={cn(
                      "mt-5 w-full rounded-lg",
                      isHighlighted
                        ? "bg-white text-black hover:bg-white/90 border-0"
                        : "bg-foreground text-background hover:bg-foreground/90 border-0"
                    )}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>

                {/* Divider */}
                <div className={cn("mx-6 my-5 h-px", isHighlighted ? "bg-white/15" : "bg-border")} />

                {/* Features */}
                <div className="flex-1 px-6 pb-6">
                  <p className={cn("mb-4 text-[10px] font-bold uppercase tracking-[0.15em]", isHighlighted ? "text-white/50" : "text-muted-foreground")}>
                    {plan.featuresLabel}
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={cn("flex items-start gap-2.5 text-sm", isHighlighted ? "text-white" : "text-foreground")}
                      >
                        {isHighlighted ? (
                          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 fill-white text-[hsl(0,0%,15%)]" />
                        ) : (
                          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 fill-muted-foreground/30 text-background" />
                        )}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );

            if (isHighlighted) {
              return (
                <div key={plan.name} className="relative rounded-2xl p-[2px]" style={{
                  background: "linear-gradient(135deg, hsla(270,80%,55%,1), hsla(330,80%,55%,1), hsla(25,95%,55%,1), hsla(190,80%,50%,1))",
                  backgroundSize: "300% 300%",
                  animation: "gradient-rotate 4s ease infinite",
                }}>
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
