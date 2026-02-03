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
import { AlertTriangle, Copy, Check, ExternalLink, Send, X } from "lucide-react";
import WixLogo from "@/components/icons/WixLogo";
import { useToast } from "@/hooks/use-toast";

interface AddToWebsiteDialogProps {
  widgetId?: string;
}

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          Add to website
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add to website</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning banner */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
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
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
              <pre className="whitespace-pre-wrap">{embedCode}</pre>
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

          {/* Integration section */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Try seamless integration with:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 h-9"
                onClick={() => setShowWixGuide(!showWixGuide)}
              >
                <WixLogo className="h-4 w-auto" />
                Wix
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-muted-foreground" disabled>
                WordPress
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-muted-foreground" disabled>
                Shopify
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-muted-foreground" disabled>
                Squarespace
              </Button>
            </div>

            {/* Wix Guide Collapsible */}
            <Collapsible open={showWixGuide} onOpenChange={setShowWixGuide}>
              <CollapsibleContent>
                <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <WixLogo className="h-4 w-auto" />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWebsiteDialog;
