import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface InjectionCodePanelProps {
  onBack: () => void;
  customCss: string;
  customJs: string;
  onSave: (config: Record<string, unknown>) => void;
}

const InjectionCodePanel = ({ onBack, customCss, customJs, onSave }: InjectionCodePanelProps) => {
  const [css, setCss] = useState(customCss);
  const [js, setJs] = useState(customJs);

  useEffect(() => {
    setCss(customCss);
    setJs(customJs);
  }, [customCss, customJs]);

  const hasChanges = css !== customCss || js !== customJs;

  const handleSave = () => {
    onSave({ customCss: css, customJs: js });
  };

  const handleCancel = () => {
    setCss(customCss);
    setJs(customJs);
  };

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

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom CSS</label>
          <Textarea
            placeholder={`/* Example */\n.widget-container {\n  border-radius: 16px;\n}`}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            className="min-h-[160px] font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Custom JavaScript</label>
          <Textarea
            placeholder={`// Example\nconsole.log('Widget loaded');`}
            value={js}
            onChange={(e) => setJs(e.target.value)}
            className="min-h-[160px] font-mono text-xs"
          />
        </div>
      </div>

      {hasChanges && (
        <div className="flex gap-2 border-t border-border p-4">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Save</Button>
        </div>
      )}
    </div>
  );
};

export default InjectionCodePanel;
