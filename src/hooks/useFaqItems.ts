import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { FaqItemData } from "@/types/faqItem";

export const useFaqItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqItems, setFaqItems] = useState<FaqItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load FAQ items from database
  useEffect(() => {
    const loadFaqItems = async () => {
      if (!user) {
        setFaqItems([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("faq_items")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data) {
          setFaqItems(
            data.map((item) => ({
              id: item.id,
              question: item.question,
              answer: item.answer,
              sortOrder: item.sort_order,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading FAQ items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaqItems();
  }, [user]);

  const addFaqItem = useCallback(async () => {
    if (!user) return;

    const newSortOrder = faqItems.length;
    const newItem: FaqItemData = {
      id: crypto.randomUUID(),
      question: "",
      answer: "",
      sortOrder: newSortOrder,
    };

    // Optimistically update UI
    setFaqItems((prev) => [...prev, newItem]);

    try {
      const { error } = await supabase.from("faq_items").insert({
        id: newItem.id,
        user_id: user.id,
        question: newItem.question,
        answer: newItem.answer,
        sort_order: newItem.sortOrder,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error adding FAQ item:", error);
      // Revert optimistic update
      setFaqItems((prev) => prev.filter((item) => item.id !== newItem.id));
      toast({
        title: "Error",
        description: "Failed to add FAQ item.",
        variant: "destructive",
      });
    }
  }, [user, faqItems.length, toast]);

  const updateFaqItem = useCallback(
    async (itemId: string, updates: Partial<FaqItemData>) => {
      if (!user) return;

      // Optimistically update UI
      setFaqItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );

      try {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.question !== undefined) dbUpdates.question = updates.question;
        if (updates.answer !== undefined) dbUpdates.answer = updates.answer;
        if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

        const { error } = await supabase
          .from("faq_items")
          .update(dbUpdates)
          .eq("id", itemId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating FAQ item:", error);
        toast({
          title: "Error",
          description: "Failed to update FAQ item.",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  const deleteFaqItem = useCallback(
    async (itemId: string) => {
      if (!user) return;

      const itemToDelete = faqItems.find((item) => item.id === itemId);
      if (!itemToDelete) return;

      // Optimistically update UI
      setFaqItems((prev) => prev.filter((item) => item.id !== itemId));

      try {
        const { error } = await supabase
          .from("faq_items")
          .delete()
          .eq("id", itemId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Deleted",
          description: "FAQ item removed.",
        });
      } catch (error) {
        console.error("Error deleting FAQ item:", error);
        // Revert optimistic update
        setFaqItems((prev) => [...prev, itemToDelete].sort((a, b) => a.sortOrder - b.sortOrder));
        toast({
          title: "Error",
          description: "Failed to delete FAQ item.",
          variant: "destructive",
        });
      }
    },
    [user, faqItems, toast]
  );

  return {
    faqItems,
    isLoading,
    addFaqItem,
    updateFaqItem,
    deleteFaqItem,
  };
};
