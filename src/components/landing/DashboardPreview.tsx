import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Layer 1: Dark violet base — full width, fading down */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #1a0f3c 0%, transparent 100%)",
        }}
      />
      {/* Layer 2: Left purple glow blob */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-[750px] w-[50%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 120% 90% at 15% 25%, #7b5cff 0%, #5a3fd4 30%, transparent 75%)",
          filter: "blur(80px)",
          opacity: 0.45,
        }}
      />
      {/* Layer 3: Right purple glow blob */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-[750px] w-[50%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 120% 90% at 85% 25%, #7b5cff 0%, #5a3fd4 30%, transparent 75%)",
          filter: "blur(80px)",
          opacity: 0.45,
        }}
      />
      {/* Layer 4: Center bright fade — creates the light "window" in the middle */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[150px] h-[700px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 38%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.4) 50%, transparent 75%)",
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
