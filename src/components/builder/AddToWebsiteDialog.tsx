import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Check, Globe, Heart, Loader2, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  WixLogo,
  WordPressLogo,
  GoogleTagManagerLogo,
  ShopifyLogo,
} from "@/components/icons/PlatformLogos";

interface AddToWebsiteDialogProps {
  widgetId?: string;
  fullWidth?: boolean;
}

type Platform = "manual" | "gtm" | "lovable" | "wix" | "shopify" | "wordpress";

interface PlatformOption {
  id: Platform;
  name: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface ShopifyDiagnostics {
  tagInstalled: boolean;
  method?: string;
  lastSeenUrl?: string;
  lastSeenAt?: string;
  recentImpressions: number;
  launcherVisible: boolean | null;
  launcherChecked: boolean;
  otherDomainUrl?: string;
  otherDomainCount?: number;
  storefrontVerified?: boolean;
  storefrontError?: string;
  loaderBooted?: boolean;
}

const LovableLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
  </svg>
);

const WebflowLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.802 8.56s-1.946 6.066-2.047 6.387c-.045-.32-1.076-6.387-1.076-6.387-1.856 0-2.847 1.397-3.396 2.874 0 0-1.29 3.47-1.357 3.652-.015-.25-.317-6.526-.317-6.526C9.4 6.83 7.625 8.56 7.625 8.56l1.36 8.428c1.96-.005 3.014-1.387 3.586-2.876 0 0 1.06-2.87 1.118-3.03.04.257 1.116 5.906 1.116 5.906 1.96-.005 3.012-1.31 3.59-2.792L20.375 8.56h-2.573z"/>
  </svg>
);

const platforms: PlatformOption[] = [
  { id: "manual", name: "Manual install", icon: <Globe className="h-5 w-5" /> },
  { id: "shopify", name: "Shopify", icon: <ShopifyLogo className="h-5 w-5" /> },
];

