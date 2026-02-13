import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Settings, Bell, User, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onSaveConfig: (config: Record<string, unknown>) => void;
  isPro: boolean;
  onUpgrade: () => void;
  showBranding: boolean;
  onShowBrandingChange: (show: boolean) => void;
}

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const SettingsDialog = ({ open, onOpenChange, userEmail, language, onLanguageChange, onSaveConfig, isPro, onUpgrade, showBranding, onShowBrandingChange }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[880px] h-[520px] p-0 rounded-2xl border-0 shadow-xl overflow-hidden [&>button]:hidden"
        overlayClassName="bg-black/10 backdrop-blur-sm"
      >
        <div className="flex h-full">
          {/* Left sidebar */}
          <div className="w-[200px] shrink-0 border-r border-border/40 p-3 flex flex-col">
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-[hsl(0_0%_93%)] transition-colors mb-3"
            >
              <X className="h-4 w-4" />
            </button>

            <nav className="space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-[hsl(0_0%_93%)] ${
                      isActive
                        ? "bg-[hsl(0_0%_93%)] font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>

            {activeTab === "general" && (
              <div className="space-y-5">
                <div className="py-4 border-b border-border/40">
                  <span className="text-sm font-semibold text-foreground">Language</span>
                  <div className="flex items-baseline justify-between gap-6 mt-1">
                    <p className="text-sm" style={{ color: '#898884' }}>
                      Choose in what language the respondents will see your widget.
                    </p>
                    <select
                      value={language}
                      onChange={(e) => {
                        onLanguageChange(e.target.value);
                        onSaveConfig({ language: e.target.value });
                      }}
                      className="shrink-0 min-w-[160px] rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground outline-none appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-7"
                    >
                      <option value="en">English</option>
                      <option value="it">Italiano</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                </div>

                {/* Widjet branding */}
                <div className="py-4 border-b border-border/40">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Widjet branding</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: 'rgba(217, 70, 239, 0.12)', color: '#D946EF' }}>
                          Pro
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#898884' }}>
                        Show "Powered by Widjet" on your widget.
                      </p>
                    </div>
                    <Switch
                      checked={showBranding}
                      onCheckedChange={(checked) => {
                        if (!checked && !isPro) {
                          onOpenChange(false);
                          onUpgrade();
                        } else {
                          onShowBrandingChange(checked);
                          onSaveConfig({ showBranding: checked });
                        }
                      }}
                      className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Notification preferences coming soon.
                </p>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between py-3 border-b border-border/40">
                  <span className="text-sm text-foreground">Email</span>
                  <span className="text-sm text-muted-foreground">{userEmail || "—"}</span>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <h3 className="text-base font-bold text-foreground">Widjet plan</h3>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: isPro ? 'rgba(217, 70, 239, 0.12)' : 'hsl(0 0% 90%)',
                        color: isPro ? '#D946EF' : 'hsl(0 0% 45%)',
                      }}
                    >
                      {isPro ? "Pro" : "Free"}
                    </span>
                  </div>
                  <p className="text-sm mb-5" style={{ color: '#898884' }}>
                    {isPro
                      ? "You're on the Pro plan. Enjoy all premium features."
                      : "Upgrade to access advanced features designed for growing teams and creators."}
                  </p>
                  {!isPro && (
                    <Button
                      onClick={() => {
                        onOpenChange(false);
                        onUpgrade();
                      }}
                      className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl px-6 py-2.5"
                    >
                      Upgrade plan
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
