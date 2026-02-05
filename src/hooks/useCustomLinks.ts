import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CustomLink {
  id: string;
  name: string;
  url: string;
  sort_order: number;
}

export const useCustomLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinks = async () => {
    if (!user) {
      setLinks([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("custom_links")
        .select("id, name, url, sort_order")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching custom links:", error);
      toast({
        title: "Error",
        description: "Failed to load custom links",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  const addLink = async (name: string, url: string) => {
    if (!user) return null;

    try {
      const maxSortOrder = links.length > 0 
        ? Math.max(...links.map(l => l.sort_order)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("custom_links")
        .insert({
          user_id: user.id,
          name,
          url,
          sort_order: maxSortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      
      setLinks([...links, data]);
      toast({
        title: "Link saved",
        description: "Your custom link has been added",
      });
      return data;
    } catch (error) {
      console.error("Error adding custom link:", error);
      toast({
        title: "Error",
        description: "Failed to save custom link",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateLink = async (id: string, updates: Partial<Pick<CustomLink, "name" | "url">>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("custom_links")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setLinks(links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      ));
      return true;
    } catch (error) {
      console.error("Error updating custom link:", error);
      toast({
        title: "Error",
        description: "Failed to update custom link",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteLink = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("custom_links")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== id));
      toast({
        title: "Link deleted",
        description: "Your custom link has been removed",
      });
      return true;
    } catch (error) {
      console.error("Error deleting custom link:", error);
      toast({
        title: "Error",
        description: "Failed to delete custom link",
        variant: "destructive",
      });
      return false;
    }
  };

  const reorderLinks = async (reorderedLinks: CustomLink[]) => {
    if (!user) return false;

    try {
      const updates = reorderedLinks.map((link, index) => ({
        id: link.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("custom_links")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id)
          .eq("user_id", user.id);
      }

      setLinks(reorderedLinks.map((link, index) => ({
        ...link,
        sort_order: index,
      })));
      return true;
    } catch (error) {
      console.error("Error reordering custom links:", error);
      return false;
    }
  };

  return {
    links,
    isLoading,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    refetch: fetchLinks,
  };
};
