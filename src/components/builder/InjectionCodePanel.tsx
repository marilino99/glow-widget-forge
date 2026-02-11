import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface InjectionCodePanelProps {
  onBack: () => void;
}

const InjectionCodePanel = ({ onBack }: InjectionCodePanelProps) => {
  const [customCSS, setCustomCSS] = useState("");
  const [customJS, setCustomJS] = useState("");

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">Injection code</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Add custom CSS and JavaScript to fully customize the look and behavior of your widget.
        </p>

        {/* Custom CSS */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom CSS</label>
          <Textarea
            placeholder={`/* Example */\n.widget-container {\n  border-radius: 16px;\n}`}
            value={customCSS}
            onChange={(e) => setCustomCSS(e.target.value)}
            className="min-h-[160px] font-mono text-xs"
          />
        </div>

        {/* Custom JS */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom JavaScript</label>
          <Textarea
            placeholder={`// Example\nconsole.log('Widget loaded');`}
            value={customJS}
            onChange={(e) => setCustomJS(e.target.value)}
            className="min-h-[160px] font-mono text-xs"
          />
        </div>

        <Button className="w-full" size="sm" disabled={!customCSS && !customJS}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default InjectionCodePanel;
