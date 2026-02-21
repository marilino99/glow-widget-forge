import { useState } from "react";
import { ArrowLeft, Lock, MessageSquare, PanelBottom, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface WidgetTemplate {
  id: string;
  name: string;
  isPro: boolean;
  theme: "light" | "dark";
  color: string;
  backgroundType: "solid" | "gradient" | "image";
  sayHello: string;
}

const templates: WidgetTemplate[] = [
  {
    id: "minimal-light",
    name: "Minimal Light",
    isPro: false,
    theme: "light",
    color: "gray",
    backgroundType: "solid",
    sayHello: "Hi there! How can we help?",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    isPro: false,
    theme: "dark",
    color: "blue",
    backgroundType: "gradient",
    sayHello: "Welcome aboard! 🚀",
  },
  {
    id: "sunset-vibes",
    name: "Sunset Vibes",
    isPro: false,
    theme: "dark",
    color: "orange",
    backgroundType: "gradient",
    sayHello: "Hey! What can we do for you? 🌅",
  },
  {
    id: "black-friday",
    name: "Black Friday",
    isPro: true,
    theme: "dark",
    color: "red",
    backgroundType: "solid",
    sayHello: "Don't miss our deals! 🔥",
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    isPro: true,
    theme: "dark",
    color: "yellow",
    backgroundType: "solid",
    sayHello: "Welcome to our exclusive store ✨",
  },
  {
    id: "nature-green",
    name: "Nature Green",
    isPro: true,
    theme: "light",
    color: "green",
    backgroundType: "gradient",
    sayHello: "Hello! We're here to help 🌿",
  },
  {
    id: "neon-purple",
    name: "Neon Purple",
    isPro: true,
    theme: "dark",
    color: "purple",
    backgroundType: "gradient",
    sayHello: "Hey! Let's chat 💜",
  },
  {
    id: "coral-pink",
    name: "Coral Pink",
    isPro: true,
    theme: "dark",
    color: "pink",
    backgroundType: "gradient",
    sayHello: "Hi! Ask us anything 🌸",
  },
];

const colorMap: Record<string, string> = {
  gray: "bg-gray-400",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  red: "bg-red-600",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const gradientMap: Record<string, string> = {
  gray: "from-gray-300 to-gray-500",
  blue: "from-blue-400 to-blue-700",
  orange: "from-orange-400 to-red-500",
  red: "from-red-500 to-red-900",
  yellow: "from-yellow-400 to-amber-600",
  green: "from-green-400 to-emerald-600",
  purple: "from-purple-400 to-purple-700",
  pink: "from-pink-400 to-rose-600",
};

interface TemplatesPanelProps {
  onBack: () => void;
  isPro: boolean;
  onUpgrade: () => void;
  onApplyTemplate: (template: WidgetTemplate) => void;
  widgetType: "popup" | "bottom-bar";
  onWidgetTypeChange: (type: "popup" | "bottom-bar") => void;
  hasGoogleBusiness?: boolean;
  googleReviewsEnabled?: boolean;
  onGoogleReviewsToggle?: (enabled: boolean) => void;
  onOpenGoogleReviews?: () => void;
}

const TemplatesPanel = ({ onBack, isPro, onUpgrade, onApplyTemplate, widgetType, onWidgetTypeChange, hasGoogleBusiness, googleReviewsEnabled, onGoogleReviewsToggle, onOpenGoogleReviews }: TemplatesPanelProps) => {
  const [confirmTemplate, setConfirmTemplate] = useState<WidgetTemplate | null>(null);

  const handleClick = (template: WidgetTemplate) => {
    if (template.isPro && !isPro) {
      onUpgrade();
      return;
    }
    setConfirmTemplate(template);
  };

  const handleConfirm = () => {
    if (confirmTemplate) {
      onApplyTemplate(confirmTemplate);
      setConfirmTemplate(null);
      onBack();
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-[hsl(260,30%,97%)] to-[hsl(270,40%,94%)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Templates</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Widget Type Selector */}
        <div className="pb-4">
          <p className="mb-2 text-sm font-medium text-foreground">Widget type</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onWidgetTypeChange("popup")}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                widgetType === "popup"
                  ? "border-foreground bg-card shadow-sm"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <MessageSquare className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Popup</span>
            </button>
            <button
              onClick={() => onWidgetTypeChange("bottom-bar")}
              className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                widgetType === "bottom-bar"
                  ? "border-foreground bg-card shadow-sm"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <PanelBottom className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Bottom Bar</span>
            </button>
          </div>
        </div>

        {/* Google Reviews add-on */}
        <div className="pt-2">
          <p className="mb-2 text-sm font-medium text-foreground">Add-ons</p>
          <button
            onClick={onOpenGoogleReviews}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[hsl(0_0%_93%)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Star className="h-4 w-4 text-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">Google reviews</span>
            {hasGoogleBusiness && onGoogleReviewsToggle && (
              <span onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={googleReviewsEnabled}
                  onChange={(e) => onGoogleReviewsToggle(e.target.checked)}
                  className="h-4 w-4 rounded accent-foreground"
                />
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmTemplate} onOpenChange={() => setConfirmTemplate(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-8 text-center [&>button]:hidden border-0 shadow-xl" overlayClassName="bg-black/10 backdrop-blur-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-medium text-center text-foreground">
              Apply "{confirmTemplate?.name}"?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              This will override your current theme, color, background, and welcome message.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 mt-2">
            <Button
              onClick={handleConfirm}
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 py-6 text-base font-normal"
            >
              Apply template
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmTemplate(null)}
              className="w-full rounded-full py-6 text-base font-normal sm:mt-0"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesPanel;
