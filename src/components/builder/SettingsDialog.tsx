import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Settings, Bell, User, CreditCard } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
}

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const SettingsDialog = ({ open, onOpenChange, userEmail }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[720px] h-[520px] p-0 rounded-2xl border-0 shadow-xl overflow-hidden [&>button]:hidden"
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
                <div className="flex items-start justify-between gap-6 py-4 border-b border-border/40">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-foreground">Language</span>
                    <p className="text-sm text-muted-foreground">
                      Choose in what language the respondents will see your form. This applies to the text which is not customized by you e.g. default buttons, errors, etc.
                    </p>
                  </div>
                  <select className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none">
                    <option>English</option>
                    <option>Italiano</option>
                    <option>Español</option>
                    <option>Français</option>
                  </select>
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
                <p className="text-sm text-muted-foreground">
                  Billing information coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
