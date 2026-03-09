import { useState } from "react";
import { BookOpen, RefreshCw, Loader2, Unplug, CheckCircle2 } from "lucide-react";
import { useShopifyConnection } from "@/hooks/useShopifyConnection";
import ShopifyConnectDialog from "./ShopifyConnectDialog";
import { formatDistanceToNow } from "date-fns";

const IntegrationsPanel = () => {
  const { connection, isLoading, isSyncing, connect, sync, disconnect } = useShopifyConnection();
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl bg-[#96bf48]/10">
                🛍️
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
                    onClick={() => disconnect()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Disconnect"
                  >
                    <Unplug className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDialogOpen(true)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Connect
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
        onConnect={connect}
        onSyncAfterConnect={sync}
      />
    </div>
  );
};

export default IntegrationsPanel;
