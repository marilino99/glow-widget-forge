import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SizePositionPanelProps {
  onBack: () => void;
  widgetPosition: "left" | "right";
  onWidgetPositionChange: (position: "left" | "right") => void;
}

const SizePositionPanel = ({ onBack, widgetPosition, onWidgetPositionChange }: SizePositionPanelProps) => {
  const [buttonSize, setButtonSize] = useState("medium");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Widget button</h2>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-0">
        {/* Button position */}
        <div className="pb-8">
          <h3 className="text-base font-semibold text-foreground">Button position</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose whether the chat button appears on the <strong className="text-foreground">left</strong> or <strong className="text-foreground">right</strong> side of your site.
          </p>
          <RadioGroup
            value={widgetPosition}
            onValueChange={(v) => onWidgetPositionChange(v as "left" | "right")}
            className="mt-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="left" id="pos-left" className="h-5 w-5 border-muted-foreground/40 text-primary" />
              <Label htmlFor="pos-left" className="text-sm font-medium text-foreground cursor-pointer">Left</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="right" id="pos-right" className="h-5 w-5 border-muted-foreground/40 text-primary" />
              <Label htmlFor="pos-right" className="text-sm font-medium text-foreground cursor-pointer">Right</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t border-border" />

        {/* Button size */}
        <div className="pt-8">
          <h3 className="text-base font-semibold text-foreground">Button size</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust the button's size to fit your layout.
          </p>
          <RadioGroup
            value={buttonSize}
            onValueChange={setButtonSize}
            className="mt-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="small" id="size-small" className="h-5 w-5 border-muted-foreground/40 text-primary" />
              <Label htmlFor="size-small" className="text-sm font-medium text-foreground cursor-pointer">
                Small (40 px)
              </Label>
              <span className="text-sm italic text-muted-foreground">(Compact size, minimal presence)</span>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="medium" id="size-medium" className="h-5 w-5 border-muted-foreground/40 text-primary" />
              <Label htmlFor="size-medium" className="text-sm font-medium text-foreground cursor-pointer">
                Medium (60 px)
              </Label>
              <span className="text-sm italic text-muted-foreground">(Balanced size for visibility and usability—default option)</span>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="large" id="size-large" className="h-5 w-5 border-muted-foreground/40 text-primary" />
              <Label htmlFor="size-large" className="text-sm font-medium text-foreground cursor-pointer">
                Large (80 px)
              </Label>
              <span className="text-sm italic text-muted-foreground">(More prominent for high engagement)</span>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-8 border-t border-border" />
      </div>
    </div>
  );
};

export default SizePositionPanel;
