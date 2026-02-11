import { useState } from "react";
import { ChevronLeft, Eye, Clock, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoogleReviewsPanelProps {
  onBack: () => void;
}

const GoogleReviewsPanel = ({ onBack }: GoogleReviewsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"search" | "link">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkValue, setLinkValue] = useState("");

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Google reviews</h2>
      </div>

      <div className="border-t border-border" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Enhance your business's credibility and customer appeal by displaying Google Reviews right on your website!
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">Visible once per visit</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">Shows up for 8 seconds</span>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">Asks customer to leave a review</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "search" | "link")} className="mb-6">
          <TabsList className="w-full bg-muted">
            <TabsTrigger value="search" className="flex-1 text-sm">Search your business</TabsTrigger>
            <TabsTrigger value="link" className="flex-1 text-sm">Provide link</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "search" ? (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Search your business</h3>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter full name or website address"
              className="bg-muted border-0"
            />
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">Provide link</h3>
            <Input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="Paste your Google Reviews link"
              className="bg-muted border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleReviewsPanel;
