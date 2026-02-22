import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus } from "lucide-react";

interface AppearancePanelProps {
  contactName: string;
  onContactNameChange: (name: string) => void;
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  widgetColor: string;
  onWidgetColorChange: (color: string) => void;
  sayHello: string;
  onSayHelloChange: (text: string) => void;
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
  sayHello,
  onSayHelloChange,
  onSave,
  activeTab,
}: AppearancePanelProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        {activeTab === "general" && (
          <div className="max-w-xl space-y-8">
            {/* Logo */}
            <div>
              <label className="mb-3 block text-base font-semibold text-foreground">Logo</label>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30"
                  onClick={() => !logo && logoInputRef.current?.click()}
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                {logo ? (
                  <Button variant="secondary" size="sm" onClick={() => onLogoChange(null)}>
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Upload
                  </Button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => onLogoChange(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Say hello */}
            <div>
              <label className="mb-3 block text-base font-semibold text-foreground">
                Say hello <span className="text-destructive">*</span>
              </label>
              <Input
                value={sayHello}
                onChange={(e) => onSayHelloChange(e.target.value)}
                placeholder="Hello, nice to see you here 👋"
                className="h-12 rounded-xl border-border bg-muted/50 text-sm"
              />
            </div>

            <div className="border-t border-border" />

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

            {/* Brand color */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">Brand color</label>
              <div className="flex items-center gap-3">
                <Input
                  value={widgetColor}
                  onChange={(e) => onWidgetColorChange(e.target.value)}
                  className="h-12 w-36 rounded-xl border-border bg-background font-mono text-sm"
                />
                <div
                  className="h-8 w-8 cursor-pointer rounded-full border-2 border-background shadow-md"
                  style={{ backgroundColor: widgetColor }}
                />
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
      <div className="shrink-0 px-8 py-4 flex justify-end">
        <Button onClick={onSave} className="rounded-xl px-8">
          Save
        </Button>
      </div>
    </div>
  );
};

export default AppearancePanel;
