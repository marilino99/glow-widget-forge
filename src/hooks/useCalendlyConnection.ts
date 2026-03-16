import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface CalendlyConnection {
  id: string;
  scheduling_url: string | null;
  calendly_user_uri: string | null;
}

export const useCalendlyConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connection, setConnection] = useState<CalendlyConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("calendly_connected") === "true";

    if (connected) {
      toast({ title: "Calendly connected!", description: "Your Calendly account has been linked successfully." });

      const url = new URL(window.location.href);
      url.searchParams.delete("calendly_connected");
      window.history.replaceState({}, "", url.toString());
    }
  }, [toast]);

  // Load connection
  useEffect(() => {
    if (!user) {
      setConnection(null);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("calendly_connections")
          .select("id, scheduling_url, calendly_user_uri")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setConnection(data);
      } catch (e) {
        console.error("Error loading Calendly connection:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const connectOAuth = useCallback(async () => {
    if (!user) return false;
    setIsConnecting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("calendly-oauth-start", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (res.error) throw res.error;
      const { url } = res.data as { url: string };

      if (url) {
        window.location.href = url;
        return true;
      }
      throw new Error("No authorization URL returned");
    } catch (e: any) {
      console.error("Calendly OAuth start error:", e);
      toast({ title: "Error", description: e.message || "Could not start Calendly connection.", variant: "destructive" });
      setIsConnecting(false);
      return false;
    }
  }, [user, toast]);

  const disconnect = useCallback(async () => {
    if (!user || !connection) return;
    try {
      const { error } = await (supabase as any)
        .from("calendly_connections")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      // Also disable in widget config
      await (supabase as any)
        .from("widget_configurations")
        .update({ calendly_enabled: false, calendly_event_url: null })
        .eq("user_id", user.id);

      setConnection(null);
      toast({ title: "Disconnected", description: "Calendly account has been unlinked." });
    } catch (e: any) {
      console.error("Calendly disconnect error:", e);
      toast({ title: "Error", description: "Could not disconnect Calendly.", variant: "destructive" });
    }
  }, [user, connection, toast]);

  return { connection, isLoading, isConnecting, connectOAuth, disconnect };
};
