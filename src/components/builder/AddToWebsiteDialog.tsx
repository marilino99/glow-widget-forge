import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, Copy, Check, ExternalLink, Send, X, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  WixLogo,
  WordPressLogo,
  GoogleTagManagerLogo,
  ShopifyLogo,
  SquarespaceLogo,
  WooCommerceLogo,
  BigCommerceLogo,
} from "@/components/icons/PlatformLogos";

interface AddToWebsiteDialogProps {
  widgetId?: string;
}

interface PlatformCardProps {
  logo: React.ReactNode;
  name: string;
  onClick?: () => void;
  disabled?: boolean;
}

const PlatformCard = ({ logo, name, onClick, disabled }: PlatformCardProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/50 p-6 transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="h-12 w-12 flex items-center justify-center">{logo}</div>
    <span className="text-sm font-medium text-foreground">{name}</span>
  </button>
);

const AddToWebsiteDialog = ({ widgetId }: AddToWebsiteDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [showWixGuide, setShowWixGuide] = useState(false);
  const { toast } = useToast();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const widgetLoaderUrl = `${supabaseUrl}/functions/v1/widget-loader`;

  const embedCode = widgetId ? `<!-- Start of Widjet (widjet.com) code -->
<script>
  window.__wj = window.__wj || {};
  window.__wj.widgetId = "${widgetId}";
  window.__wj.product_name = "widjet";
  ;(function(w,d,s){
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s);
    j.async=true;
    j.src="${widgetLoaderUrl}";
    f.parentNode.insertBefore(j,f);
  })(window,document,'script');
</script>
<noscript>Enable JavaScript to use the widget powered by Widjet</noscript>
<!-- End of Widjet code -->` : `<!-- Widget ID not yet available. Save your configuration first. -->`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWixClick = () => {
    setShowWixGuide(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add to website</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning banner */}
          <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Widget not installed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Install the widget on your website and start getting messages from customers. Just copy the code below and paste it into your website code.
                </p>
              </div>
            </div>
          </div>

          {/* Ready message */}
          <p className="font-semibold text-foreground">
            Your Widjet is ready! Add it to your website and start helping your customers right away.
          </p>

          {/* Code section */}
          <div className="rounded-xl bg-muted/50 p-5 space-y-4">
            <Button 
              onClick={handleCopy} 
              className="gap-2"
              size="lg"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy code"}
            </Button>

            <p className="text-sm text-muted-foreground">
              and paste it before the closing{" "}
              <code className="text-primary font-mono">&lt;/body&gt;</code>{" "}
              tag to install on your website.
            </p>

            {/* Code preview */}
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </div>
          </div>

          {/* Help section */}
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Need help with the installation?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Send instructions
              </Button>
              <Button variant="secondary" className="gap-2">
                <Send className="h-4 w-4" />
                Write to us
              </Button>
            </div>
          </div>

          {/* Seamless integration section */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Try seamless integration with:</p>
            <div className="grid grid-cols-2 gap-3">
              <PlatformCard
                logo={<WordPressLogo className="h-10 w-10" />}
                name="WordPress"
                disabled
              />
              <PlatformCard
                logo={<GoogleTagManagerLogo className="h-10 w-10" />}
                name="Google Tag Manager"
                disabled
              />
              <PlatformCard
                logo={<WixLogo className="h-10 w-auto text-foreground" />}
                name="Wix"
                onClick={handleWixClick}
              />
            </div>
          </div>

          {/* Wix Guide Collapsible */}
          <Collapsible open={showWixGuide} onOpenChange={setShowWixGuide}>
            <CollapsibleContent>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <WixLogo className="h-5 w-auto text-foreground" />
                    Install on Wix
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => setShowWixGuide(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    Open your Wix Editor
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    Click <span className="font-medium text-foreground">"Add Elements"</span> (+)
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    Select <span className="font-medium text-foreground">"Embed code"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">4.</span>
                    Click the code box → <span className="font-medium text-foreground">"Enter Code"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">5.</span>
                    Paste the widget code (copied above)
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground">6.</span>
                    Position anywhere & <span className="font-medium text-foreground">Publish</span>
                  </li>
                </ol>

                <Button onClick={handleCopy} size="sm" className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy code for Wix"}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* See how to install section */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">See how to install Widjet with:</p>
            <div className="grid grid-cols-2 gap-3">
              <PlatformCard
                logo={<WooCommerceLogo className="h-10 w-10" />}
                name="Woocommerce"
                disabled
              />
              <PlatformCard
                logo={<ShopifyLogo className="h-10 w-10" />}
                name="Shopify"
                disabled
              />
              <PlatformCard
                logo={<SquarespaceLogo className="h-8 w-8" />}
                name="Squarespace"
                disabled
              />
              <PlatformCard
                logo={<BigCommerceLogo className="h-10 w-10" />}
                name="BigCommerce"
                disabled
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWebsiteDialog;
