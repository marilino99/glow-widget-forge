import { useState } from "react";
import { ArrowLeft, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomLink {
  id: string;
  name: string;
  url: string;
}

interface CustomLinksPanelProps {
  onBack: () => void;
}

// Inspiration items with emojis - matches the screenshot style
const inspirationItems = [
  { emoji: "🍿", label: "Watch video guide" },
  { emoji: "𝕏", label: "Follow us on X" },
  { emoji: "📄", label: "Terms & Conditions" },
  { emoji: "📅", label: "Schedule a call" },
  { emoji: "🛒", label: "Visit our shop" },
  { emoji: "📚", label: "Read our guide" },
  { emoji: "💬", label: "Join Discord" },
  { emoji: "📧", label: "Contact support" },
];

const CustomLinksPanel = ({ onBack }: CustomLinksPanelProps) => {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<CustomLink[]>([]);

  const handleCreateLink = () => {
    if (!url.trim()) return;
    
    const newLink: CustomLink = {
      id: Date.now().toString(),
      name: "",
      url: url.trim(),
    };
    
    setLinks([...links, newLink]);
    setUrl("");
  };

  const handleUpdateLinkName = (id: string, name: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, name } : link
    ));
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleCancel = () => {
    setLinks([]);
  };

  const handleSave = () => {
    // TODO: Save links to database
    console.log("Saving links:", links);
    // For now, just clear the links after "saving"
    setLinks([]);
  };

  const hasLinks = links.length > 0;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
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
      <div className="px-6 pb-4">
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

      {/* Created links list */}
      {hasLinks ? (
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-start gap-2 rounded-xl border border-border bg-card p-4"
              >
                {/* Drag handle */}
                <div className="pt-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Name your link</label>
                    <Input
                      placeholder='e.g. "Schedule a call"'
                      value={link.name}
                      onChange={(e) => handleUpdateLinkName(link.id, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">URL</label>
                    <div className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground truncate">
                      {link.url}
                    </div>
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* Vertical scrolling inspiration cards */
        <div className="flex-1 flex items-start justify-center px-6 pt-6 pb-8">
          <div className="relative h-[280px] w-full overflow-hidden">
            {/* Gradient fade on top and bottom - larger for 2 faded items */}
            <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute left-0 right-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div className="flex flex-col animate-scroll-up">
              {/* Double the items for seamless loop */}
              {[...inspirationItems, ...inspirationItems].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 my-1.5 rounded-full bg-muted/50 px-4 py-3"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm font-medium text-muted-foreground flex-1 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer with Cancel/Save buttons */}
      {hasLinks && (
        <div className="flex justify-end gap-3 border-t border-border p-4">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomLinksPanel;
