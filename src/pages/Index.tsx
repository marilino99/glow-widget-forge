import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { Logos3 } from "@/components/ui/logos3";
import Features from "@/components/landing/Features";
import DashboardPreview from "@/components/landing/DashboardPreview";
import PlatformIntegrations from "@/components/landing/PlatformIntegrations";
import Pricing from "@/components/landing/Pricing";
import FAQs from "@/components/landing/FAQs";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Logos3
          heading="Trusted by 2,000+ businesses worldwide"
          logos={[
            { id: "google", description: "Google", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg", className: "h-6 w-auto opacity-60" },
            { id: "slack", description: "Slack", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/slack.svg", className: "h-6 w-auto opacity-60" },
            { id: "stripe", description: "Stripe", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stripe.svg", className: "h-6 w-auto opacity-60" },
            { id: "shopify", description: "Shopify", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopify.svg", className: "h-6 w-auto opacity-60" },
            { id: "spotify", description: "Spotify", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg", className: "h-6 w-auto opacity-60" },
            { id: "notion", description: "Notion", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/notion.svg", className: "h-6 w-auto opacity-60" },
            { id: "dropbox", description: "Dropbox", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dropbox.svg", className: "h-6 w-auto opacity-60" },
            { id: "airbnb", description: "Airbnb", image: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/airbnb.svg", className: "h-6 w-auto opacity-60" },
          ]}
        />
        <Features />
        <DashboardPreview />
        <PlatformIntegrations />
        <Pricing />
        <FAQs />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
