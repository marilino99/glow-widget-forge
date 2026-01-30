import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Loader2, Globe, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Format URL
      let formattedUrl = websiteUrl.trim();
      if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from("widget_configurations") as any)
        .upsert({
          user_id: user.id,
          website_url: formattedUrl || null,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: "Setup complete!",
        description: "Let's start building your widget.",
      });

      navigate("/builder");
    } catch (error) {
      console.error("Error saving website URL:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/builder");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold text-foreground">Widjet</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Widjet! 🎉</CardTitle>
          <CardDescription>
            Let's set up your widget. Enter your website URL to preview how it will look.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Your website URL
              </Label>
              <Input
                id="website"
                type="text"
                placeholder="example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                This will be shown in the widget preview so you can see exactly how it looks on your site.
              </p>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Continue to Builder
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
