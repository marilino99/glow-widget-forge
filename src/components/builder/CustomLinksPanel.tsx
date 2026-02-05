import { useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Calendar, Clapperboard, X as XIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomLink {
  id: string;
  title: string;
  url: string;
  icon: "document" | "calendar" | "video" | "social";
}

interface CustomLinksPanelProps {
  onBack: () => void;
}

// Mock data for demonstration - matches the screenshot
const mockLinks: CustomLink[] = [
  { id: "1", title: "Terms & Conditions", url: "https://example.com/terms", icon: "document" },
  { id: "2", title: "Schedule a call", url: "https://calendly.com/example", icon: "calendar" },
  { id: "3", title: "Watch video guide", url: "https://youtube.com/watch", icon: "video" },
  { id: "4", title: "Follow us on X", url: "https://x.com/example", icon: "social" },
];

const CustomLinksPanel = ({ onBack }: CustomLinksPanelProps) => {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<CustomLink[]>(mockLinks);

  const getIconForLink = (icon: CustomLink["icon"]) => {
    switch (icon) {
      case "document":
        return <FileText className="h-5 w-5 text-muted-foreground" />;
      case "calendar":
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
      case "video":
        return <Clapperboard className="h-5 w-5 text-muted-foreground" />;
      case "social":
        return (
          <div className="flex h-5 w-5 items-center justify-center">
            <XIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        );
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleCreateLink = () => {
    if (!url.trim()) return;
    
    // Determine icon based on URL content
    let icon: CustomLink["icon"] = "document";
    if (url.includes("calendly") || url.includes("calendar")) {
      icon = "calendar";
    } else if (url.includes("youtube") || url.includes("vimeo") || url.includes("video")) {
      icon = "video";
    } else if (url.includes("twitter") || url.includes("x.com") || url.includes("instagram") || url.includes("facebook")) {
      icon = "social";
    }

    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: extractTitleFromUrl(url),
      url: url.trim(),
      icon,
    };

    setLinks([...links, newLink]);
    setUrl("");
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace("www.", "");
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return "Custom Link";
    }
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId));
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6 pb-4">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-lg font-semibold text-foreground">Custom links</span>
        </button>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          Guide users to help centers, meeting scheduling, or social media. Paste the link below to add it to your widget.
        </p>
      </div>

      {/* Create link section */}
      <div className="border-b border-border p-6">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Create link</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Paste your URL here"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateLink();
              }
            }}
          />
          <Button 
            onClick={handleCreateLink}
            className="px-6"
          >
            Create
          </Button>
        </div>
      </div>

      {/* Links list */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`group flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 transition-all hover:bg-muted ${
                index === 0 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {getIconForLink(link.icon)}
                <span className={`text-sm font-medium ${index === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                  {link.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CustomLinksPanel;
