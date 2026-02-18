import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import widjetLogo from "@/assets/widjet-logo-navbar.png";
import { useLandingLang, LandingLang } from "@/contexts/LandingLanguageContext";

const langLabels: Record<LandingLang, string> = { en: "EN", it: "IT", de: "DE", fr: "FR" };

const SocialIcon = ({ children, href = "#" }: { children: React.ReactNode; href?: string }) => (
  <a href={href} className="text-muted-foreground transition-colors hover:text-foreground">
    {children}
  </a>
);

const Footer = () => {
  const { t, lang, setLang } = useLandingLang();

  const footerColumns = [
    {
      title: t("footer.product"),
      links: [
        { name: t("footer.widgetBuilder"), href: "#features" },
        { name: t("footer.liveChat"), href: "#features" },
        { name: t("footer.analytics"), href: "#features" },
        { name: t("footer.integrations"), href: "#" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { name: t("footer.helpCenter"), href: "#" },
        { name: t("footer.pricing"), href: "#pricing" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { name: t("footer.security"), href: "#" },
        { name: t("footer.termsPrivacy"), href: "#" },
        { name: t("footer.contact"), href: "mailto:support@getwidjet.com" },
      ],
    },
    {
      title: t("footer.widjetFor"),
      links: [
        { name: t("footer.ecommerce"), href: "#" },
        { name: t("footer.smallBusiness"), href: "#" },
        { name: t("footer.agencies"), href: "#" },
      ],
    },
  ];

  return (
    <>
      {/* CTA Banner */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl">
          <div className="relative rounded-3xl px-8 py-24 overflow-hidden bg-[hsl(220,20%,6%)]">
            <motion.div className="pointer-events-none absolute -top-1/4 -left-1/4 h-[80%] w-[60%] rounded-full opacity-30 blur-[100px]" style={{ background: "hsl(270,70%,50%)" }} animate={{ x: [0, 80, 0], y: [0, 60, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[70%] w-[55%] rounded-full opacity-25 blur-[100px]" style={{ background: "hsl(25,95%,55%)" }} animate={{ x: [0, -70, 0], y: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
            <motion.div className="pointer-events-none absolute top-1/3 left-1/3 h-[50%] w-[40%] rounded-full opacity-20 blur-[90px]" style={{ background: "hsl(330,80%,55%)" }} animate={{ x: [0, -40, 40, 0], y: [0, 30, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
            <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative z-10 text-center">
              <h2 className="text-4xl font-bold text-white md:text-6xl">
                {t("footer.ctaTitle1")}
                <br />
                {t("footer.ctaTitle2")}
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base text-white/70">{t("footer.ctaDesc")}</p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-12 gap-2 rounded-full border border-white bg-white px-8 text-base font-semibold text-[hsl(270,70%,40%)] hover:bg-white/90" asChild>
                  <a href="/signup">
                    {t("footer.ctaCta")}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/40">{t("footer.ctaNote")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-6 lg:gap-16">
          <div className="col-span-2 flex flex-col gap-6">
            <img src={widjetLogo} alt="Widjet" className="h-auto self-start -ml-5" style={{ width: '180px' }} />
            <div className="flex items-center gap-4">
              <SocialIcon><svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm5.25-2a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"/></svg></SocialIcon>
              <SocialIcon><svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg></SocialIcon>
              <SocialIcon><svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM6.838 20.452H3.837V9h3.001v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg></SocialIcon>
              <SocialIcon><svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg></SocialIcon>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{t("footer.madeInEu")}</p>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Widjet</p>
            </div>
            {/* Language switcher */}
            <div className="flex items-center gap-1">
              {(["en", "it", "de", "fr"] as LandingLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {langLabels[l]}
                </button>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              {col.links.map((link) => (
                <a key={link.name} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.name}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </>
  );
};

export default Footer;
