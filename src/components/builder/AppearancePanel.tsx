import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Upload, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const avatars = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f0d9b5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sara&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jade&backgroundColor=c1f0c1",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=d5f0f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=ffe4b5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Luna&backgroundColor=e8d5e3",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Max&backgroundColor=b5e8d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=f9e2d0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Noah&backgroundColor=d0e7f9",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=f5d5e0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ethan&backgroundColor=d5f5e0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Isla&backgroundColor=e0d5f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Liam&backgroundColor=f5edd5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=d5f0e8",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=f0e0d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Emma&backgroundColor=dde0f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ryan&backgroundColor=e8f0d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Lily&backgroundColor=f5d5d5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Oscar&backgroundColor=d5e8f5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ruby&backgroundColor=f0d5f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Finn&backgroundColor=d5f5f0",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Nora&backgroundColor=f5e8d5",
];

interface AppearancePanelProps {
  contactName: string;
  onContactNameChange: (name: string) => void;
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  widgetColor: string;
  onWidgetColorChange: (color: string) => void;
  sayHello: string;
  onSayHelloChange: (text: string) => void;
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
  offerHelp: string;
  onOfferHelpChange: (help: string) => void;
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
  selectedAvatar,
  onSelectAvatar,
  offerHelp,
  onOfferHelpChange,
  onSave,
  activeTab,
}: AppearancePanelProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarTab, setAvatarTab] = useState("gallery");
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("custom-avatars")
        .upload(fileName, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("custom-avatars")
        .getPublicUrl(fileName);
      onSelectAvatar(urlData.publicUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

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
              <label className="mb-3 block text-base font-semibold text-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={contactName}
                onChange={(e) => onContactNameChange(e.target.value)}
                placeholder="AI Agent"
                className="h-12 rounded-xl border-border bg-background text-sm"
              />
            </div>

            <div className="border-t border-border" />

            {/* Pick avatar */}
            <div>
              <div className="mb-4 flex items-center gap-4">
                <Label className="text-base font-semibold text-foreground">Pick avatar</Label>
                <Tabs value={avatarTab} onValueChange={setAvatarTab}>
                  <TabsList className="h-9 bg-muted">
                    <TabsTrigger value="gallery" className="text-sm">Gallery</TabsTrigger>
                    <TabsTrigger value="upload" className="text-sm">Image upload</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {avatarTab === "gallery" && (
                <div className="rounded-xl bg-muted/60 p-2">
                  <div className="max-h-[120px] overflow-y-auto grid grid-cols-8 gap-1.5 p-1.5">
                    {avatars.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => onSelectAvatar(avatar)}
                        className={`relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-full transition-all ${
                          selectedAvatar === avatar
                            ? "ring-2 ring-primary ring-offset-2"
                            : "hover:ring-2 hover:ring-muted-foreground/30 hover:ring-offset-2"
                        }`}
                      >
                        <img src={avatar} alt={`Avatar ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {avatarTab === "upload" && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  {selectedAvatar && !avatars.includes(selectedAvatar) ? (
                    <div className="flex items-center gap-4">
                      <img src={selectedAvatar} alt="Custom avatar" className="h-16 w-16 rounded-full object-cover flex-shrink-0 ring-1 ring-primary/50 ring-offset-2" />
                      <Button variant="outline" size="sm" className="border-foreground text-foreground hover:bg-foreground hover:text-background" onClick={() => onSelectAvatar(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : isUploading ? (
                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => avatarInputRef.current?.click()}>
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground/60">JPG, PNG, SVG • Max 5MB</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-border" />

            {/* Offer help */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground">
                  Offer help <span className="text-destructive">*</span>
                </Label>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted">
                  <Sparkles className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <Textarea
                placeholder="Write to us"
                value={offerHelp}
                onChange={(e) => onOfferHelpChange(e.target.value)}
                className="min-h-[120px] resize-none rounded-xl border-border bg-muted/50"
              />
            </div>

            <div className="border-t border-border" />

            {/* Brand color */}
            <div>
              <label className="mb-3 block text-base font-semibold text-foreground">Brand color</label>
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
