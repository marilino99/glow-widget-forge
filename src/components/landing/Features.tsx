import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import featureProductCards from "@/assets/feature-product-cards.png";
import featureFaq from "@/assets/feature-faq.png";
import featureBuilder from "@/assets/feature-builder.gif";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const Features = () => {
  const { t } = useLandingLang();

  const features = [
    {
      number: 1,
      title: t("features.1.title"),
      description: t("features.1.desc"),
      mockup: (
        <div className="flex items-center justify-center">
          <img src={featureBuilder} alt="Widget builder drag and drop interface demo" className="w-full max-w-sm rounded-xl" />
        </div>
      ),
    },
    {
      number: 2,
      title: t("features.2.title"),
      description: t("features.2.desc"),
      mockup: (
        <div className="flex items-center justify-center">
          <img src={featureFaq} alt="FAQ accordion widget" className="w-full max-w-sm rounded-xl" />
        </div>
      ),
    },
    {
      number: 3,
      title: t("features.3.title"),
      description: t("features.3.desc"),
      mockup: (
        <div className="flex items-center justify-center">
          <img src={featureProductCards} alt="Product cards carousel" className="w-full max-w-sm rounded-xl" />
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="relative px-6 py-24 bg-[#110c29] text-white overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <div className="w-[90%] h-[120%] rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-50 blur-[100px]" />
          </div>
          <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t("features.title1")}
            <br />
            <span className="text-white/50">{t("features.title2")}</span>
          </h2>
        </motion.div>

        <div className="mt-20 space-y-24">
          {features.map((feature, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <motion.div key={feature.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.1 }} className={`grid items-center gap-12 md:grid-cols-2 ${isReversed ? "md:direction-rtl" : ""}`}>
                <div className={`group relative rounded-2xl ${isReversed ? "md:order-2" : ""}`}>
                  <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                  <div className="relative rounded-2xl bg-[hsl(0,0%,10%)] border border-white/10 p-6">
                    {feature.mockup}
                  </div>
                </div>
                <div className={isReversed ? "md:order-1" : ""}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                    {feature.number}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold text-white md:text-3xl">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-md">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none -z-0" aria-hidden>
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[hsl(270,80%,50%)] via-[hsl(310,70%,50%)] to-[hsl(25,95%,55%)] opacity-40 blur-[120px] translate-y-1/2" />
      </div>
    </section>
  );
};

export default Features;
