import { motion } from "framer-motion";
import dashboardImg from "@/assets/dashboard-preview.png";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 py-24 bg-[#110c29] text-white overflow-hidden">
      {/* Top glow for continuity with Features section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] -translate-y-1/2" />
      </div>
      <div className="mx-auto max-w-6xl">
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
          className="relative mt-16"
        >
          {/* Glow blob behind image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(250,85%,65%)] opacity-40 blur-[100px]" />
          </div>

          {/* Animated gradient border wrapper */}
          <div className="relative hero-image-border rounded-2xl p-[2px] transition-transform duration-300 hover:scale-[1.02]">
            <img
              src={dashboardImg}
              alt="Jetwidget dashboard showing widget builder with live preview and chat widget"
              className="w-full rounded-2xl"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
