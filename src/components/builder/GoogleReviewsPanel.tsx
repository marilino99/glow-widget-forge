import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Eye, Clock, HelpCircle, Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface GoogleReviewsPanelProps {
  onBack: () => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const GoogleReviewsPanel = ({ onBack }: GoogleReviewsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"search" | "link">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<PlacePrediction | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.length < 2 || selectedBusiness) {
      setPredictions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("google-places-autocomplete", {
          body: { query: searchQuery },
        });
        if (error) throw error;
        setPredictions(data?.predictions || []);
      } catch (err) {
        console.error("Autocomplete error:", err);
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedBusiness]);

  const handleSelectBusiness = (prediction: PlacePrediction) => {
    setSelectedBusiness(prediction);
    setSearchQuery(prediction.structured_formatting?.main_text || prediction.description);
    setPredictions([]);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (selectedBusiness) setSelectedBusiness(null);
  };

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
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Enter full name or website address"
                className="bg-muted border-0 pr-9"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Predictions dropdown */}
              {predictions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                  {predictions.map((p) => (
                    <button
                      key={p.place_id}
                      onClick={() => handleSelectBusiness(p)}
                      className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    >
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {p.structured_formatting?.main_text || p.description}
                        </p>
                        {p.structured_formatting?.secondary_text && (
                          <p className="text-xs text-muted-foreground truncate">
                            {p.structured_formatting.secondary_text}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedBusiness && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground truncate">
                  {selectedBusiness.description}
                </span>
              </div>
            )}
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