const AddToWebsiteDialog = ({ widgetId, fullWidth }: AddToWebsiteDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("manual");
  const [isInstallingShopify, setIsInstallingShopify] = useState(false);
  const [shopifyInstalled, setShopifyInstalled] = useState(false);
  const [isCheckingShopify, setIsCheckingShopify] = useState(false);
  const [diagnostics, setDiagnostics] = useState<ShopifyDiagnostics | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { connection: shopifyConnection } = useShopifyConnection();

  // Fetch live diagnostics: last impression URL + recent count, filtered by connected store
  const fetchDiagnostics = useCallback(async () => {
    if (!widgetId) return;
    try {
      // Get recent events (last 24h) with page_url
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentEvents } = await supabase
        .from("widget_events")
        .select("created_at, page_url, event_type")
        .eq("widget_id", widgetId)
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false })
        .limit(100);

      const connectedDomain = shopifyConnection?.store_domain || "";
      
      // Filter events: only count those from the connected store domain
      const storeEvents = connectedDomain 
        ? recentEvents?.filter(e => {
            if (!e.page_url) return false;
            try {
              const url = new URL(e.page_url);
              return url.hostname.includes(connectedDomain.replace(".myshopify.com", ""));
            } catch { return false; }
          }) || []
        : recentEvents || [];

      const allEvents = recentEvents || [];
      const otherDomainEvents = connectedDomain
        ? allEvents.filter(e => e.page_url && !storeEvents.includes(e))
        : [];

      const impressions = storeEvents.filter(e => e.event_type === "impression");
      const lastWithUrl = storeEvents.find(e => e.page_url);
      const hasLauncherVisible = storeEvents.some(e => e.event_type === "launcher_visible");
      const hasLauncherHidden = storeEvents.some(e => e.event_type === "launcher_hidden");
      const launcherChecked = hasLauncherVisible || hasLauncherHidden;
      // Filter loader_boot by connected store domain too
      const hasLoaderBoot = connectedDomain
        ? storeEvents.some(e => e.event_type === "loader_boot")
        : (recentEvents || []).some(e => e.event_type === "loader_boot");
      const hasLoaderBootAnyDomain = (recentEvents || []).some(e => e.event_type === "loader_boot");

      // Check if there are events from other domains (mismatch warning)
      const otherDomainUrl = otherDomainEvents.length > 0 ? otherDomainEvents[0]?.page_url : undefined;

      setDiagnostics(prev => ({
        tagInstalled: prev?.tagInstalled ?? false,
        method: prev?.method,
        lastSeenUrl: lastWithUrl?.page_url || undefined,
        lastSeenAt: lastWithUrl?.created_at || undefined,
        recentImpressions: impressions.length,
        launcherVisible: launcherChecked ? hasLauncherVisible : null,
        launcherChecked,
        otherDomainUrl,
        otherDomainCount: otherDomainEvents.length,
        storefrontVerified: prev?.storefrontVerified,
        storefrontError: prev?.storefrontError,
        loaderBooted: hasLoaderBoot,
      }));
    } catch (e) {
      // Silent
    }
  }, [widgetId, shopifyConnection?.store_domain]);

  // Auto-check if widget is already installed on Shopify
  const checkShopifyInstallation = useCallback(async () => {
    if (!shopifyConnection || !user || shopifyInstalled) return;
    setIsCheckingShopify(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("shopify-install-widget", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { checkOnly: true },
      });
      if (!res.error && res.data?.alreadyInstalled) {
        setShopifyInstalled(true);
        setDiagnostics(prev => ({
          ...prev,
          tagInstalled: true,
          method: res.data?.method || "unknown",
          recentImpressions: prev?.recentImpressions ?? 0,
          launcherVisible: prev?.launcherVisible ?? null,
          launcherChecked: prev?.launcherChecked ?? false,
          storefrontVerified: res.data?.storefrontVerified ?? false,
          storefrontError: res.data?.storefrontError,
        }));
      } else {
        setDiagnostics(prev => ({
          ...prev,
          tagInstalled: false,
          recentImpressions: prev?.recentImpressions ?? 0,
          launcherVisible: prev?.launcherVisible ?? null,
          launcherChecked: prev?.launcherChecked ?? false,
        }));
      }
    } catch (e) {
      // Silent fail on check
    } finally {
      setIsCheckingShopify(false);
    }
  }, [shopifyConnection, user, shopifyInstalled]);

  useEffect(() => {
    setShopifyInstalled(false);
    setDiagnostics(null);
  }, [shopifyConnection?.store_domain, widgetId]);

  useEffect(() => {
    if (selectedPlatform === "shopify" && shopifyConnection) {
      checkShopifyInstallation();
      fetchDiagnostics();
    }
  }, [selectedPlatform, shopifyConnection, checkShopifyInstallation, fetchDiagnostics]);

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

  const lovableReactCode = widgetId ? `// Add this useEffect inside your page component
useEffect(() => {
  (window as any).__wj = (window as any).__wj || {};
  (window as any).__wj.widgetId = "${widgetId}";
  (window as any).__wj.product_name = "widjet";
  const f = document.getElementsByTagName("script")[0];
  const j = document.createElement("script");
  j.async = true;
  j.src = "${widgetLoaderUrl}";
  f.parentNode?.insertBefore(j, f);

  return () => {
    const root = document.getElementById("wj-root");
    if (root) root.remove();
    (window as any).__wj_loaded = false;
    j.remove();
  };
}, []);` : `// Widget ID not yet available. Save your configuration first.`;

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Copied!", description: "The code has been copied to your clipboard." });
    setTimeout(() => setCopied(false), 2000);
    if (user) {
      supabase.from("user_activity_logs").insert({
        user_id: user.id,
        event_type: "widget_publish",
        metadata: { widget_id: widgetId },
      });
    }
  };

  const handleShopifyOneClick = async () => {
    setIsInstallingShopify(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("shopify-install-widget", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;
      const result = res.data as { success?: boolean; alreadyInstalled?: boolean; error?: string; method?: string; storefrontVerified?: boolean; storefrontError?: string };

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else if (result.alreadyInstalled) {
        setShopifyInstalled(true);
        setDiagnostics(prev => ({
          ...prev,
          tagInstalled: true,
          method: result.method || "theme_liquid",
          recentImpressions: prev?.recentImpressions ?? 0,
          launcherVisible: prev?.launcherVisible ?? null,
          launcherChecked: prev?.launcherChecked ?? false,
          storefrontVerified: result.storefrontVerified ?? false,
          storefrontError: result.storefrontError,
        }));
        toast({ 
          title: result.storefrontVerified ? "Already installed!" : "Installed in admin", 
          description: result.storefrontVerified 
            ? "The widget is active on your Shopify store." 
            : result.storefrontError || "Installed in admin but not confirmed on live storefront." 
        });
      } else if (result.success) {
        setShopifyInstalled(true);
        setDiagnostics(prev => ({
          ...prev,
          tagInstalled: true,
          method: result.method || "theme_liquid",
          recentImpressions: prev?.recentImpressions ?? 0,
          launcherVisible: prev?.launcherVisible ?? null,
          launcherChecked: prev?.launcherChecked ?? false,
          storefrontVerified: result.storefrontVerified ?? false,
          storefrontError: result.storefrontError,
        }));
        toast({ 
          title: result.storefrontVerified ? "Installed & verified!" : "Installed in admin", 
          description: result.storefrontVerified 
            ? "Widget is live on your Shopify store." 
            : result.storefrontError || "Installed but not yet confirmed on live storefront."
        });
        // Refresh diagnostics after a short delay
        setTimeout(() => fetchDiagnostics(), 2000);
        if (user) {
          supabase.from("user_activity_logs").insert({
            user_id: user.id,
            event_type: "widget_shopify_install",
            metadata: { widget_id: widgetId },
          });
        }
      }
    } catch (e: any) {
      console.error("Shopify install error:", e);
      toast({ title: "Installation failed", description: e.message || "Could not install widget.", variant: "destructive" });
    } finally {
      setIsInstallingShopify(false);
    }
  };

  const handleShopifyReinstall = async (force = false) => {
    setIsInstallingShopify(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (force) {
        // Force: uninstall first to clear old cached snippet
        await supabase.functions.invoke("shopify-uninstall-widget", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      }
      // Reinstall with force flag — generates new cache-bust URL
      const res = await supabase.functions.invoke("shopify-install-widget", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { forceReinstall: true },
      });

      if (res.error) throw res.error;
      const result = res.data as { success?: boolean; error?: string; method?: string; verified?: boolean; storefrontVerified?: boolean; storefrontError?: string };

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        setShopifyInstalled(false);
      } else if (result.success) {
        setShopifyInstalled(true);
        setDiagnostics(prev => ({
          ...prev,
          tagInstalled: true,
          method: result.method || "theme_liquid",
          recentImpressions: prev?.recentImpressions ?? 0,
          launcherVisible: prev?.launcherVisible ?? null,
          launcherChecked: prev?.launcherChecked ?? false,
          storefrontVerified: result.storefrontVerified ?? false,
          storefrontError: result.storefrontError,
        }));
        const title = result.storefrontVerified ? "Verified!" : "Reinstalled in admin";
        const desc = result.storefrontVerified 
          ? "Widget installed and verified on your Shopify store." 
          : result.storefrontError || "Installed but not yet confirmed on live storefront. Clear browser cache and refresh your store.";
        toast({ title, description: desc });
        setTimeout(() => fetchDiagnostics(), 3000);
      }
    } catch (e: any) {
      console.error("Shopify reinstall error:", e);
      toast({ title: "Reinstall failed", description: e.message || "Could not reinstall widget.", variant: "destructive" });
    } finally {
      setIsInstallingShopify(false);
    }
  };

  const getCodeForPlatform = () => {
    if (selectedPlatform === "lovable") return lovableReactCode;
    return embedCode;
  };

  const renderPlatformGuide = () => {
    switch (selectedPlatform) {
      case "manual":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install Widjet in your website</h3>
            <p className="text-sm text-muted-foreground">
              Paste this code snippet just before the <code className="text-primary font-mono">&lt;/body&gt;</code> tag on your website.
            </p>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Installation tip: Don't host the script on CDNs to ensure your widget never goes offline when you need it the most.
            </p>
            <Button onClick={() => handleCopy(embedCode)} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy code"}
            </Button>
          </div>
        );

      case "gtm":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install with Google Tag Manager</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">1.</span>
                Open your <span className="font-medium text-foreground">Google Tag Manager</span> account
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">2.</span>
                Create a new <span className="font-medium text-foreground">Custom HTML Tag</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">3.</span>
                Paste the code below into the HTML field
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">4.</span>
                Set the trigger to <span className="font-medium text-foreground">"All Pages"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">5.</span>
                Save and <span className="font-medium text-foreground">Publish</span> your container
              </li>
            </ol>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </div>
            <Button onClick={() => handleCopy(embedCode)} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy code"}
            </Button>
          </div>
        );

      case "lovable":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install on Lovable</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">1.</span>
                Open your Lovable project
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">2.</span>
                Copy the React code below
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">3.</span>
                Ask Lovable: <span className="font-medium text-foreground">"Add this useEffect to my main page component"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">4.</span>
                Lovable will integrate it automatically ✨
              </li>
            </ol>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{lovableReactCode}</pre>
            </div>
            <Button onClick={() => handleCopy(lovableReactCode)} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy React code"}
            </Button>
          </div>
        );

      case "wix":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install on Wix</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">1.</span>
                Open your <span className="font-medium text-foreground">Wix Editor</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">2.</span>
                Click <span className="font-medium text-foreground">"Add Elements"</span> (+)
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">3.</span>
                Select <span className="font-medium text-foreground">"Embed code"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">4.</span>
                Click the code box → <span className="font-medium text-foreground">"Enter Code"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">5.</span>
                Paste the widget code below
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">6.</span>
                Position anywhere & <span className="font-medium text-foreground">Publish</span>
              </li>
            </ol>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </div>
            <Button onClick={() => handleCopy(embedCode)} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy code for Wix"}
            </Button>
          </div>
        );

      case "shopify":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install on Shopify</h3>
            
            {shopifyConnection ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Connected to <span className="font-semibold">{shopifyConnection.store_domain}</span>
                  </p>
                </div>

                {shopifyInstalled ? (
                  <div className="space-y-3">
                    {/* Simple status banner */}
                    <div className="flex items-center gap-3 rounded-lg border p-4" style={{
                      backgroundColor: diagnostics?.storefrontVerified ? 'hsl(var(--primary) / 0.08)' : 'hsl(45 93% 47% / 0.08)',
                      borderColor: diagnostics?.storefrontVerified ? 'hsl(var(--primary) / 0.2)' : 'hsl(45 93% 47% / 0.3)',
                    }}>
                      {diagnostics?.storefrontVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {diagnostics?.storefrontVerified 
                            ? "Widget attivo sul tuo store ✓" 
                            : "Widget installato — verifica in corso"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {diagnostics?.storefrontVerified
                            ? "Il widget è live e funzionante."
                            : diagnostics?.storefrontError 
                              ? "Lo store potrebbe essere protetto da password o il tema non è pubblicato."
                              : "Stiamo verificando che il widget sia visibile sul tuo store."}
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleShopifyReinstall(false)} 
                      disabled={isInstallingShopify}
                      variant="outline"
                      className="gap-2 w-full"
                      size="sm"
                    >
                      {isInstallingShopify ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Reinstallazione...
                        </>
                      ) : (
                        "Reinstalla widget"
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Install the Widjet widget on your Shopify store with one click. The script will be automatically added to all pages.
                    </p>
                    <Button 
                      onClick={handleShopifyOneClick} 
                      disabled={isInstallingShopify}
                      className="gap-2 w-full"
                      size="lg"
                    >
                      {isInstallingShopify ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <ShopifyLogo className="h-4 w-4" />
                          Install on Shopify — One click
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Shopify store first in <span className="font-medium text-foreground">Integrations</span> to enable one-click install. Or use the manual instructions below.
                </p>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">1.</span>
                    Go to your <span className="font-medium text-foreground">Shopify Admin</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">2.</span>
                    Navigate to <span className="font-medium text-foreground">Online Store → Themes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">3.</span>
                    Click <span className="font-medium text-foreground">Actions → Edit code</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">4.</span>
                    Open <span className="font-medium text-foreground">theme.liquid</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">5.</span>
                    Paste the code just before <code className="text-primary font-mono">&lt;/body&gt;</code>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">6.</span>
                    Click <span className="font-medium text-foreground">Save</span>
                  </li>
                </ol>
                <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
                  <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
                </div>
                <Button onClick={() => handleCopy(embedCode)} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy code for Shopify"}
                </Button>
              </div>
            )}
          </div>
        );

      case "wordpress":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Install on WordPress</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">1.</span>
                Go to your <span className="font-medium text-foreground">WordPress Dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">2.</span>
                Navigate to <span className="font-medium text-foreground">Appearance → Theme Editor</span> (or use a plugin like <span className="font-medium text-foreground">Insert Headers and Footers</span>)
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">3.</span>
                Open <span className="font-medium text-foreground">footer.php</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">4.</span>
                Paste the code just before <code className="text-primary font-mono">&lt;/body&gt;</code>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground shrink-0">5.</span>
                Click <span className="font-medium text-foreground">Update File</span>
              </li>
            </ol>
            <div className="rounded-lg bg-muted p-4 font-mono text-xs text-muted-foreground overflow-hidden">
              <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
            </div>
            <Button onClick={() => handleCopy(embedCode)} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy code for WordPress"}
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`group relative p-[2px] rounded-md overflow-hidden cursor-pointer ${fullWidth ? 'w-full' : ''}`}>
          <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,red,orange,yellow,green,cyan,blue,purple,red)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animation: "rainbow-spin 8s linear infinite" }} />
          <Button size={fullWidth ? "default" : "sm"} className={`relative bg-primary hover:bg-primary text-primary-foreground border-0 ${fullWidth ? 'w-full' : 'w-full px-0'}`}>
            {fullWidth ? "Publish" : <span className="relative inline-flex items-center justify-center text-lg" style={{ filter: 'drop-shadow(0 0 3px hsla(270, 100%, 65%, 1)) drop-shadow(0 0 8px hsla(270, 100%, 60%, 1)) drop-shadow(0 0 16px hsla(270, 90%, 55%, 0.9)) drop-shadow(0 0 30px hsla(270, 85%, 50%, 0.7)) drop-shadow(0 0 50px hsla(270, 80%, 50%, 0.5))' }}>🚀</span>}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0">
        <div className="flex h-full min-h-[500px]">
          {/* Left sidebar */}
          <div className="w-56 shrink-0 border-r border-border bg-muted/30 p-4 space-y-1">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-bold">Install widget</DialogTitle>
            </DialogHeader>
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => !platform.disabled && setSelectedPlatform(platform.id)}
                disabled={platform.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  selectedPlatform === platform.id
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                } ${platform.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span className="shrink-0">{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderPlatformGuide()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToWebsiteDialog;
