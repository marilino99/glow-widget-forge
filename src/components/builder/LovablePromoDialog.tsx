import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import promoBanner from "@/assets/lovable-promo-banner.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LovablePromoDialog = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkPromo = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("lovable_promo_claimed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data && !data.lovable_promo_claimed) {
        setOpen(true);
      }
    };

    checkPromo();
  }, [user]);

  const handleDismiss = async () => {
    setOpen(false);
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ lovable_promo_claimed: true })
      .eq("user_id", user.id);
  };

  const handleClaim = async () => {
    window.open("https://lovable.dev/pricing?promo=widjet3mo", "_blank");
    handleDismiss();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-md p-6 gap-5">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Get 3 months of Lovable Pro for free
          </h2>
          <p className="text-sm text-muted-foreground">
            Get 100 monthly credits for 3 months completely free. Start building faster today.
          </p>
        </div>


        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Maybe later
          </Button>
          <Button className="flex-1 gap-2" onClick={handleClaim}>
            Claim offer
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LovablePromoDialog;
