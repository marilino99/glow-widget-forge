import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ArrowRight, Sparkles, Loader2, Check, Palette, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import widjetLogo from "@/assets/widjet-logo-navbar.png";

const STEP_LABELS = ["Welcome", "Website", "Branding"];

const statusMessages = [
  "Scanning website...",
  "Extracting colors...",
  "Detecting logo...",
  "Analyzing theme...",
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [brandResult, setBrandResult] = useState<{
    logo: string | null;
    color: string;
    theme: "light" | "dark";
  } | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Cycle status messages during extraction
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleExtract = async () => {
    if (!user) return;
    setStep(2);
    setLoading(true);
    setStatusIndex(0);
    setBrandResult(null);

    let formattedUrl = websiteUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let extractedLogo: string | null = null;
    let extractedColor = "blue";
    let extractedTheme: "light" | "dark" = "dark";

    try {
      const { data: brandingData, error: brandingError } = await supabase.functions.invoke("extract-branding", {
        body: { url: formattedUrl },
      });

      if (!brandingError && brandingData?.success) {
        extractedLogo = brandingData.logo || null;
        extractedColor = brandingData.widgetColor || "blue";
        extractedTheme = brandingData.widgetTheme || "dark";
      }
    } catch {
      // use defaults
    }

    setBrandResult({ logo: extractedLogo, color: extractedColor, theme: extractedTheme });
    setLoading(false);

    // Save to DB
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("widget_configurations") as any).upsert(
        {
          user_id: user.id,
          website_url: formattedUrl || null,
          logo: extractedLogo,
          widget_color: extractedColor,
          widget_theme: extractedTheme,
        },
        { onConflict: "user_id" }
      );
    } catch (err) {
      console.error("Error saving configuration:", err);
    }
  };

  const handleSkip = () => navigate("/builder");
  const handleContinue = () => navigate("/builder");

  const progressPercent = ((step + 1) / STEP_LABELS.length) * 100;

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(145deg, #110c29 0%, #1a1145 40%, #0f0a20 100%)" }}
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsl(270 60% 50% / 0.4), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(280 70% 60% / 0.3), transparent 70%)" }}
      />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="h-1 w-full bg-white/10">
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: "linear-gradient(90deg, #a855f7, #7c3aed)" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="flex justify-center gap-8 pt-4">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i <= step ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs font-medium transition-colors ${i <= step ? "text-white/90" : "text-white/30"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <img src={widjetLogo} alt="Widjet" className="h-12" />
            </div>
            <h1 className="mb-3 text-4xl font-bold text-white">
              Welcome to Widjet
            </h1>
            <p className="mb-8 max-w-md text-lg text-white/60">
              Let's set up your widget in 3 easy steps. We'll match your brand identity automatically.
            </p>
            <Button
              size="lg"
              onClick={() => setStep(1)}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-base rounded-xl"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="url"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20">
                <Globe className="h-8 w-8 text-purple-400" />
              </div>
              <h2 className="mb-2 text-center text-2xl font-bold text-white">
                Enter your website
              </h2>
              <p className="mb-6 text-center text-sm text-white/50">
                We'll automatically extract your logo, colors and theme.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white/70">Website URL</Label>
                  <Input
                    id="website"
                    type="text"
                    placeholder="example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-purple-500 text-base"
                  />
                  <p className="flex items-center gap-1 text-xs text-purple-400/70">
                    <Sparkles className="h-3 w-3" />
                    AI-powered brand detection
                  </p>
                </div>

                <Button
                  onClick={handleExtract}
                  disabled={!websiteUrl.trim()}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-white/10 disabled:text-white/30 rounded-xl"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continue
                </Button>
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="branding"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              {loading ? (
                <div className="flex flex-col items-center py-8">
                  <div className="mb-6 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-3 w-3 rounded-full bg-purple-500"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={statusIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-white/60"
                    >
                      {statusMessages[statusIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              ) : brandResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Brand detected!</h2>
                    <p className="text-sm text-white/50">Here's what we found</p>
                  </div>

                  {/* Results preview */}
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        {brandResult.logo ? (
                          <img src={brandResult.logo} alt="Logo" className="h-8 w-8 object-contain" />
                        ) : (
                          <span className="text-xs text-white/40">N/A</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Logo</p>
                        <p className="text-sm text-white/80">{brandResult.logo ? "Detected" : "Not found"}</p>
                      </div>
                    </div>

                    {/* Color */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <Palette className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs text-white/40">Brand color</p>
                          <p className="text-sm text-white/80 capitalize">{brandResult.color}</p>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full border border-white/20"
                          style={{ backgroundColor: brandResult.color.startsWith("#") ? brandResult.color : undefined }}
                        />
                      </div>
                    </div>

                    {/* Theme */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        {brandResult.theme === "dark" ? (
                          <Moon className="h-5 w-5 text-purple-400" />
                        ) : (
                          <Sun className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Theme</p>
                        <p className="text-sm text-white/80 capitalize">{brandResult.theme}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleContinue}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  >
                    Continue to Builder
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={handleSkip}
                    className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                  >
                    Skip
                  </button>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
