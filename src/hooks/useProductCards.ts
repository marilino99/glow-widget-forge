import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { ProductCardData } from "@/types/productCard";

export const useProductCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [productCards, setProductCards] = useState<ProductCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load product cards from database
  useEffect(() => {
    const loadProductCards = async () => {
      if (!user) {
        setProductCards([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("product_cards")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (data) {
          setProductCards(
            data.map((card) => ({
              id: card.id,
              title: card.title,
              subtitle: card.subtitle || undefined,
              productUrl: card.product_url || undefined,
              imageUrl: card.image_url || undefined,
              price: card.price || undefined,
              oldPrice: card.old_price || undefined,
              promoBadge: (card.promo_badge as ProductCardData["promoBadge"]) || undefined,
              isLoading: false,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading product cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductCards();
  }, [user]);

  // Add a new product card
  const addProductCard = useCallback(
    async (card: ProductCardData) => {
      if (!user) return;

      // Optimistically add to UI
      setProductCards((prev) => [...prev, card]);

      try {
        const { error } = await supabase.from("product_cards").insert({
          id: card.id,
          user_id: user.id,
          title: card.title,
          subtitle: card.subtitle || null,
          product_url: card.productUrl || null,
          image_url: card.imageUrl || null,
          price: card.price || null,
          old_price: card.oldPrice || null,
          promo_badge: card.promoBadge || null,
          sort_order: productCards.length,
        });

        if (error) throw error;

        // Update to remove loading state
        setProductCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isLoading: false } : c))
        );
      } catch (error) {
        console.error("Error adding product card:", error);
        // Remove from UI on error
        setProductCards((prev) => prev.filter((c) => c.id !== card.id));
        toast({
          title: "Error",
          description: "Failed to add product card. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, productCards.length, toast]
  );

  // Update a product card
  const updateProductCard = useCallback(
    async (cardId: string, updates: Partial<ProductCardData>) => {
      if (!user) return;

      // Optimistically update UI
      setProductCards((prev) =>
        prev.map((card) => (card.id === cardId ? { ...card, ...updates } : card))
      );

      try {
        // Build update object with only the fields that are present in updates
        const updateData: Record<string, unknown> = {};
        
        if ('title' in updates) updateData.title = updates.title;
        if ('subtitle' in updates) updateData.subtitle = updates.subtitle || null;
        if ('productUrl' in updates) updateData.product_url = updates.productUrl || null;
        if ('imageUrl' in updates) updateData.image_url = updates.imageUrl || null;
        if ('price' in updates) updateData.price = updates.price || null;
        if ('oldPrice' in updates) updateData.old_price = updates.oldPrice || null;
        if ('promoBadge' in updates) updateData.promo_badge = updates.promoBadge || null;

        if (Object.keys(updateData).length === 0) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase
          .from("product_cards") as any)
          .update(updateData)
          .eq("id", cardId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating product card:", error);
        toast({
          title: "Error",
          description: "Failed to update product card. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  // Delete a product card
  const deleteProductCard = useCallback(
    async (cardId: string) => {
      if (!user) return;

      // Optimistically remove from UI
      const previousCards = productCards;
      setProductCards((prev) => prev.filter((card) => card.id !== cardId));

      try {
        const { error } = await supabase
          .from("product_cards")
          .delete()
          .eq("id", cardId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting product card:", error);
        // Restore on error
        setProductCards(previousCards);
        toast({
          title: "Error",
          description: "Failed to delete product card. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, productCards, toast]
  );

  return {
    productCards,
    isLoading,
    addProductCard,
    updateProductCard,
    deleteProductCard,
  };
};
