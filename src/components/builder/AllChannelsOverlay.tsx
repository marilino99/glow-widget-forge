import { useState } from "react";
import { ArrowLeft, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { templates, gradientMap, colorMap, type WidgetTemplate } from "./TemplatesPanel";

interface AllChannelsOverlayProps {
  onClose: () => void;
  isPro: boolean;
  onUpgrade: () => void;
  onApplyTemplate: (template: WidgetTemplate) => void;
}

const AllChannelsOverlay = ({ onClose, isPro, onUpgrade, onApplyTemplate }: AllChannelsOverlayProps) => {
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
      onClose();
    }
  };

  const freeTemplates = templates.filter((t) => !t.isPro);
  const proTemplates = templates.filter((t) => t.isPro);

  const getCardBg = (template: WidgetTemplate) => {
    if (template.backgroundType === "gradient") {
      return `bg-gradient-to-br ${gradientMap[template.color] || "from-gray-300 to-gray-500"}`;
    }
    return colorMap[template.color] || "bg-gray-400";
  };

  const renderCard = (template: WidgetTemplate, large = false) => (
    <button
      key={template.id}
      onClick={() => handleClick(template)}
      className={`group relative rounded-2xl border border-[#e0e3ef] bg-white overflow-hidden flex flex-col text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        template.isPro && !isPro ? "cursor-pointer" : "cursor-pointer"
      }`}
    >
      <div
        className={`relative flex items-center justify-center ${large ? "py-14" : "py-10"} ${getCardBg(template)}`}
      >
        <MessageSquare className={`${large ? "h-12 w-12" : "h-10 w-10"} text-white/90 drop-shadow-md`} />
        {template.isPro && !isPro && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-[#8a8fa8] shadow-sm">
            <Lock className="h-3 w-3" />
            Pro
          </span>
        )}
        {!template.isPro && (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-emerald-600 shadow-sm">
            Free
          </span>
        )}
      </div>
      <div className="px-5 py-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-[#1a1a2e] mb-1">{template.name}</h3>
        <p className="text-sm text-[#8a8fa8] leading-relaxed line-clamp-2">{template.sayHello}</p>
      </div>
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f0f2ff 60%, #e8ecff 100%)",
      }}
    >
      <div className="flex-1 overflow-y-auto px-12 pb-10 pt-3">
        <div className="flex items-center mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-[#e0e3ef] bg-white px-5 py-2.5 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-[#f8f9fc]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[#1a1a2e] ml-16">Templates</h1>
        </div>
        <div className="px-16 max-w-5xl mx-auto">
          {/* Free templates - 2 columns */}
          <p className="text-sm font-medium text-[#8a8fa8] uppercase tracking-wider mb-3">Free</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {freeTemplates.map((t) => renderCard(t, true))}
          </div>

          {/* Pro templates - 3 columns */}
          <p className="text-sm font-medium text-[#8a8fa8] uppercase tracking-wider mb-3">Pro</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proTemplates.map((t) => renderCard(t))}
          </div>
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

export default AllChannelsOverlay;
