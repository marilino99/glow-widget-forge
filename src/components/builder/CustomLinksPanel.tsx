import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const handleCreateLink = () => {
    if (!url.trim()) return;
    // TODO: Save link to database
    console.log("Creating link:", url);
    setUrl("");
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

      {/* Scrolling inspiration cards */}
      <div className="py-6 overflow-hidden">
        <div className="relative">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="flex animate-scroll-left">
            {/* Double the items for seamless loop */}
            {[...inspirationItems, ...inspirationItems].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 mx-2 min-w-[200px] rounded-full bg-muted/50 px-4 py-3"
              >
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-medium text-muted-foreground flex-1 whitespace-nowrap">
                  {item.label}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLinksPanel;
