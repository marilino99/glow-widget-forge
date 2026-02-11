import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, lazy, Suspense } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

interface InjectionCodePanelProps {
  onBack: () => void;
  customCss: string;
  customJs: string;
  onSave: (config: Record<string, unknown>) => void;
}

const validateCss = (css: string): string | null => {
  if (!css.trim()) return null;
  try {
    // Check for unclosed braces
    const open = (css.match(/{/g) || []).length;
    const close = (css.match(/}/g) || []).length;
    if (open !== close) return `Mismatched braces: ${open} opening, ${close} closing`;
    
    // Check for common syntax errors
    if (/{[^}]*{/.test(css.replace(/\/\*[\s\S]*?\*\//g, ''))) {
      return "Nested braces detected — check for missing closing brace";
    }
    return null;
  } catch {
    return "Invalid CSS syntax";
  }
};

const validateJs = (js: string): string | null => {
  if (!js.trim()) return null;
  try {
    new Function(js);
    return null;
  } catch (e: any) {
    return e.message || "Invalid JavaScript syntax";
  }
};

const InjectionCodePanel = ({ onBack, customCss, customJs, onSave }: InjectionCodePanelProps) => {
  const [css, setCss] = useState(customCss);
  const [js, setJs] = useState(customJs);
  const [cssError, setCssError] = useState<string | null>(null);
  const [jsError, setJsError] = useState<string | null>(null);

  useEffect(() => {
    setCss(customCss);
    setJs(customJs);
  }, [customCss, customJs]);

  // Debounced validation
  useEffect(() => {
    const t = setTimeout(() => setCssError(validateCss(css)), 300);
    return () => clearTimeout(t);
  }, [css]);

  useEffect(() => {
    const t = setTimeout(() => setJsError(validateJs(js)), 300);
    return () => clearTimeout(t);
  }, [js]);

  const hasChanges = css !== customCss || js !== customJs;
  const hasErrors = !!cssError || !!jsError;

  const handleSave = () => {
    if (hasErrors) return;
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

        {/* Custom CSS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Custom CSS</label>
            {css.trim() && (
              cssError 
                ? <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{cssError}</span>
                : <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle2 className="h-3 w-3" />Valid</span>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <CodeEditor
              value={css}
              language="css"
              placeholder={`/* Example */\n.widget-container {\n  border-radius: 16px;\n}`}
              onChange={(e) => setCss(e.target.value)}
              padding={12}
              style={{
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                minHeight: 160,
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
              }}
              data-color-mode="dark"
            />
          </div>
        </div>

        {/* Custom JS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Custom JavaScript</label>
            {js.trim() && (
              jsError
                ? <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" />{jsError}</span>
                : <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle2 className="h-3 w-3" />Valid</span>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <CodeEditor
              value={js}
              language="js"
              placeholder={`// Example\nconsole.log('Widget loaded');`}
              onChange={(e) => setJs(e.target.value)}
              padding={12}
              style={{
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                minHeight: 160,
                backgroundColor: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
              }}
              data-color-mode="dark"
            />
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex gap-2 border-t border-border p-4">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave} disabled={hasErrors}>Save</Button>
        </div>
      )}
    </div>
  );
};

export default InjectionCodePanel;
