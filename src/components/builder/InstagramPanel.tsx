import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Instagram, Plus, Trash2, GripVertical, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { InstagramPostData } from "@/types/instagramPost";

interface InstagramPanelProps {
  onBack: () => void;
  instagramEnabled: boolean;
  onInstagramToggle: (enabled: boolean) => void;
  instagramPosts: InstagramPostData[];
  onAddPost: (url: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onReorderPosts: (fromIndex: number, toIndex: number) => void;
}

const InstagramPanel = ({
  onBack,
  instagramEnabled,
  onInstagramToggle,
  instagramPosts,
  onAddPost,
  onDeletePost,
  onReorderPosts,
}: InstagramPanelProps) => {
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddPost = async () => {
    if (!newUrl.trim()) return;
    
    // Validate Instagram URL
    const isValidUrl = newUrl.includes("instagram.com/p/") || newUrl.includes("instagram.com/reel/");
    if (!isValidUrl) {
      return;
    }

    setIsAdding(true);
    await onAddPost(newUrl.trim());
    setNewUrl("");
    setIsAdding(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderPosts(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const extractPostId = (url: string) => {
    const match = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      {/* Back button and header */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          <h2 className="text-lg font-semibold">Instagram UGC</h2>
        </div>
        <Switch
          checked={instagramEnabled}
          onCheckedChange={onInstagramToggle}
        />
      </div>

      {instagramEnabled && (
        <>
          {/* Add new post */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Add Instagram post URL
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://instagram.com/p/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPost()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddPost} 
                size="icon"
                disabled={isAdding || !newUrl.trim()}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste links to Instagram posts or reels to display them in your widget
            </p>
          </div>

          {/* Posts list */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              Posts ({instagramPosts.length})
            </Label>
            
            {instagramPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Instagram className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No posts added yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {instagramPosts.map((post, index) => (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-all ${
                      draggedIndex === index
                        ? "opacity-50 border-primary"
                        : dragOverIndex === index
                        ? "border-primary border-2"
                        : "border-border"
                    }`}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {post.thumbnailUrl ? (
                        <img 
                          src={post.thumbnailUrl} 
                          alt="Post thumbnail"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Instagram className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Post info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {post.authorName || extractPostId(post.url) || "Instagram Post"}
                      </p>
                      {post.caption && (
                        <p className="text-xs text-muted-foreground truncate">
                          {post.caption}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(post.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InstagramPanel;
