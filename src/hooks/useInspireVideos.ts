import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface InspireVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  source: "manual" | "instagram" | "tiktok";
  sortOrder: number;
  linkedProductIds: string[];
}

export const useInspireVideos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<InspireVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load videos with their linked products
  useEffect(() => {
    const load = async () => {
      if (!user) {
        setVideos([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data: videosData, error: videosError } = await (supabase
          .from("inspire_videos") as any)
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (videosError) throw videosError;

        if (!videosData || videosData.length === 0) {
          setVideos([]);
          setIsLoading(false);
          return;
        }

        // Fetch linked products for all videos
        const videoIds = videosData.map((v: any) => v.id);
        const { data: linksData } = await (supabase
          .from("inspire_video_products") as any)
          .select("video_id, product_card_id")
          .in("video_id", videoIds)
          .order("sort_order", { ascending: true });

        const linksByVideo: Record<string, string[]> = {};
        (linksData || []).forEach((l: any) => {
          if (!linksByVideo[l.video_id]) linksByVideo[l.video_id] = [];
          linksByVideo[l.video_id].push(l.product_card_id);
        });

        setVideos(
          videosData.map((v: any) => ({
            id: v.id,
            videoUrl: v.video_url,
            thumbnailUrl: v.thumbnail_url,
            source: v.source as "manual" | "instagram" | "tiktok",
            sortOrder: v.sort_order,
            linkedProductIds: linksByVideo[v.id] || [],
          }))
        );
      } catch (error) {
        console.error("Error loading inspire videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]);

  const addVideo = useCallback(
    async (file: File) => {
      if (!user) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("inspire-videos")
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: "Error", description: "Failed to upload video.", variant: "destructive" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("inspire-videos")
        .getPublicUrl(filePath);

      const { data, error } = await (supabase
        .from("inspire_videos") as any)
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          source: "manual",
          sort_order: videos.length,
        })
        .select("*")
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to save video.", variant: "destructive" });
        return;
      }

      setVideos((prev) => [
        ...prev,
        {
          id: data.id,
          videoUrl: data.video_url,
          thumbnailUrl: data.thumbnail_url,
          source: data.source,
          sortOrder: data.sort_order,
          linkedProductIds: [],
        },
      ]);
    },
    [user, videos.length, toast]
  );

  const deleteVideo = useCallback(
    async (videoId: string) => {
      if (!user) return;

      const prev = videos;
      setVideos((v) => v.filter((x) => x.id !== videoId));

      const { error } = await (supabase
        .from("inspire_videos") as any)
        .delete()
        .eq("id", videoId)
        .eq("user_id", user.id);

      if (error) {
        setVideos(prev);
        toast({ title: "Error", description: "Failed to delete video.", variant: "destructive" });
      }
    },
    [user, videos, toast]
  );

  const updateLinkedProducts = useCallback(
    async (videoId: string, productIds: string[]) => {
      if (!user) return;

      // Optimistic update
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, linkedProductIds: productIds } : v))
      );

      // Delete existing links, then insert new ones
      await (supabase.from("inspire_video_products") as any)
        .delete()
        .eq("video_id", videoId);

      if (productIds.length > 0) {
        const { error } = await (supabase
          .from("inspire_video_products") as any)
          .insert(
            productIds.map((pid, i) => ({
              video_id: videoId,
              product_card_id: pid,
              sort_order: i,
            }))
          );

        if (error) {
          toast({ title: "Error", description: "Failed to link products.", variant: "destructive" });
        }
      }
    },
    [user, toast]
  );

  return {
    videos,
    isLoading,
    addVideo,
    deleteVideo,
    updateLinkedProducts,
  };
};
