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
            className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem] bg-clip-text text-transparent hero-gradient-text"
          >
            Widgets that turn
            <br />
            visitors into customers
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Create no-code website widgets for live chat, FAQs & sales.
            Customize everything, then add to any site with one line of code.
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
              className="absolute top-0 left-0 w-20 h-20 rounded-full bg-primary/30 blur-[30px]"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.45, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/25 blur-[30px]"
              animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-primary/25 blur-[30px]"
              animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.38, 0.25] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-20 h-20 rounded-full bg-primary/25 blur-[30px]"
              animate={{ scale: [1.05, 1, 1.05], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>

          {/* Liquid glass container */}
          <div className="relative z-10 h-full">
            {/* Widget screenshot with liquid glass */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.15] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_60px_-15px_rgba(0,0,0,0.3)]">
              {/* Inner glass highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute -top-1/2 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]" />
              </div>
              <img 
                src={widgetPreview} 
                alt="Jetwidget widget preview showing chat, FAQ and contact features" 
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
