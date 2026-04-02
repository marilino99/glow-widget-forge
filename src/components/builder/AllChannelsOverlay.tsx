import { useState } from "react";
import { ArrowLeft, Lock, MessageSquare, Heart, Eye, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { templates, gradientMap, colorMap, type WidgetTemplate, type TemplateCategory } from "./TemplatesPanel";

const colorHexMap: Record<string, string> = {
  gray: "#9ca3af",
  blue: "#3b82f6",
  orange: "#f97316",
  red: "#dc2626",
  yellow: "#eab308",
  green: "#22c55e",
  purple: "#a855f7",
  pink: "#ec4899",
};
const categories: { value: "all" | TemplateCategory; label: string }[] = [
  { value: "all", label: "All Templates" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "lead-gen", label: "Lead Generation" },
  { value: "branding", label: "Branding" },
];

interface AllChannelsOverlayProps {
  onClose: () => void;
  canChooseTemplate: boolean;
  onUpgrade: () => void;
  onApplyTemplate: (template: WidgetTemplate) => void;
}

const AllChannelsOverlay = ({ onClose, canChooseTemplate, onUpgrade, onApplyTemplate }: AllChannelsOverlayProps) => {
  const [confirmTemplate, setConfirmTemplate] = useState<WidgetTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WidgetTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [filterMode, setFilterMode] = useState<"all" | "favorites" | "categories">("all");
  const [selectedCategories, setSelectedCategories] = useState<Set<TemplateCategory>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("widget-template-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("widget-template-favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleCategory = (cat: TemplateCategory) => {
    if (filterMode !== "categories") {
      setFilterMode("categories");
      setSelectedCategories(new Set([cat]));
    } else {
      setSelectedCategories(prev => {
        const next = new Set(prev);
        if (next.has(cat)) next.delete(cat); else next.add(cat);
        if (next.size === 0) { setFilterMode("all"); return new Set(); }
        return next;
      });
    }
  };

  const selectAll = () => {
    setFilterMode("all");
    setSelectedCategories(new Set());
  };

  const filtered = filterMode === "all"
    ? templates
    : filterMode === "favorites"
    ? templates.filter((t) => favorites.has(t.id))
    : templates.filter((t) => selectedCategories.has(t.category));

  const handleChoose = (template: WidgetTemplate) => {
    if (!canChooseTemplate) {
      onUpgrade();
      return;
    }
    setConfirmTemplate(template);
  };

  const handleConfirm = () => {
    if (confirmTemplate) {
      onApplyTemplate(confirmTemplate);
      setConfirmTemplate(null);
      onClose();
    }
  };

  const getCardBg = (template: WidgetTemplate) => {
    if (template.backgroundType === "gradient") {
      return `bg-gradient-to-br ${gradientMap[template.color] || "from-gray-300 to-gray-500"}`;
    }
    return colorMap[template.color] || "bg-gray-400";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background"
    >
      {/* Header */}
      <div className="flex items-center px-8 py-5 border-b border-border">
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-foreground">
          Choose your template
        </h1>
        <div className="w-[88px]" /> {/* spacer to center title */}
      </div>

      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 p-6 overflow-y-auto">
          {/* Favorites */}
          <button
            onClick={() => { if (filterMode !== "favorites") setFilterMode("favorites"); }}
            className="flex justify-between w-[110%] mb-6 py-4 px-8 rounded-lg text-left text-base font-bold cursor-pointer focus:outline-none transition-colors bg-[hsl(258,60%,52%)] text-white hover:bg-[hsl(258,60%,42%)]"
          >
            <span>FAVORITES</span>
            <span className="text-white/60">{favorites.size}</span>
          </button>

          {/* Filter by category */}
          <div className="w-[110%] rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-[#f7f7f7]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(258,60%,52%)]">
                Filter by Category
              </p>
            </div>
            <div className="px-5 py-4 space-y-4">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <Checkbox
                    checked={cat.value === "all" ? filterMode === "all" : selectedCategories.has(cat.value)}
                    onCheckedChange={() => cat.value === "all" ? selectAll() : toggleCategory(cat.value)}
                    className="h-4 w-4 border-[hsl(258,60%,52%)] data-[state=checked]:bg-[hsl(258,60%,52%)] data-[state=checked]:text-white"
                  />
                  <span className={`text-base transition-colors ${
                    (cat.value === "all" ? filterMode === "all" : selectedCategories.has(cat.value))
                      ? "font-medium text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Preview area */}
                <div className={`relative flex items-center justify-center aspect-[16/9] w-full rounded-t ${getCardBg(template)}`}>
                  <MessageSquare className="h-10 w-10 text-white/90 drop-shadow-md" />
                  <button
                    onClick={(e) => toggleFavorite(template.id, e)}
                    className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white opacity-0 group-hover:opacity-100`}
                  >
                    <Heart className={`h-4 w-4 transition-colors ${favorites.has(template.id) ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="border-t border-border bg-[#f7f7f7] p-3">
                  <h4 className="font-semibold mb-3 text-foreground break-all leading-normal">{template.name}</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="inline-flex items-center justify-center text-sm font-semibold h-10 rounded bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.12] transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleChoose(template)}
                      className="inline-flex items-center justify-center text-sm font-semibold h-10 rounded bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    >
                      Choose
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground mt-16">No templates in this category yet.</p>
          )}
        </main>
      </div>

      {/* Fullscreen Preview */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {previewTemplate.name}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => toggleFavorite(previewTemplate.id, e)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
              >
                <Heart className={`h-4 w-4 ${favorites.has(previewTemplate.id) ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
              </button>
              <div className="flex rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex h-9 w-9 items-center justify-center transition-colors ${previewDevice === "desktop" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex h-9 w-9 items-center justify-center transition-colors ${previewDevice === "mobile" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  handleChoose(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-foreground text-background text-sm font-semibold transition-colors hover:bg-foreground/90"
              >
                Choose
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] p-8 overflow-hidden">
            <div
              className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 h-full"
              style={{ width: previewDevice === "desktop" ? "100%" : 375, maxWidth: previewDevice === "desktop" ? 900 : 375 }}
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#f0f0f0] border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1.5 text-xs text-gray-400 text-center border border-gray-200">
                    example.com
                  </div>
                </div>
              </div>

              {/* Mockup content */}
              <div className="relative p-8 h-[calc(100%-44px)]">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-32 bg-gray-50 rounded-lg mt-6" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>

                {/* Widget bubble */}
                <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
                  <div
                    className="rounded-2xl rounded-br-sm px-4 py-3 text-white text-sm shadow-lg max-w-[220px]"
                    style={{ backgroundColor: colorHexMap[previewTemplate.color] || "#6b7280" }}
                  >
                    {previewTemplate.sayHello}
                  </div>
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                    style={{ backgroundColor: colorHexMap[previewTemplate.color] || "#6b7280" }}
                  >
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AllChannelsOverlay;
