import { Layers, BarChart3, MessageSquare, Globe } from "lucide-react";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";
import widjetLogoNavbar from "@/assets/widjet-logo-navbar.png";
import { useLandingLang, LandingLang } from "@/contexts/LandingLanguageContext";

const langLabels: Record<LandingLang, string> = {
  en: "EN",
  it: "IT",
  de: "DE",
};

const Navbar = () => {
  const { t, lang, setLang } = useLandingLang();

  const navData = {
    logo: {
      url: "#",
      src: widjetLogoNavbar,
      alt: "Widjet logo",
      title: "",
    },
    menu: [
      { title: t("nav.home"), url: "#" },
      {
        title: t("nav.features"),
        url: "#features",
        items: [
          {
            title: t("nav.widgetBuilder"),
            description: t("nav.widgetBuilderDesc"),
            icon: <Layers className="size-5 shrink-0 text-primary" />,
            url: "#features",
          },
          {
            title: t("nav.liveChat"),
            description: t("nav.liveChatDesc"),
            icon: <MessageSquare className="size-5 shrink-0 text-primary" />,
            url: "#features",
          },
          {
            title: t("nav.analytics"),
            description: t("nav.analyticsDesc"),
            icon: <BarChart3 className="size-5 shrink-0 text-primary" />,
            url: "#features",
          },
        ],
      },
      { title: t("nav.dashboard"), url: "#dashboard" },
      { title: t("nav.pricing"), url: "#pricing" },
    ],
    mobileExtraLinks: [
      { name: t("nav.blog"), url: "#" },
      { name: t("nav.contact"), url: "#" },
      { name: t("nav.privacy"), url: "/privacy" },
      { name: t("nav.terms"), url: "/terms" },
    ],
    auth: {
      login: { text: t("nav.login"), url: "/login" },
      signup: { text: t("nav.signup"), url: "/signup" },
    },
  };

  return (
    <div className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="relative">
        <Navbar1 {...navData} />
        {/* Language switcher */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1" style={{ right: '280px' }}>
          {(["en", "it", "de"] as LandingLang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
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
    </div>
  );
};

export default Navbar;
