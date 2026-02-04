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

        console.log("FAQ items loaded:", data?.length || 0, "items for user", user.id);

        if (data && data.length > 0) {
          setFaqItems(
            data.map((item) => ({
              id: item.id,
              question: item.question,
              answer: item.answer,
              sortOrder: item.sort_order,
            }))
          );
        } else {
          console.log("No FAQ items found, creating 2 default items...");
          // Create 2 default FAQ items for new users
          const defaultItems: FaqItemData[] = [
            { id: crypto.randomUUID(), question: "", answer: "", sortOrder: 0 },
            { id: crypto.randomUUID(), question: "", answer: "", sortOrder: 1 },
          ];
          
          setFaqItems(defaultItems);
          
          // Persist to database
          const insertResults = await Promise.all(
            defaultItems.map((item) =>
              supabase.from("faq_items").insert({
                id: item.id,
                user_id: user.id,
                question: item.question,
                answer: item.answer,
                sort_order: item.sortOrder,
              })
            )
          );
          
          const insertErrors = insertResults.filter(r => r.error);
          if (insertErrors.length > 0) {
            console.error("Error creating default FAQ items:", insertErrors.map(r => r.error));
          } else {
            console.log("Successfully created 2 default FAQ items");
          }
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

const reorderFaqItems = useCallback(
  async (fromIndex: number, toIndex: number) => {
    if (!user) return;

    const newItems = [...faqItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);

    // Update sort orders
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));

    // Optimistically update UI
    setFaqItems(updatedItems);

    try {
      // Update all items with new sort orders
      const updates = updatedItems.map((item) =>
        supabase
          .from("faq_items")
          .update({ sort_order: item.sortOrder })
          .eq("id", item.id)
          .eq("user_id", user.id)
      );

      const results = await Promise.all(updates);
      const hasError = results.some((r) => r.error);

      if (hasError) {
        throw new Error("Failed to update sort order");
      }
    } catch (error) {
      console.error("Error reordering FAQ items:", error);
      // Revert optimistic update
      setFaqItems(faqItems);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ items.",
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
    reorderFaqItems,
  };
};
