import { useState } from "react";
import { ChevronLeft, ChevronDown, Check, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ThemeColorsPanelProps {
  onBack: () => void;
}

const themeColors = [
  { color: "#E5E5E5", name: "gray" },
  { color: "#8B5CF6", name: "purple" },
  { color: "#3B82F6", name: "blue" },
  { color: "#06B6D4", name: "cyan" },
  { color: "#22C55E", name: "green" },
  { color: "#EAB308", name: "yellow" },
  { color: "#F97316", name: "orange" },
  { color: "#EF4444", name: "red" },
  { color: "#EC4899", name: "pink" },
];

const backgroundImages = [
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop",
];

const ThemeColorsPanel = ({ onBack }: ThemeColorsPanelProps) => {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("dark");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [moreColorsOpen, setMoreColorsOpen] = useState(true);
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | "image">("gradient");

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <h2 className="text-xl font-bold">Theme & colors</h2>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Pick theme and color */}
        <div className="mb-8">
          <Label className="mb-4 block text-base font-semibold text-foreground">
            Pick theme and color
          </Label>
          
          {/* Theme cards */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {/* Light theme */}
            <button
              onClick={() => setSelectedTheme("light")}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                selectedTheme === "light"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100 p-4">
                <div className="h-full rounded-lg bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <div className="h-2 w-12 rounded bg-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-3/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
              {selectedTheme === "light" && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>

            {/* Dark theme */}
            <button
              onClick={() => setSelectedTheme("dark")}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                selectedTheme === "dark"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div className="aspect-[4/3] bg-slate-800 p-4">
                <div className="h-full rounded-lg bg-slate-900 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-cyan-400" />
                    <div className="h-2 w-12 rounded bg-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded bg-slate-700" />
                    <div className="h-2 w-3/4 rounded bg-slate-700" />
                  </div>
                </div>
              </div>
              {selectedTheme === "dark" && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          </div>

          {/* Theme labels */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <span className="text-sm font-medium text-foreground">Light</span>
            <span className="text-sm font-medium text-foreground">Dark</span>
          </div>

          {/* Color palette */}
          <div className="flex flex-wrap gap-3">
            {themeColors.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedColor(item.name)}
                className={`relative h-12 w-12 rounded-full transition-all ${
                  selectedColor === item.name
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: item.color }}
              >
                {selectedColor === item.name && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}
            {/* Custom color picker */}
            <button className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-border bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500">
              <div className="absolute inset-1 rounded-full bg-white" />
            </button>
          </div>
        </div>

        {/* More colors settings */}
        <Collapsible open={moreColorsOpen} onOpenChange={setMoreColorsOpen} className="mb-8">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-foreground">
              More colors settings
            </Label>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {moreColorsOpen ? "Hide" : "Show"}
                <ChevronDown className={`h-4 w-4 transition-transform ${moreColorsOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                Advanced color customization options will appear here.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Choose background */}
        <div>
          <Label className="mb-4 block text-base font-semibold text-foreground">
            Choose background
          </Label>

          <div className="space-y-4">
            {/* Solid option */}
            <button
              onClick={() => setBackgroundType("solid")}
              className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                backgroundType === "solid"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Solid</p>
                  <p className="text-sm text-muted-foreground">
                    Theme color used as a background
                  </p>
                </div>
                <div className="h-20 w-20 rounded-xl bg-blue-500" />
              </div>
              {backgroundType === "solid" && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>

            {/* Gradient option */}
            <button
              onClick={() => setBackgroundType("gradient")}
              className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                backgroundType === "gradient"
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Gradient</p>
                  <p className="text-sm text-muted-foreground">
                    Colors automatically generated based on the theme color
                  </p>
                </div>
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900" />
              </div>
              {backgroundType === "gradient" && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>

            {/* Image option */}
            <div
              className={`relative rounded-xl border-2 p-4 transition-all ${
                backgroundType === "image"
                  ? "border-primary"
                  : "border-border"
              }`}
            >
              <button
                onClick={() => setBackgroundType("image")}
                className="w-full text-left"
              >
                <p className="font-medium text-foreground">Image <span className="font-normal text-muted-foreground">(720×600)</span></p>
                <p className="text-sm text-muted-foreground">
                  Add your own file or pick from gallery
                </p>
              </button>
              
              <div className="mt-4 flex items-center gap-3">
                {backgroundImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setBackgroundType("image")}
                    className="h-12 w-12 overflow-hidden rounded-lg transition-all hover:scale-110"
                  >
                    <img
                      src={img}
                      alt={`Background ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {backgroundType === "image" && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeColorsPanel;
