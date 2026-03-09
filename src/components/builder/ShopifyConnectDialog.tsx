import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ShopifyConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (shopDomain: string) => Promise<boolean>;
}

const ShopifyConnectDialog = ({ open, onOpenChange, onConnect }: ShopifyConnectDialogProps) => {
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsSubmitting(true);
    await onConnect(domain);
    // Note: if OAuth succeeds, page will redirect — no need to close dialog
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Shopify Store</DialogTitle>
          <DialogDescription>
            Enter your Shopify store domain. You'll be redirected to Shopify to authorize the connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="store-domain">Store domain</Label>
            <Input
              id="store-domain"
              placeholder="mystore.myshopify.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter your full Shopify store domain (e.g. mystore.myshopify.com)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !domain.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Shopify…
              </>
            ) : (
              "Connect with Shopify"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyConnectDialog;
