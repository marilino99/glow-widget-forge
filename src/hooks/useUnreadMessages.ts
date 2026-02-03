import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("unread_count")
        .eq("widget_owner_id", user.id)
        .gt("unread_count", 0);

      if (!error && data) {
        setHasUnread(data.length > 0);
      }
    };

    fetchUnreadCount();

    // Subscribe to conversation changes
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `widget_owner_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { hasUnread };
};
