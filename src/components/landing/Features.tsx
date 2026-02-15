import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import featureProductCards from "@/assets/feature-product-cards.png";

const features = [
  {
    number: 1,
    title: "Drag & Drop Builder",
    description:
      "Create widgets visually with our intuitive builder. No code needed — just drag, drop, and publish. Customize every detail in real-time with instant preview.",
    mockup: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Components</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-white text-xs">+</div>
          </div>
          <div className="space-y-2.5">
            {["Chat Widget", "Contact Form", "Survey"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
                <div className="h-4 w-4 rounded bg-primary/20" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Preview</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Live</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: "Real-time Analytics & Insights",
    description:
      "Track conversations, response times, and visitor engagement with detailed dashboards. Automated notifications and intelligent scheduling help you stay on top of every metric.",
    mockup: (
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Deadlines</span>
            <span className="rounded border border-gray-200 px-2 py-0.5 text-[10px] text-gray-500">May 2</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Campaign Launch", sub: "Tomorrow", color: "bg-purple-400" },
              { label: "Report Due", sub: "In 2 days", color: "bg-blue-400" },
              { label: "Review Meeting", sub: "Tuesday, May 16", color: "bg-green-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                <div className={`h-4 w-4 shrink-0 rounded ${item.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 3,
    title: "Reports & Data Always Ready",
    description:
      "View real-time engagement data and costs, with monthly reports always up to date. Reduce dependency on external tools, eliminating errors and wasted time.",
    mockup: (
      <div className="flex items-center justify-center">
        <img
          src={featureProductCards}
          alt="Product cards carousel with stainless steel bottle and promotional cards"
          className="w-full max-w-sm rounded-xl"
        />
      </div>
    ),
  },
];

const Features = () => {
  return (
    <section id="features" className="relative px-6 py-24 bg-[#110c29] text-white overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="w-[90%] h-[120%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-50 blur-[100px]" />
          </div>
          <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-5xl">
            Everything you need,
            <br />
            <span className="text-white/50">nothing you don't</span>
          </h2>
        </motion.div>

        {/* Feature rows */}
        <div className="mt-20 space-y-24">
          {features.map((feature, i) => {
            const isReversed = i % 2 !== 0;

            return (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`grid items-center gap-12 md:grid-cols-2 ${isReversed ? "md:direction-rtl" : ""}`}
              >
                {/* Image / Mockup */}
                <div className={`group relative rounded-2xl ${isReversed ? "md:order-2" : ""}`}>
                  <GlowingEffect
                    spread={40}
                    glow
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={2}
                  />
                  <div className="relative rounded-2xl bg-[hsl(0,0%,10%)] border border-white/10 p-6">
                    {feature.mockup}
                  </div>
                </div>

                {/* Text */}
                <div className={isReversed ? "md:order-1" : ""}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                    {feature.number}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold text-white md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-md">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] translate-y-1/2" />
      </div>
    </section>
  );
};

export default Features;
