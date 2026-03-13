import { useState } from "react";
import { BookOpen, RefreshCw, Loader2, Unplug, CheckCircle2, ShoppingBag, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import shopifyLogo from "@/assets/logo-shopify.png";
import calendlyLogo from "@/assets/logo-calendly.png";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import ShopifyConnectDialog from "./ShopifyConnectDialog";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";

interface IntegrationsPanelProps {
  calendlyEnabled?: boolean;
  calendlyEventUrl?: string;
  onCalendlyToggle?: (enabled: boolean) => void;
  onCalendlyUrlChange?: (url: string) => void;
  onSaveConfig?: (config: Record<string, unknown>) => void;
}

const IntegrationsPanel = ({
  calendlyEnabled = false,
  calendlyEventUrl = "",
  onCalendlyToggle,
  onCalendlyUrlChange,
  onSaveConfig,
}: IntegrationsPanelProps) => {
  const { connection, isLoading, isSyncing, isConnecting, connectOAuth, sync, disconnect } = useShopifyConnection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate progress bar during sync
  useEffect(() => {
    if (isSyncing) {
      setSyncProgress(5);
      syncTimerRef.current = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 12;
        });
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
    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [isSyncing]);

  const isConnected = !!connection;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 pt-5 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Empower your bot with AI and other automation capabilities
        </p>
      </div>

      {/* Grid */}
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
              {isConnected && connection && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected — {connection.store_domain}
                  </span>
                  {connection.last_synced_at && (
                    <span className="text-[11px] text-muted-foreground">
                      {connection.product_count} products · synced{" "}
                      {formatDistanceToNow(new Date(connection.last_synced_at), { addSuffix: true })}
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
              {isLoading ? (
                <button disabled className="flex-1 py-3 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">
                  Loading…
                </button>
              ) : isConnected ? (
                <>
                  <button
                    onClick={() => sync()}
                    disabled={isSyncing}
                    className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                  >
                    {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {isSyncing ? "Syncing…" : "Sync now"}
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button
                    onClick={() => setDisconnectDialogOpen(true)}
                    className="flex h-full w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive py-3"
                    title="Disconnect"
                  >
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDialogOpen(true)}
                    disabled={isConnecting}
                    className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                  >
                    {isConnecting ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />Connecting…</>
                    ) : "Connect"}
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

              {calendlyEnabled && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Event URL</label>
                  <Input
                    placeholder="https://calendly.com/your-name/session"
                    value={calendlyEventUrl}
                    onChange={(e) => onCalendlyUrlChange?.(e.target.value)}
                    onBlur={() => onSaveConfig?.({ calendlyEventUrl: calendlyEventUrl })}
                    className="h-9 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Paste your Calendly event type link here.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center border-t border-border">
              <button
                onClick={() => {
                  const next = !calendlyEnabled;
                  onCalendlyToggle?.(next);
                  onSaveConfig?.({ calendlyEnabled: next });
                }}
                className="flex-1 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
              >
                {calendlyEnabled ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" />Connected</>
                ) : "Connect"}
              </button>
              <div className="w-px h-6 bg-border" />
              <button className="flex w-14 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground py-3">
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <ShopifyConnectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConnect={connectOAuth}
      />

      <AlertDialog open={disconnectDialogOpen} onOpenChange={setDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Shopify?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Shopify store? You'll need to reconnect and re-authorize to use Shopify features again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnect()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IntegrationsPanel;
