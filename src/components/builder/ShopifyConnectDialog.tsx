import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface ShopifyConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (storeDomain: string, token: string) => Promise<boolean>;
  onSyncAfterConnect: () => Promise<boolean>;
}

const ShopifyConnectDialog = ({ open, onOpenChange, onConnect, onSyncAfterConnect }: ShopifyConnectDialogProps) => {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !token.trim()) return;

    setIsSubmitting(true);
    const ok = await onConnect(domain, token);
    if (ok) {
      await onSyncAfterConnect();
      onOpenChange(false);
      setDomain("");
      setToken("");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Shopify Store</DialogTitle>
          <DialogDescription>
            Enter your store domain and a Storefront Access Token to sync your product catalog.
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="storefront-token">Storefront Access Token</Label>
            <Input
              id="storefront-token"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isSubmitting}
            />
            <a
              href="https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              How to generate a Storefront Access Token
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !domain.trim() || !token.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting & syncing…
              </>
            ) : (
              "Connect & Sync"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyConnectDialog;
