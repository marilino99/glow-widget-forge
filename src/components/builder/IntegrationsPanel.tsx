import { useState } from "react";
import { BookOpen, Loader2, Unplug, CheckCircle2, ShoppingBag, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import shopifyLogo from "@/assets/logo-shopify.png";
import calendlyLogo from "@/assets/logo-calendly.png";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import { useCalendlyConnection } from "@/hooks/useCalendlyConnection";
import ShopifyConnectDialog from "./ShopifyConnectDialog";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";

interface IntegrationsPanelProps {
  onSaveConfig?: (config: Record<string, unknown>) => void;
}

const IntegrationsPanel = ({ onSaveConfig }: IntegrationsPanelProps) => {
  const { connection: shopifyConn, isLoading: shopifyLoading, isSyncing, isConnecting: shopifyConnecting, connectOAuth: shopifyConnect, sync, disconnect: shopifyDisconnect } = useShopifyConnection();
  const { isConnected: calendlyConnected, isLoading: calendlyLoading, isConnecting: calendlyConnecting, connectOAuth: calendlyConnect, disconnect: calendlyDisconnect, connection: calendlyConn } = useCalendlyConnection();

  const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<"shopify" | "calendly" | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSyncing) {
      setSyncProgress(5);
      syncTimerRef.current = setInterval(() => {
        setSyncProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 12));
      }, 400);
    } else {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      if (syncProgress > 0) {
        setSyncProgress(100);
        const t = setTimeout(() => setSyncProgress(0), 800);
        return () => clearTimeout(t);
      }
    }
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
  }, [isSyncing]);

  const handleDisconnectConfirm = () => {
    if (disconnectTarget === "shopify") shopifyDisconnect();
    if (disconnectTarget === "calendly") calendlyDisconnect();
    setDisconnectTarget(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-8 pt-5 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Empower your bot with AI and other automation capabilities
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Shopify Card */}
          <div className="flex flex-col rounded-2xl border border-border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div className="flex-1 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#96bf48]/10">
                <img src={shopifyLogo} alt="Shopify" className="h-7 w-7 object-contain" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Shopify</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Sync your Shopify catalog and let the AI chatbot recommend products.
              </p>
              {!!shopifyConn && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected — {shopifyConn.store_domain}
                  </span>
                  {shopifyConn.last_synced_at && (
                    <span className="text-[11px] text-muted-foreground">
                      {shopifyConn.product_count} products · synced{" "}
                      {formatDistanceToNow(new Date(shopifyConn.last_synced_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              )}
              {(isSyncing || syncProgress > 0) && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {syncProgress >= 100 ? "Sync complete!" : "Syncing products…"}
                    </span>
                  </div>
                  <Progress value={Math.min(syncProgress, 100)} className="h-1.5 bg-muted" />
                </div>
              )}
            </div>
            <div className="flex items-center border-t border-border">
              {shopifyLoading ? (
                <button disabled className="flex-1 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">Loading…</button>
              ) : !!shopifyConn ? (
                <>
                  <button onClick={() => sync()} disabled={isSyncing} className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5">
                    {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {isSyncing ? "Syncing…" : "Sync now"}
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button onClick={() => setDisconnectTarget("shopify")} className="flex h-full w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive py-3" title="Disconnect">
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShopifyDialogOpen(true)} disabled={shopifyConnecting} className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5">
                    {shopifyConnecting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Connecting…</> : "Connect"}
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button className="flex w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground py-3">
                    <BookOpen className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Calendly Card */}
          <div className="flex flex-col rounded-2xl border border-border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div className="flex-1 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006BFF]/10">
                <img src={calendlyLogo} alt="Calendly" className="h-7 w-7 object-contain" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">Calendly</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Let visitors book appointments directly from your widget via Calendly.
              </p>
              {calendlyConnected && calendlyConn && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                  {calendlyConn.scheduling_url && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-full">
                      {calendlyConn.scheduling_url}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center border-t border-border">
              {calendlyLoading ? (
                <button disabled className="flex-1 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">Loading…</button>
              ) : calendlyConnected ? (
                <>
                  <span className="flex-1 py-3 text-sm font-medium text-green-600 text-center">Connected</span>
                  <div className="w-px h-6 bg-border" />
                  <button onClick={() => setDisconnectTarget("calendly")} className="flex h-full w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive py-3" title="Disconnect">
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={calendlyConnect} disabled={calendlyConnecting} className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5">
                    {calendlyConnecting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Connecting…</> : "Connect"}
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button className="flex w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground py-3">
                    <BookOpen className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <ShopifyConnectDialog open={shopifyDialogOpen} onOpenChange={setShopifyDialogOpen} onConnect={shopifyConnect} />

      <AlertDialog open={!!disconnectTarget} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnectTarget === "shopify" ? "Shopify" : "Calendly"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? You'll need to reconnect and re-authorize to use this integration again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IntegrationsPanel;
