import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const FREE_LIMIT = 100;
const PRO_LIMIT = 10000;

interface SubscriptionState {
  plan: "free" | "pro";
  subscribed: boolean;
  subscriptionEnd: string | null;
  aiResponsesThisMonth: number;
  isLoading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    subscribed: false,
    subscriptionEnd: null,
    aiResponsesThisMonth: 0,
    isLoading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ plan: "free", subscribed: false, subscriptionEnd: null, aiResponsesThisMonth: 0, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setState({
        plan: data.plan || "free",
        subscribed: data.subscribed || false,
        subscriptionEnd: data.subscription_end || null,
        aiResponsesThisMonth: data.ai_responses_this_month ?? 0,
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

  const aiResponseLimit = state.plan === "pro" ? PRO_LIMIT : FREE_LIMIT;
  const usagePercent = aiResponseLimit > 0 ? (state.aiResponsesThisMonth / aiResponseLimit) * 100 : 0;
  const isApproachingLimit = usagePercent >= 70;
  const isAtLimit = state.aiResponsesThisMonth >= aiResponseLimit;

  const startCheckout = async (billingInterval: "month" | "year" = "month") => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { returnUrl: window.location.origin, billingInterval },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error starting checkout:", err);
    }
  };

  return {
    ...state,
    aiResponseLimit,
    usagePercent,
    isApproachingLimit,
    isAtLimit,
    startCheckout,
    refreshSubscription: checkSubscription,
  };
};
