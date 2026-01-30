import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { InstagramPostData } from "@/types/instagramPost";

export const useInstagramPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [instagramPosts, setInstagramPosts] = useState<InstagramPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load posts from database
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) {
        setInstagramPosts([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("instagram_posts")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        const posts: InstagramPostData[] = (data || []).map((post) => ({
          id: post.id,
          url: post.url,
          thumbnailUrl: post.thumbnail_url,
          caption: post.caption,
          authorName: post.author_name,
          createdAt: post.created_at,
          sortOrder: post.sort_order,
        }));

        setInstagramPosts(posts);
      } catch (error) {
        console.error("Error loading Instagram posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [user]);

  const addInstagramPost = useCallback(async (url: string) => {
    if (!user) return;

    const maxSortOrder = instagramPosts.length > 0 
      ? Math.max(...instagramPosts.map(p => p.sortOrder)) 
      : -1;

    const newPost: InstagramPostData = {
      id: crypto.randomUUID(),
      url,
      createdAt: new Date().toISOString(),
      sortOrder: maxSortOrder + 1,
    };

    // Optimistic update
    setInstagramPosts(prev => [...prev, newPost]);

    try {
      // Fetch oEmbed data via edge function
      const { data: oembedData, error: oembedError } = await supabase.functions.invoke('instagram-oembed', {
        body: { url }
      });

      if (!oembedError && oembedData) {
        newPost.thumbnailUrl = oembedData.thumbnail_url;
        newPost.caption = oembedData.title;
        newPost.authorName = oembedData.author_name;
      }

      const { error } = await supabase
        .from("instagram_posts")
        .insert({
          id: newPost.id,
          user_id: user.id,
          url: newPost.url,
          thumbnail_url: newPost.thumbnailUrl,
          caption: newPost.caption,
          author_name: newPost.authorName,
          sort_order: newPost.sortOrder,
        });

      if (error) throw error;

      // Update with fetched data
      setInstagramPosts(prev => 
        prev.map(p => p.id === newPost.id ? newPost : p)
      );

      toast({
        title: "Post added",
        description: "Instagram post has been added to your widget.",
      });
    } catch (error) {
      console.error("Error adding Instagram post:", error);
      // Revert optimistic update
      setInstagramPosts(prev => prev.filter(p => p.id !== newPost.id));
      toast({
        title: "Error",
        description: "Failed to add Instagram post. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, instagramPosts, toast]);

  const deleteInstagramPost = useCallback(async (postId: string) => {
    if (!user) return;

    const postToDelete = instagramPosts.find(p => p.id === postId);
    if (!postToDelete) return;

    // Optimistic update
    setInstagramPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const { error } = await supabase
        .from("instagram_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Post removed",
        description: "Instagram post has been removed.",
      });
    } catch (error) {
      console.error("Error deleting Instagram post:", error);
      // Revert optimistic update
      setInstagramPosts(prev => [...prev, postToDelete].sort((a, b) => a.sortOrder - b.sortOrder));
      toast({
        title: "Error",
        description: "Failed to remove post. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, instagramPosts, toast]);

  const reorderInstagramPosts = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!user || fromIndex === toIndex) return;

    const newPosts = [...instagramPosts];
    const [movedPost] = newPosts.splice(fromIndex, 1);
    newPosts.splice(toIndex, 0, movedPost);

    // Update sort orders
    const updatedPosts = newPosts.map((post, index) => ({
      ...post,
      sortOrder: index,
    }));

    // Optimistic update
    setInstagramPosts(updatedPosts);

    try {
      await Promise.all(
        updatedPosts.map((post) =>
          supabase
            .from("instagram_posts")
            .update({ sort_order: post.sortOrder })
            .eq("id", post.id)
            .eq("user_id", user.id)
        )
      );
    } catch (error) {
      console.error("Error reordering Instagram posts:", error);
      setInstagramPosts(instagramPosts);
      toast({
        title: "Error",
        description: "Failed to reorder posts. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, instagramPosts, toast]);

  return {
    instagramPosts,
    isLoading,
    addInstagramPost,
    deleteInstagramPost,
    reorderInstagramPosts,
  };
};
