import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionState {
  plan: "free" | "pro";
  subscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    subscribed: false,
    subscriptionEnd: null,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ plan: "free", subscribed: false, subscriptionEnd: null, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        plan: data.plan || "free",
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Error checking subscription:", err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const startCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { returnUrl: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error starting checkout:", err);
    }
  };

  return { ...state, startCheckout, refreshSubscription: checkSubscription };
};
