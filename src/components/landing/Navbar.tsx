import { Layers, BarChart3, MessageSquare } from "lucide-react";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";
import widjetLogo from "@/assets/widjet-logo.png";

const navData = {
  logo: {
    url: "#",
    src: widjetLogo,
    alt: "Widjet logo",
    title: "widjet.",
  },
  menu: [
    { title: "Home", url: "#" },
    {
      title: "Features",
      url: "#features",
      items: [
        {
          title: "Widget Builder",
          description: "Drag-and-drop interface to create widgets in minutes",
          icon: <Layers className="size-5 shrink-0 text-primary" />,
          url: "#features",
        },
        {
          title: "Live Chat",
          description: "Engage visitors with real-time conversations",
          icon: <MessageSquare className="size-5 shrink-0 text-primary" />,
          url: "#features",
        },
        {
          title: "Analytics",
          description: "Track engagement and conversion rates in real time",
          icon: <BarChart3 className="size-5 shrink-0 text-primary" />,
          url: "#features",
        },
      ],
    },
    { title: "Dashboard", url: "#dashboard" },
    { title: "Pricing", url: "#pricing" },
  ],
  mobileExtraLinks: [
    { name: "Blog", url: "#" },
    { name: "Contact", url: "#" },
    { name: "Privacy", url: "/privacy" },
    { name: "Terms", url: "/terms" },
  ],
  auth: {
    login: { text: "Log in", url: "/login" },
    signup: { text: "Get Started", url: "/signup" },
  },
};

const Navbar = () => {
  return (
    <div className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <Navbar1 {...navData} />
    </div>
  );
};

export default Navbar;
