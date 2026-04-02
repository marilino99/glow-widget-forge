import { useState } from "react";
import { ArrowLeft, Lock, MessageSquare, Heart, Eye } from "lucide-react";
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

const categories: { value: "all" | TemplateCategory; label: string }[] = [
  { value: "all", label: "All Templates" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "lead-gen", label: "Lead Generation" },
  { value: "branding", label: "Branding" },
];

interface AllChannelsOverlayProps {
  onClose: () => void;
  isPro: boolean;
  onUpgrade: () => void;
  onApplyTemplate: (template: WidgetTemplate) => void;
}

const AllChannelsOverlay = ({ onClose, isPro, onUpgrade, onApplyTemplate }: AllChannelsOverlayProps) => {
  const [confirmTemplate, setConfirmTemplate] = useState<WidgetTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WidgetTemplate | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites" | TemplateCategory>("all");
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

  const filtered = activeFilter === "all"
    ? templates
    : activeFilter === "favorites"
    ? templates.filter((t) => favorites.has(t.id))
    : templates.filter((t) => t.category === activeFilter);

  const handleChoose = (template: WidgetTemplate) => {
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
        <aside className="w-56 shrink-0 p-6 overflow-y-auto">
          {/* Favorites */}
          <button
            onClick={() => setActiveFilter(activeFilter === "favorites" ? "all" : "favorites")}
            className={`flex justify-between w-full mb-4 py-4 px-6 rounded text-left font-bold cursor-pointer focus:outline-none transition-colors ${
              activeFilter === "favorites"
                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            <span>FAVORITES</span>
            <span className={activeFilter === "favorites" ? "text-primary-foreground/60" : "text-muted-foreground"}>{favorites.size}</span>
          </button>

          {/* Filter by category */}
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Filter by Category
          </p>
          <div className="space-y-3">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Checkbox
                  checked={activeFilter === cat.value}
                  onCheckedChange={() => setActiveFilter(cat.value)}
                  className="h-4 w-4"
                />
                <span className={`text-sm transition-colors ${
                  activeFilter === cat.value
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}>
                  {cat.label}
                </span>
              </label>
            ))}
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
                  {template.isPro && !isPro ? (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                      <Lock className="h-3 w-3" />
                      Pro
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                      Free
                    </span>
                  )}
                  <button
                    onClick={(e) => toggleFavorite(template.id, e)}
                    className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white ${
                      favorites.has(template.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Heart className={`h-4 w-4 transition-colors ${favorites.has(template.id) ? "text-red-500 fill-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>

                <div className="border-t border-border bg-muted/50 p-3">
                  <h4 className="font-semibold mb-1 text-foreground break-all leading-normal">{template.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{template.sayHello}</p>
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

      {/* Preview dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-xl [&>button]:hidden" overlayClassName="bg-black/10 backdrop-blur-sm">
          <div className={`flex items-center justify-center py-20 ${previewTemplate ? getCardBg(previewTemplate) : ""}`}>
            <MessageSquare className="h-16 w-16 text-white/90 drop-shadow-lg" />
          </div>
          <div className="px-8 py-6 text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{previewTemplate?.name}</h3>
            <p className="text-sm text-muted-foreground">{previewTemplate?.sayHello}</p>
            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full py-5"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1 rounded-full py-5"
                onClick={() => {
                  if (previewTemplate) {
                    handleChoose(previewTemplate);
                    setPreviewTemplate(null);
                  }
                }}
              >
                Choose this template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
