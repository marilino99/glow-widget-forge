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
        <div className="flex-1 text-left">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6"
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
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
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
            className="mt-10 flex items-center gap-5"
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
            <motion.div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-36 h-20 rounded-full bg-[hsla(310,75%,55%,0.35)] blur-[30px]"
              animate={{ opacity: [0.3, 0.5, 0.3], scaleX: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-20 rounded-full bg-[hsla(260,70%,50%,0.35)] blur-[30px]"
              animate={{ opacity: [0.3, 0.5, 0.3], scaleX: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
            <motion.div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-20 h-36 rounded-full bg-[hsla(220,75%,55%,0.35)] blur-[30px]"
              animate={{ opacity: [0.3, 0.5, 0.3], scaleY: [1, 1.1, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
            <motion.div
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-20 h-36 rounded-full bg-[hsla(0,80%,55%,0.35)] blur-[30px]"
              animate={{ opacity: [0.3, 0.5, 0.3], scaleY: [1, 1.1, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
          </div>
          {/* Widget screenshot */}
          <img 
            src={widgetPreview} 
            alt="Jetwidget widget preview showing chat, FAQ and contact features" 
            className="relative z-10 w-full h-full object-contain rounded-2xl border border-border/60 shadow-2xl shadow-primary/10"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
