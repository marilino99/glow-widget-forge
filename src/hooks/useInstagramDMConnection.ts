import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface InstagramDMConnection {
  id: string;
  instagram_username: string | null;
  instagram_user_id: string;
  connected_at: string;
}

export const useInstagramDMConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<InstagramDMConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("instagram_connected") === "true";
    const igUsername = params.get("ig_username");
    const errorCode = params.get("instagram_error");

    if (connected) {
      toast({
        title: "Instagram connesso!",
        description: igUsername
          ? `Account @${igUsername} collegato con successo.`
          : "Account Instagram collegato con successo.",
      });
    }

    if (errorCode) {
      const errorMessages: Record<string, string> = {
        token_exchange: "Errore nello scambio del token. Riprova.",
        pages_fetch: "Impossibile recuperare le pagine Facebook. Verifica i permessi.",
        no_pages: "Nessuna pagina Facebook trovata. Collega prima una pagina al tuo account.",
        no_instagram: "Nessun account Instagram Business trovato collegato alle tue pagine Facebook.",
        db_save: "Errore nel salvataggio della connessione. Riprova.",
        internal: "Errore interno. Riprova.",
      };
      toast({
        title: "Errore connessione Instagram",
        description: errorMessages[errorCode] || "Errore sconosciuto.",
        variant: "destructive",
      });
    }

    if (connected || errorCode || igUsername) {
      const url = new URL(window.location.href);
      url.searchParams.delete("instagram_connected");
      url.searchParams.delete("ig_username");
      url.searchParams.delete("instagram_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [toast]);

  // Load existing connection
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
          .from("instagram_connections")
          .select("id, instagram_username, instagram_user_id, connected_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setConnection(data);
      } catch (e) {
        console.error("Error loading Instagram DM connection:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const connectOAuth = useCallback(async () => {
    if (!user) return;
    setIsConnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("instagram-oauth-start", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;
      const { url } = res.data as { url: string };

      if (url) {
        const isEmbeddedPreview = window.top !== window;

        if (isEmbeddedPreview) {
          const popup = window.open(url, "_blank", "noopener,noreferrer");

          if (!popup) {
            throw new Error("Consenti i popup e riprova il collegamento Instagram.");
          }

          toast({
            title: "Continua in una nuova scheda",
            description: "Instagram si apre fuori dal preview. Dopo l'autorizzazione torna qui e aggiorna la pagina.",
          });
          setIsConnecting(false);
          return;
        }

        window.location.href = url;
        return;
      }
      throw new Error("No authorization URL returned");
    } catch (e: any) {
      console.error("Instagram OAuth start error:", e);
      toast({
        title: "Errore",
        description: e.message || "Impossibile avviare la connessione Instagram.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  }, [user, toast]);

  const disconnect = useCallback(async () => {
    if (!user || !connection) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("instagram_connections")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setConnection(null);
      toast({ title: "Disconnesso", description: "Account Instagram scollegato." });
    } catch (e: any) {
      console.error("Instagram disconnect error:", e);
      toast({
        title: "Errore",
        description: "Impossibile disconnettere l'account Instagram.",
        variant: "destructive",
      });
    }
  }, [user, connection, toast]);

  return { connection, isLoading, isConnecting, connectOAuth, disconnect };
};
