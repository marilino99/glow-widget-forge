import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import promoBanner from "@/assets/lovable-promo-banner.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LovablePromoDialogProps {
  onShowSteps?: () => void;
  isOnboarding?: boolean;
}

const LovablePromoDialog = ({ onShowSteps, isOnboarding }: LovablePromoDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || isOnboarding) return;

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

  const handleDismiss = () => {
    setOpen(false);
  };

  const handleShowSteps = () => {
    setOpen(false);
    onShowSteps?.();
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

        <img
          src={promoBanner}
          alt="Lovable x WidJet promo"
          className="w-full rounded-xl"
        />

        <p className="text-[10px] text-muted-foreground leading-tight">*Valid only for new Lovable accounts. Only 10 accounts will be selected based on the best review left on G2.com. Valid until 31.03.2026.</p>

        <Button className="w-full gap-2" onClick={handleShowSteps}>
          How to claim
          <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LovablePromoDialog;
