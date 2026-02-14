import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Layer 1: Dark violet base — matches Features bg, long gradual fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #110c29 0%, #110c29 8%, #15102e 20%, #1a1335 35%, transparent 100%)",
        }}
      />
      {/* Layer 2: Left purple glow blob */}
      <div
        className="pointer-events-none absolute top-[100px] left-0 h-[600px] w-[45%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 110% 80% at 20% 30%, #7b5cff 0%, #5a3fd4 25%, transparent 70%)",
          filter: "blur(90px)",
          opacity: 0.35,
        }}
      />
      {/* Layer 3: Right purple glow blob */}
      <div
        className="pointer-events-none absolute top-[100px] right-0 h-[600px] w-[45%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 110% 80% at 80% 30%, #7b5cff 0%, #5a3fd4 25%, transparent 70%)",
          filter: "blur(90px)",
          opacity: 0.35,
        }}
      />
      {/* Layer 4: Center bright fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[200px] h-[700px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.35) 50%, transparent 75%)",
          filter: "blur(35px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-white/70">Dashboard</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-5xl">
            One place for everything
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Manage all your widgets, conversations, and analytics from a single intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <img
            src={dashboardImg}
            alt="Jetwidget dashboard showing widget builder with live preview and chat widget"
            className="w-full rounded-2xl border border-border/60 shadow-2xl shadow-primary/5"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
