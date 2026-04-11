import { useState, useEffect, useCallback } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface ShopifyConnection {
  id: string;
  store_domain: string;
  last_synced_at: string | null;
  product_count: number;
}

export const useShopifyConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<ShopifyConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [justConnected, setJustConnected] = useState(false);

  // Check for OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("shopify_connected") === "true";
    const errorCode = params.get("shopify_error");
    const warningCode = params.get("shopify_warning");
    const connectedShop = params.get("shop");

    if (connected) {
      toast({ title: "Shopify connesso!", description: "Lo store è stato collegato con successo. Sincronizzazione in corso…" });
      setJustConnected(true);
    }

    if (warningCode === "shop_mismatch") {
      toast({
        title: "Attenzione dominio Shopify",
        description: connectedShop
          ? `Shopify ha autorizzato ${connectedShop}. È stato collegato questo store.`
          : "Shopify ha autorizzato un dominio diverso da quello richiesto.",
      });
    }

    if (errorCode === "shop_mismatch") {
      const requestedShop = params.get("requested_shop");
      toast({
        title: "Errore connessione Shopify",
        description: requestedShop
          ? `Shopify ha autorizzato uno store diverso da ${requestedShop}. Riconnetti inserendo il dominio corretto e scegliendo quello giusto in Shopify.`
          : "Il dominio ritornato da Shopify non corrisponde a quello richiesto. Riprova con il dominio corretto.",
        variant: "destructive",
      });
    }

    if (connected || errorCode || warningCode || connectedShop) {
      const url = new URL(window.location.href);
      url.searchParams.delete("shopify_connected");
      url.searchParams.delete("shopify_error");
      url.searchParams.delete("shopify_warning");
      url.searchParams.delete("shop");
      url.searchParams.delete("requested_shop");
      window.history.replaceState({}, "", url.toString());
    }
  }, [toast]);


  useEffect(() => {
    if (!user) {
      setConnection(null);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("shopify_connections")
          .select("id, store_domain, last_synced_at, product_count")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setConnection(data);
      } catch (e) {
        console.error("Error loading Shopify connection:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  // OAuth-based connect: ask for shop domain, get auth URL, redirect
  const connectOAuth = useCallback(
    async (shopDomain: string) => {
      if (!user) return false;
      setIsConnecting(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await supabase.functions.invoke("shopify-oauth-start", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: { shop: shopDomain },
        });

        if (res.error) throw res.error;
        const { url } = res.data as { url: string };

        if (url) {
          window.location.href = url;
          return true;
        }
        throw new Error("No authorization URL returned");
      } catch (e: any) {
        console.error("OAuth start error:", e);
        toast({ title: "Errore", description: e.message || "Impossibile avviare la connessione.", variant: "destructive" });
        setIsConnecting(false);
        return false;
      }
    },
    [user, toast]
  );

  // Legacy manual connect (kept for fallback)
  const connect = useCallback(
    async (storeDomain: string, storefrontToken: string) => {
      if (!user) return false;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("shopify_connections")
          .upsert(
            {
              user_id: user.id,
              store_domain: storeDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
              storefront_token: storefrontToken.trim(),
            },
            { onConflict: "user_id" }
          )
          .select("id, store_domain, last_synced_at, product_count")
          .single();

        if (error) throw error;
        setConnection(data);
        return true;
      } catch (e: any) {
        console.error("Error connecting Shopify:", e);
        toast({ title: "Error", description: e.message || "Failed to connect Shopify.", variant: "destructive" });
        return false;
      }
    },
    [user, toast]
  );

  const sync = useCallback(async () => {
    if (!user) return false;
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("sync-shopify-products", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) {
        if (res.error instanceof FunctionsHttpError) {
          try {
            const errorBody = await res.error.context.json();
            const functionError = typeof errorBody?.error === "string" ? errorBody.error : null;
            throw new Error(functionError || res.error.message || "Could not sync products.");
          } catch {
            throw new Error(res.error.message || "Could not sync products.");
          }
        }

        throw new Error(res.error.message || "Could not sync products.");
      }
      const result = res.data as { success: boolean; productCount: number };

      setConnection((prev) =>
        prev
          ? { ...prev, last_synced_at: new Date().toISOString(), product_count: result.productCount }
          : prev
      );
      toast({ title: "Sync complete", description: `${result.productCount} products synced.` });
      return true;
    } catch (e: any) {
      console.error("Sync error:", e);
      toast({ title: "Sync failed", description: e.message || "Could not sync products.", variant: "destructive" });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, toast]);

  // Auto-sync after first successful connection
  useEffect(() => {
    if (justConnected && connection && !isSyncing) {
      setJustConnected(false);
      sync();
    }
  }, [justConnected, connection, isSyncing, sync]);

  const disconnect = useCallback(async () => {
    if (!user || !connection) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Best-effort: remove widget snippet from Shopify theme
      try {
        await supabase.functions.invoke("shopify-uninstall-widget", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } catch (uninstallErr) {
        console.warn("Could not uninstall widget from Shopify theme:", uninstallErr);
      }
      // Delete all product cards imported from Shopify
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("product_cards")
        .delete()
        .eq("user_id", user.id)
        .not("shopify_product_id", "is", null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("shopify_connections")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setConnection(null);
      toast({ title: "Disconnesso", description: "Store Shopify scollegato e widget rimosso." });
    } catch (e: any) {
      console.error("Disconnect error:", e);
      toast({ title: "Errore", description: "Impossibile disconnettere lo store.", variant: "destructive" });
    }
  }, [user, connection, toast]);

  return { connection, isLoading, isSyncing, isConnecting, connect, connectOAuth, sync, disconnect };
};
