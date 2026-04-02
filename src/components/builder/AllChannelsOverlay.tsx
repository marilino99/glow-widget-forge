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
  const [activeFilter, setActiveFilter] = useState<"all" | TemplateCategory>("all");

  const filtered = activeFilter === "all"
    ? templates
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
          <button className="flex justify-between w-full mb-4 py-4 px-6 rounded text-left bg-primary text-primary-foreground font-bold cursor-pointer hover:bg-primary/80 focus:bg-primary/80 focus:outline-none">
            <span>FAVORITES</span>
            <span className="text-primary-foreground/60">0</span>
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
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Preview area */}
                <div className={`relative flex items-center justify-center aspect-[16/10] w-full rounded-t ${getCardBg(template)}`}>
                  <MessageSquare className="h-12 w-12 text-white/90 drop-shadow-md" />
                  {template.isPro && !isPro ? (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                      <Lock className="h-3 w-3" />
                      Pro
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
                      Free
                    </span>
                  )}
                </div>

                {/* Info + actions */}
                <div className="px-5 py-4 flex flex-col gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1 mt-0.5">
                      {template.sayHello}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => handleChoose(template)}
                    >
                      Choose
                    </Button>
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
