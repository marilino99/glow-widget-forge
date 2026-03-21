import { useState } from "react";
import { BookOpen, RefreshCw, Loader2, Unplug, CheckCircle2, ShoppingBag, AlertTriangle, Send } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import shopifyLogo from "@/assets/logo-shopify.png";
import calendlyLogo from "@/assets/logo-calendly.png";
import instagramLogo from "@/assets/logo-instagram.png";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import { useCalendlyConnection } from "@/hooks/useCalendlyConnection";
import { useInstagramDMConnection } from "@/hooks/useInstagramDMConnection";
import ShopifyConnectDialog from "./ShopifyConnectDialog";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef } from "react";

const IntegrationsPanel = () => {
  const { connection, isLoading, isSyncing, isConnecting, connectOAuth, sync, disconnect } = useShopifyConnection();
  const calendly = useCalendlyConnection();
  const instagram = useInstagramDMConnection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [calendlyDisconnectOpen, setCalendlyDisconnectOpen] = useState(false);
  const [instagramDisconnectOpen, setInstagramDisconnectOpen] = useState(false);
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
  const isCalendlyConnected = !!calendly.connection;

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
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#96bf48]/10">
                <img src={shopifyLogo} alt="Shopify" className="h-7 w-7 object-contain" />
              </div>

              <h3 className="mt-3.5 text-sm font-semibold text-foreground">Shopify</h3>

              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
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
            </div>

            {/* Sync progress bar */}
            {(isSyncing || syncProgress > 0) && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {syncProgress >= 100 ? "Sync complete!" : "Syncing products…"}
                  </span>
                </div>
                <Progress
                  value={Math.min(syncProgress, 100)}
                  className="h-1.5 bg-muted"
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              {isLoading ? (
                <button disabled className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">
                  Loading…
                </button>
              ) : isConnected ? (
                <>
                  <button
                    onClick={() => sync()}
                    disabled={isSyncing}
                    className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {isSyncing ? "Syncing…" : "Sync now"}
                  </button>
                  <button
                    onClick={() => setDisconnectDialogOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Disconnect"
                  >
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDialogOpen(true)}
                  disabled={isConnecting}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendly Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#006BFF]/10">
                <img src={calendlyLogo} alt="Calendly" className="h-7 w-7 object-contain" />
              </div>

              <h3 className="mt-3.5 text-sm font-semibold text-foreground">Calendly</h3>

              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Let visitors book appointments directly from your chatbot.
              </p>

              {isCalendlyConnected && calendly.connection && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                  {calendly.connection.scheduling_url && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                      {calendly.connection.scheduling_url}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              {calendly.isLoading ? (
                <button disabled className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">
                  Loading…
                </button>
              ) : isCalendlyConnected ? (
                <>
                  <button
                    disabled
                    className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-green-600 cursor-default inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </button>
                  <button
                    onClick={() => setCalendlyDisconnectOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Disconnect"
                  >
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => calendly.connectOAuth()}
                  disabled={calendly.isConnecting}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                >
                  {calendly.isConnecting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Instagram DM Card */}
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E1306C]/10">
                <img src={instagramLogo} alt="Instagram" className="h-9 w-9 object-contain" />
              </div>

              <h3 className="mt-3.5 text-sm font-semibold text-foreground">Instagram</h3>

              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Auto-reply to Instagram DMs with AI — always-on support, even after hours.
              </p>

              {instagram.connection && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                  {instagram.connection.instagram_username && (
                    <span className="text-[11px] text-muted-foreground">
                      @{instagram.connection.instagram_username}
                    </span>
                  )}
                </div>
              )}

              {!instagram.connection && !instagram.isLoading && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                        App Meta in modalità Development
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-amber-700 dark:text-amber-400/80">
                        <li>• Aggiungi l'account come <strong>Instagram Tester</strong> nella dashboard Meta</li>
                        <li>• L'account deve <strong>accettare l'invito</strong> da Instagram</li>
                        <li>• L'account deve essere <strong>professionale</strong> (Business/Creator)</li>
                        <li>• Per utenti esterni: porta l'app in <strong>modalità Live</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              {instagram.isLoading ? (
                <button disabled className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60">
                  Loading…
                </button>
              ) : instagram.connection ? (
                <>
                  <button
                    disabled
                    className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-green-600 cursor-default inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </button>
                  <button
                    onClick={() => setInstagramDisconnectOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Disconnect"
                  >
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => instagram.connectOAuth()}
                  disabled={instagram.isConnecting}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted inline-flex items-center justify-center gap-1.5"
                >
                  {instagram.isConnecting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              )}
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
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

      <AlertDialog open={calendlyDisconnectOpen} onOpenChange={setCalendlyDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Calendly?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Calendly account? Visitors won't be able to book appointments from the chatbot anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => calendly.disconnect()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={instagramDisconnectOpen} onOpenChange={setInstagramDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Instagram DM?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your Instagram account? AI auto-replies to DMs will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => instagram.disconnect()}
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
