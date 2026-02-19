import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";
import widgetPreview from "@/assets/widget-preview-hero.png";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const Hero = () => {
  const { t } = useLandingLang();

  return (
    <section className="relative overflow-x-clip px-6 pb-24 pt-10 md:pb-32 md:pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] animate-pulse rounded-full bg-primary/[0.08] blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] animate-pulse rounded-full bg-primary/5 blur-[100px] [animation-delay:1s]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-12 md:flex-row md:items-stretch md:gap-16">
        <div className="flex-1 flex flex-col justify-center text-left">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-4">
            <span className="wow-pill">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </span>
          </motion.div>

          <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp} className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem] bg-clip-text text-transparent hero-gradient-text">
            {t("hero.title1")}
            <br />
            {t("hero.title2")}
          </motion.h1>

          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 flex items-center gap-5">
            <Button size="lg" className="h-14 gap-2 rounded-full px-10 text-base font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:bg-primary hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40" asChild>
              <a href="/signup">
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <span className="text-sm leading-tight text-muted-foreground">
              {t("hero.note1")}<br />{t("hero.note2")}
            </span>
          </motion.div>
        </div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="relative flex-1 max-w-md lg:max-w-lg flex flex-col overflow-visible">
          <div className="relative rounded-3xl overflow-hidden bg-background">
            <img src={widgetPreview} alt="Widjet widget preview showing chat, FAQ and contact features" className="w-full h-full object-cover block" />
          </div>
        </motion.div>
      </div>

      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-7xl flex justify-center mt-2">
        <button
          onClick={() => {
            const wjBtn = document.getElementById("wj-btn");
            if (wjBtn) wjBtn.click();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md hover:-translate-y-0.5"
        >
          <Eye className="h-4 w-4" />
          {t("hero.demo")}
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;
