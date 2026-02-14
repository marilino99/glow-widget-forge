import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Layer 1: Solid dark base matching Features */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        aria-hidden
        style={{ background: "#110c29" }}
      />
      {/* Layer 2: Dark-to-transparent fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[200px] h-[400px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #110c29 0%, transparent 100%)",
        }}
      />
      {/* Layer 3: Aurora — dark violet streaks going to the sides */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[700px]"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 40% 60% at 10% 10%, #110c29 0%, transparent 100%),
            radial-gradient(ellipse 40% 60% at 90% 10%, #110c29 0%, transparent 100%)
          `,
          filter: "blur(40px)",
          opacity: 1,
        }}
      />
      {/* Layer 4: Aurora — medium violet transition */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[40px] h-[650px]"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 50% 55% at 15% 20%, #5b21b6 0%, transparent 100%),
            radial-gradient(ellipse 50% 55% at 85% 20%, #5b21b6 0%, transparent 100%)
          `,
          filter: "blur(60px)",
          opacity: 0.7,
        }}
      />
      {/* Layer 5: Aurora — light violet glow bridging to white */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[70px] h-[600px]"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 55% 50% at 22% 30%, #8b5cf6 0%, transparent 100%),
            radial-gradient(ellipse 55% 50% at 78% 30%, #8b5cf6 0%, transparent 100%)
          `,
          filter: "blur(70px)",
          opacity: 0.55,
        }}
      />
      {/* Layer 6: Central white wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[100px] h-[750px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 18%, rgba(255,255,255,0.9) 32%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 65%, transparent 80%)",
          filter: "blur(12px)",
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
