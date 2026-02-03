import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Copy, Check, ExternalLink, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddToWebsiteDialogProps {
  widgetId?: string;
}

const AddToWebsiteDialog = ({ widgetId }: AddToWebsiteDialogProps) => {
  const [copied, setCopied] = useState(false);
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
          <div>
            <p className="text-sm text-muted-foreground">Try seamless integration with:</p>
            <div className="flex gap-4 mt-2 text-muted-foreground">
              <span className="text-xs">WordPress</span>
              <span className="text-xs">Shopify</span>
              <span className="text-xs">Wix</span>
              <span className="text-xs">Squarespace</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWebsiteDialog;
