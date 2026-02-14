import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 pt-44 pb-24 overflow-hidden">
      {/* Layer 1: Solid dark base matching Features */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        aria-hidden
        style={{
          background: "#110c29",
        }}
      />
      {/* Layer 2: Dark-to-transparent vertical fade below the solid block */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[350px] h-[500px]"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, #110c29 0%, transparent 100%)",
        }}
      />
      {/* Layer 3: Purple glow — left side */}
      <div
        className="pointer-events-none absolute top-[80px] left-0 h-[700px] w-[50%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 80% 90% at 5% 30%, #6b3fa0 0%, #4a2d80 30%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.9,
        }}
      />
      {/* Layer 4: Purple glow — right side */}
      <div
        className="pointer-events-none absolute top-[80px] right-0 h-[700px] w-[50%]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 80% 90% at 95% 30%, #6b3fa0 0%, #4a2d80 30%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.9,
        }}
      />
      {/* Layer 5: Large white center wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[180px] h-[750px]"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 90% 75% at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.97) 15%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.15) 65%, transparent 80%)",
          filter: "blur(15px)",
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
