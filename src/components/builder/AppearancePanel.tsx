import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";

interface AppearancePanelProps {
  contactName: string;
  onContactNameChange: (name: string) => void;
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  widgetColor: string;
  onWidgetColorChange: (color: string) => void;
  onSave: () => void;
  activeTab: string;
}

const AppearancePanel = ({
  contactName,
  onContactNameChange,
  logo,
  onLogoChange,
  widgetColor,
  onWidgetColorChange,
  onSave,
  activeTab,
}: AppearancePanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onLogoChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        {activeTab === "general" && (
          <div className="max-w-xl space-y-8">
            {/* Name */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">Name</label>
              <Input
                value={contactName}
                onChange={(e) => onContactNameChange(e.target.value)}
                placeholder="AI Agent"
                className="h-12 rounded-xl border-border bg-background text-sm"
              />
            </div>

            <div className="border-t border-border" />

            {/* Logo */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">Logo</label>
              <div className="flex items-start gap-4">
                {logo && (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
                    <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                  <span className="text-xs text-muted-foreground/60">SVG, PNG, JPG or GIF (max. 1000x1000 px)</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Brand color */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">Brand color</label>
              <div className="flex items-center gap-3">
                <Input
                  value={widgetColor}
                  onChange={(e) => onWidgetColorChange(e.target.value)}
                  className="h-12 w-36 rounded-xl border-border bg-background font-mono text-sm"
                />
                <div className="relative">
                  <div
                    className="h-8 w-8 cursor-pointer rounded-full border-2 border-background shadow-md"
                    style={{ backgroundColor: widgetColor }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />
          </div>
        )}

        {activeTab === "home-screen" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Home Screen settings coming soon
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Chat settings coming soon
          </div>
        )}

        {activeTab === "widget-button" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Widget button settings coming soon
          </div>
        )}

        {activeTab === "visibility" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            Visibility settings coming soon
          </div>
        )}
      </div>

      {/* Footer with Save */}
      <div className="shrink-0 border-t border-border px-8 py-4 flex justify-end">
        <Button onClick={onSave} className="rounded-xl px-8">
          Save
        </Button>
      </div>
    </div>
  );
};

export default AppearancePanel;
