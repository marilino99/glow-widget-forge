import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <>
      {/* CTA Banner */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl">
          <div className="relative rounded-3xl px-8 py-24 overflow-hidden bg-[hsl(220,20%,6%)]">
            {/* Animated gradient blobs behind content */}
            <motion.div
              className="pointer-events-none absolute -top-1/4 -left-1/4 h-[80%] w-[60%] rounded-full opacity-30 blur-[100px]"
              style={{ background: "hsl(270,70%,50%)" }}
              animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[70%] w-[55%] rounded-full opacity-25 blur-[100px]"
              style={{ background: "hsl(25,95%,55%)" }}
              animate={{ x: [0, -70, 0], y: [0, -50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div
              className="pointer-events-none absolute top-1/3 left-1/3 h-[50%] w-[40%] rounded-full opacity-20 blur-[90px]"
              style={{ background: "hsl(330,80%,55%)" }}
              animate={{ x: [0, -40, 40, 0], y: [0, 30, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            {/* Noise/grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "128px 128px",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-center"
            >
              <h2 className="text-4xl font-bold text-white md:text-6xl">
                Ready to engage
                <br />
                your visitors?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base text-white/70">
                Join 2,000+ businesses already using Jetwidget to connect with their customers.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-full border border-white bg-white px-8 text-base font-semibold text-[hsl(270,70%,40%)] hover:bg-white/90"
                  asChild
                >
                  <a href="/signup">
                    Start for Free
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/30 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  Book a Demo
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/40">
                14 Days Free. No credit card required.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <span className="text-sm font-bold text-foreground">
            jetwidget<span className="text-primary">.</span>
          </span>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Contact", "Blog"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Jetwidget
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
