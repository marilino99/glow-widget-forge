import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Trash2, Film, Package, Loader2 } from "lucide-react";
import { InspireVideo } from "@/hooks/useInspireVideos";
import { ProductCardData } from "@/types/productCard";

interface InspireMePanelProps {
  onBack: () => void;
  inspireEnabled: boolean;
  onInspireToggle: (enabled: boolean) => void;
  videos: InspireVideo[];
  onAddVideo: (file: File) => Promise<void>;
  onDeleteVideo: (videoId: string) => void;
  onUpdateLinkedProducts: (videoId: string, productIds: string[]) => void;
  productCards: ProductCardData[];
}

const InspireMePanel = ({
  onBack,
  inspireEnabled,
  onInspireToggle,
  videos,
  onAddVideo,
  onDeleteVideo,
  onUpdateLinkedProducts,
  productCards,
}: InspireMePanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await onAddVideo(file);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleProduct = (videoId: string, productId: string, currentIds: string[]) => {
    const newIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];
    onUpdateLinkedProducts(videoId, newIds);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-foreground" />
          <span className="font-semibold text-sm text-foreground">Inspire Me</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="inspire-toggle" className="text-sm font-medium">
            Enable Inspire Me
          </Label>
          <Switch
            id="inspire-toggle"
            checked={inspireEnabled}
            onCheckedChange={onInspireToggle}
          />
        </div>

        {inspireEnabled && (
          <>
            {/* Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>

            {/* Video list */}
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div key={video.id} className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                  {/* Video preview */}
                  <div className="relative aspect-[9/16] max-h-[200px] bg-black">
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => onDeleteVideo(video.id)}
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/50 text-white capitalize">
                        {video.source}
                      </span>
                    </div>
                  </div>

                  {/* Product tagging */}
                  <div className="p-3">
                    <button
                      onClick={() =>
                        setExpandedVideoId(expandedVideoId === video.id ? null : video.id)
                      }
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>
                        {video.linkedProductIds.length > 0
                          ? `${video.linkedProductIds.length} product${video.linkedProductIds.length > 1 ? "s" : ""} linked`
                          : "Link products"}
                      </span>
                    </button>

                    {expandedVideoId === video.id && productCards.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto">
                        {productCards.map((card) => (
                          <label
                            key={card.id}
                            className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={video.linkedProductIds.includes(card.id)}
                              onCheckedChange={() =>
                                toggleProduct(video.id, card.id, video.linkedProductIds)
                              }
                            />
                            {card.imageUrl && (
                              <img
                                src={card.imageUrl}
                                alt=""
                                className="w-6 h-6 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <span className="truncate text-foreground">{card.title}</span>
                            {card.price && (
                              <span className="ml-auto text-muted-foreground flex-shrink-0">
                                {card.price}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}

                    {expandedVideoId === video.id && productCards.length === 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        No products available. Add products first.
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {videos.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Film className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No videos yet</p>
                  <p className="text-xs mt-1">Upload a video to get started</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InspireMePanel;
