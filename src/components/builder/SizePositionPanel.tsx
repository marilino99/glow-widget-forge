import { useState } from "react";
import { ArrowLeft, MoveRight, ArrowUp, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SizePositionPanelProps {
  onBack: () => void;
}

const SizePositionPanel = ({ onBack }: SizePositionPanelProps) => {
  const [widgetLauncher, setWidgetLauncher] = useState("show");
  const [visibility, setVisibility] = useState("show");
  const [differentForMobile, setDifferentForMobile] = useState(false);
  const [position, setPosition] = useState<"left" | "right">("right");
  const [sideOffset, setSideOffset] = useState("0");
  const [bottomOffset, setBottomOffset] = useState("0");

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Widget position and visibility</h2>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Widget launcher */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Widget launcher</span>
          <Select value={widgetLauncher} onValueChange={setWidgetLauncher}>
            <SelectTrigger className="w-[150px] bg-muted border-0 rounded-full">
              <SelectValue placeholder="Show options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">Show options</SelectItem>
              <SelectItem value="hide">Hide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visibility on website */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Visibility on website</span>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-[150px] bg-muted border-0 rounded-full">
              <SelectValue placeholder="Show options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">Show options</SelectItem>
              <SelectItem value="hide">Hide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Set widget position */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Set widget position</h3>

          {/* Different for mobile */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="different-mobile"
              checked={differentForMobile}
              onCheckedChange={(checked) => setDifferentForMobile(checked === true)}
              className="h-5 w-5 rounded border-muted-foreground/40"
            />
            <label htmlFor="different-mobile" className="text-sm font-medium text-foreground cursor-pointer">
              Different for mobile
            </label>
          </div>

          {/* Left / Right selector */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setPosition("left")}
              className={`relative flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-5 transition-all ${
                position === "left"
                  ? "border-foreground bg-background"
                  : "border-transparent bg-muted"
              }`}
            >
              {position === "left" && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <div className="h-3 w-3 rounded-sm bg-background" />
              </div>
              <span className="text-sm font-medium text-foreground">Left</span>
            </button>

            <button
              onClick={() => setPosition("right")}
              className={`relative flex items-center justify-center gap-3 rounded-xl border-2 px-4 py-5 transition-all ${
                position === "right"
                  ? "border-foreground bg-background"
                  : "border-transparent bg-muted"
              }`}
            >
              {position === "right" && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <div className="h-3 w-3 rounded-sm bg-background" />
              </div>
              <span className="text-sm font-medium text-foreground">Right</span>
            </button>
          </div>

          {/* Side / Bottom offsets */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MoveRight className="h-4 w-4" />
                <span>Side</span>
              </div>
              <Input
                type="number"
                value={sideOffset}
                onChange={(e) => setSideOffset(e.target.value)}
                className="bg-muted border-0 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ArrowUp className="h-4 w-4" />
                <span>Bottom</span>
              </div>
              <Input
                type="number"
                value={bottomOffset}
                onChange={(e) => setBottomOffset(e.target.value)}
                className="bg-muted border-0 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizePositionPanel;
