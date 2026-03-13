import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendlyConnection {
  id: string;
  scheduling_url: string | null;
  created_at: string;
}

export function useCalendlyConnection() {
  const [connection, setConnection] = useState<CalendlyConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("calendly_connections")
        .select("id, scheduling_url, created_at")
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (err) {
      console.error("Error fetching calendly connection:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  // Check URL params for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendly_connected") === "true") {
      toast.success("Calendly connected successfully!");
      fetchConnection();
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("calendly_connected");
      window.history.replaceState({}, "", url.toString());
    }
    if (params.get("calendly_error")) {
      toast.error("Failed to connect Calendly. Please try again.");
      const url = new URL(window.location.href);
      url.searchParams.delete("calendly_error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [fetchConnection]);

  const connectOAuth = useCallback(async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("calendly-oauth-start");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Calendly OAuth start error:", err);
      toast.error("Failed to start Calendly connection");
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("calendly_connections")
        .delete()
        .eq("id", connection?.id ?? "");

      if (error) throw error;

      // Also disable in widget config
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("widget_configurations")
          .update({ calendly_enabled: false, calendly_event_url: null })
          .eq("user_id", user.id);
      }

      setConnection(null);
      toast.success("Calendly disconnected");
    } catch (err) {
      console.error("Calendly disconnect error:", err);
      toast.error("Failed to disconnect Calendly");
    }
  }, [connection]);

  return {
    connection,
    isLoading,
    isConnecting,
    isConnected: !!connection,
    connectOAuth,
    disconnect,
  };
}
