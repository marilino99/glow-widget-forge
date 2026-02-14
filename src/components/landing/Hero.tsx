import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import widgetPreview from "@/assets/widget-preview-hero.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-10 md:pb-32 md:pt-16">
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
        {/* Left side — text content */}
        <div className="flex-1 flex flex-col justify-center text-left">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-4"
          >
            <span className="wow-pill">
              <Sparkles className="h-3.5 w-3.5" />
              Now with AI-powered responses
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            Widgets that turn
            <br />
            visitors into{" "}
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              customers
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Build beautiful support & sales widgets. Customize every detail.
            Publish to any website with one line of code.
          </motion.p>

          {/* CTA */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex items-center gap-5"
          >
            <Button size="lg" className="h-14 gap-2 rounded-full px-10 text-base font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:bg-primary hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40" asChild>
              <a href="/signup">
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <span className="text-sm leading-tight text-muted-foreground">
              Free forever.<br />No credit card.
            </span>
          </motion.div>
        </div>

        {/* Right side — product screenshot placeholder */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative flex-1 max-w-md lg:max-w-lg flex flex-col"
        >
          {/* Animated glow border */}
          <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
            <motion.div
              className="absolute -top-2 -left-2 w-28 h-28 rounded-full bg-[hsla(270,80%,55%,0.5)] blur-[35px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -top-2 -right-2 w-28 h-28 rounded-full bg-[hsla(25,95%,55%,0.5)] blur-[35px]"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.65, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-2 -left-2 w-28 h-28 rounded-full bg-[hsla(190,80%,50%,0.45)] blur-[35px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute -bottom-2 -right-2 w-28 h-28 rounded-full bg-[hsla(330,80%,55%,0.5)] blur-[35px]"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.45, 0.65, 0.45] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>

          {/* Liquid glass container */}
          <div className="relative z-10 h-full rounded-3xl border border-white/[0.15] bg-white/[0.06] p-3 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_60px_-15px_rgba(0,0,0,0.3)]">
            {/* Inner glass highlight */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
              <div className="absolute -top-1/2 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
            </div>
            {/* Widget screenshot */}
            <img 
              src={widgetPreview} 
              alt="Jetwidget widget preview showing chat, FAQ and contact features" 
              className="relative w-full h-full object-contain rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
