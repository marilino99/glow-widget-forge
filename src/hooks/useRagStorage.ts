import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const PLAN_LIMITS: Record<string, number> = {
  free: 1 * 1024 * 1024,       // 1 MB
  starter: 10 * 1024 * 1024,   // 10 MB (Plus)
  pro: 100 * 1024 * 1024,      // 100 MB (Business)
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const useRagStorage = (plan: string = "free") => {
  const { user } = useAuth();
  const [usedBytes, setUsedBytes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const limitBytes = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchUsage = async () => {
      try {
        const { data, error } = await supabase
          .from("training_chunks")
          .select("content")
          .eq("user_id", user.id);

        if (error) throw error;

        const total = (data ?? []).reduce((sum, row) => sum + (row.content?.length ?? 0), 0);
        setUsedBytes(total);
      } catch (err) {
        console.error("Error fetching RAG storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  const usagePercent = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;

  return { usedBytes, limitBytes, usagePercent, isLoading };
};
