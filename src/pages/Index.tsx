import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LandingLanguageProvider } from "@/contexts/LandingLanguageContext";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { Logos3 } from "@/components/ui/logos3";
import Features from "@/components/landing/Features";
import DashboardPreview from "@/components/landing/DashboardPreview";
import PlatformIntegrations from "@/components/landing/PlatformIntegrations";
import Pricing from "@/components/landing/Pricing";
import FAQs from "@/components/landing/FAQs";
import Footer from "@/components/landing/Footer";
import { useLandingLang } from "@/contexts/LandingLanguageContext";

const LandingContent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLandingLang();

  // Load Widjet on the landing page only for non-authenticated visitors
  useEffect(() => {
    if (user) return; // Don't load widget for logged-in users (they get redirected)

    (window as any).__wj = (window as any).__wj || {};
    (window as any).__wj.widgetId = "3274cacf-079b-4985-885f-58425ea23bdb";
    (window as any).__wj.product_name = "widjet";
    const f = document.getElementsByTagName("script")[0];
    const j = document.createElement("script");
    j.async = true;
    j.src = "https://jqvcafbrccpmygiihyry.supabase.co/functions/v1/widget-loader";
    f.parentNode?.insertBefore(j, f);

    return () => {
      // Cleanup: remove widget DOM and reset flag when leaving landing
      const root = document.getElementById("wj-root");
      if (root) root.remove();
      (window as any).__wj_loaded = false;
      j.remove();
    };
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;

    const checkUserStatus = async () => {
      const { data } = await supabase
        .from("widget_configurations")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (data && data.length > 0) {
        navigate("/builder", { replace: true });
      } else {
        navigate("/builder?onboarding=true", { replace: true });
      }
    };

    checkUserStatus();
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Logos3
          heading={t("logos.heading")}
          logos={[
            { id: "veltro", description: "Veltro", image: "", className: "h-6 w-auto opacity-70" },
            { id: "novabit", description: "Novabit", image: "", className: "h-6 w-auto opacity-70" },
            { id: "pureflow", description: "Pureflow", image: "", className: "h-6 w-auto opacity-70" },
            { id: "zendexa", description: "Zendexa", image: "", className: "h-6 w-auto opacity-70" },
            { id: "crestline", description: "Crestline", image: "", className: "h-6 w-auto opacity-70" },
            { id: "orbiqo", description: "Orbiqo", image: "", className: "h-6 w-auto opacity-70" },
            { id: "luminar", description: "Luminar", image: "", className: "h-6 w-auto opacity-70" },
            { id: "helix", description: "Helix Studio", image: "", className: "h-6 w-auto opacity-70" },
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

const Index = () => {
  return (
    <LandingLanguageProvider>
      <LandingContent />
    </LandingLanguageProvider>
  );
};

export default Index;
