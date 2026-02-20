import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, ArrowRight, Loader2, Sparkles, Boxes } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface OnboardingWebsiteDialogProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingWebsiteDialog = ({ open, onComplete }: OnboardingWebsiteDialogProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractingBranding, setExtractingBranding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setExtractingBranding(true);

    try {
      let formattedUrl = websiteUrl.trim();
      if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      let extractedLogo: string | null = null;
      let extractedColor: string = 'blue';
      let extractedTheme: 'light' | 'dark' = 'dark';

      try {
        toast({ title: "Analyzing your website...", description: "Extracting logo, colors and theme" });
        const { data: brandingData, error: brandingError } = await supabase.functions.invoke('extract-branding', {
          body: { url: formattedUrl }
        });
        if (!brandingError && brandingData?.success) {
          extractedLogo = brandingData.logo || null;
          extractedColor = brandingData.widgetColor || 'blue';
          extractedTheme = brandingData.widgetTheme || 'dark';
          if (extractedLogo || extractedColor !== 'blue') {
            toast({ title: "Brand identity detected! ✨", description: `We found your ${extractedLogo ? 'logo, ' : ''}brand colors and ${extractedTheme} theme.` });
          }
        }
      } catch {
        // Continue with defaults
      }

      setExtractingBranding(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("widget_configurations") as any).upsert({
        user_id: user.id,
        website_url: formattedUrl || null,
        logo: extractedLogo,
        widget_color: extractedColor,
        widget_theme: extractedTheme,
      }, { onConflict: "user_id" });

      if (error) throw error;

      toast({ title: "Setup complete!", description: "Your widget is ready with your brand identity." });
      onComplete();
    } catch (error) {
      console.error("Error saving website URL:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save. Please try again." });
    } finally {
      setLoading(false);
      setExtractingBranding(false);
    }
  };

  const handleSkip = async () => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("widget_configurations") as any).upsert(
        { user_id: user.id },
        { onConflict: "user_id" }
      );
    }
    onComplete();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold text-foreground">Widjet</span>
          </div>
          <DialogTitle className="text-xl">Welcome to Widjet! 🎉</DialogTitle>
          <DialogDescription>
            Enter your website URL and we'll automatically match your brand identity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="website-url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Your website URL
            </Label>
            <Input
              id="website-url"
              type="text"
              placeholder="example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="text-base"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              We'll extract your logo and colors automatically
            </p>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading || !websiteUrl.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {extractingBranding ? "Extracting brand..." : "Saving..."}
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Continue to Builder
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWebsiteDialog;
