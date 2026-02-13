import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Settings, Bell, User, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load profile when Account tab is opened
  useEffect(() => {
    if (open && activeTab === "account") {
      loadProfile();
    }
  }, [open, activeTab]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (data) {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setAvatarUrl(data.avatar_url);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ first_name: firstName, last_name: lastName }).eq("user_id", user.id);
    setProfileLoading(false);
    if (error) { toast.error("Failed to update profile"); } 
    else { toast.success("Profile updated"); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const filePath = `${user.id}/avatar-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from("custom-avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); return; }
    const { data: urlData } = supabase.storage.from("custom-avatars").getPublicUrl(filePath);
    const url = urlData.publicUrl;
    setAvatarUrl(url);
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    toast.success("Photo updated");
  };

  const handleChangeEmail = async () => {
    const newEmail = prompt("Enter your new email address:");
    if (!newEmail) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) { toast.error(error.message); }
    else { toast.success("Confirmation email sent to your new address"); }
  };

  const handleSetPassword = async () => {
    const newPassword = prompt("Enter your new password (min 6 characters):");
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { toast.error(error.message); }
    else { toast.success("Password updated"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[880px] h-[520px] p-0 rounded-2xl border-0 shadow-xl overflow-hidden [&>button]:hidden"
        overlayClassName="bg-black/10 backdrop-blur-sm"
      >
        <div className="flex h-full min-h-0">
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
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-10">
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
              <div className="space-y-6">
                {/* Photo */}
                <div>
                  <span className="text-sm font-semibold text-foreground">Photo</span>
                  <div className="mt-2 group/photo flex items-center gap-4">
                    <label className="cursor-pointer relative">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      <div className="relative">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-primary">
                            {firstName ? firstName[0].toUpperCase() : userEmail?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    </label>
                    <label className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover/photo:opacity-100">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      Upload photo
                    </label>
                  </div>
                </div>

                {/* First name */}
                <div>
                  <span className="text-sm font-semibold text-foreground">First name</span>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5 rounded-xl" placeholder="First name" />
                </div>

                {/* Last name */}
                <div>
                  <span className="text-sm font-semibold text-foreground">Last name</span>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5 rounded-xl" placeholder="Last name" />
                </div>

                {/* Email */}
                <div>
                  <span className="text-sm font-semibold text-foreground">Email</span>
                  <div className="relative mt-1.5">
                    <Input value={userEmail || ""} readOnly className="rounded-xl pr-28" />
                    <button onClick={handleChangeEmail} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Change email
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <span className="text-sm font-semibold text-foreground">Password</span>
                  <div className="relative mt-1.5">
                    <Input type="password" value="" readOnly className="rounded-xl pr-28" placeholder="" />
                    <button onClick={handleSetPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Set password
                    </button>
                  </div>
                </div>

                {/* Update button */}
                <Button onClick={handleUpdateProfile} disabled={profileLoading} className="bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-xl px-6">
                  {profileLoading ? "Updating..." : "Update"}
                </Button>
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
