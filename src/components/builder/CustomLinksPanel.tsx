import { useState } from "react";
import { ArrowLeft, FileText, Calendar, Clapperboard, Link2, Globe, Video, ShoppingBag, HelpCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomLinksPanelProps {
  onBack: () => void;
}

// Icons for the scrolling inspiration carousel
const inspirationIcons = [
  { Icon: FileText, label: "Docs" },
  { Icon: Calendar, label: "Calendar" },
  { Icon: Clapperboard, label: "Video" },
  { Icon: Link2, label: "Links" },
  { Icon: Globe, label: "Website" },
  { Icon: Video, label: "YouTube" },
  { Icon: ShoppingBag, label: "Shop" },
  { Icon: HelpCircle, label: "Support" },
  { Icon: BookOpen, label: "Guide" },
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

      {/* Scrolling icons inspiration */}
      <div className="border-b border-border py-6 overflow-hidden">
        <div className="relative">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling container */}
          <div className="flex animate-scroll-left">
            {/* Double the icons for seamless loop */}
            {[...inspirationIcons, ...inspirationIcons].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center mx-4 min-w-[60px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                  <item.Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="mt-2 text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create link section */}
      <div className="p-6">
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
    </div>
  );
};

export default CustomLinksPanel;
