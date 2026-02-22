import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Upload, Loader2, Sparkles, Check, Pipette } from "lucide-react";
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
  widgetTheme: "light" | "dark";
  onWidgetThemeChange: (theme: "light" | "dark") => void;
  backgroundType: "solid" | "gradient" | "image";
  onBackgroundTypeChange: (type: "solid" | "gradient" | "image") => void;
  backgroundImage: string | null;
  onBackgroundImageChange: (image: string | null) => void;
  sayHello: string;
  onSayHelloChange: (text: string) => void;
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
  offerHelp: string;
  onOfferHelpChange: (help: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  activeTab: string;
}

const presetColors = [
  { name: "gray", hex: "#E5E5E5" },
  { name: "purple", hex: "#8B5CF6" },
  { name: "blue", hex: "#3B82F6" },
  { name: "cyan", hex: "#06B6D4" },
  { name: "green", hex: "#22C55E" },
  { name: "yellow", hex: "#EAB308" },
  { name: "orange", hex: "#F97316" },
  { name: "red", hex: "#EF4444" },
  { name: "pink", hex: "#EC4899" },
];

const AppearancePanel = ({
  contactName,
  onContactNameChange,
  logo,
  onLogoChange,
  widgetColor,
  onWidgetColorChange,
  widgetTheme,
  onWidgetThemeChange,
  backgroundType,
  onBackgroundTypeChange,
  backgroundImage,
  onBackgroundImageChange,
  sayHello,
  onSayHelloChange,
  selectedAvatar,
  onSelectAvatar,
  offerHelp,
  onOfferHelpChange,
  onSave,
  onCancel,
  activeTab,
}: AppearancePanelProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarTab, setAvatarTab] = useState("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Track initial values for dirty detection
  const [initialValues, setInitialValues] = useState({
    contactName, logo, widgetColor, widgetTheme, backgroundType, backgroundImage,
    sayHello, selectedAvatar, offerHelp,
  });

  const hasChanges =
    contactName !== initialValues.contactName ||
    logo !== initialValues.logo ||
    widgetColor !== initialValues.widgetColor ||
    widgetTheme !== initialValues.widgetTheme ||
    backgroundType !== initialValues.backgroundType ||
    backgroundImage !== initialValues.backgroundImage ||
    sayHello !== initialValues.sayHello ||
    selectedAvatar !== initialValues.selectedAvatar ||
    offerHelp !== initialValues.offerHelp;

  const handleSave = () => {
    onSave();
    setInitialValues({
      contactName, logo, widgetColor, widgetTheme, backgroundType, backgroundImage,
      sayHello, selectedAvatar, offerHelp,
    });
  };

  const handleCancel = () => {
    // Restore all values to initial
    onContactNameChange(initialValues.contactName);
    onLogoChange(initialValues.logo);
    onWidgetColorChange(initialValues.widgetColor);
    onWidgetThemeChange(initialValues.widgetTheme);
    onBackgroundTypeChange(initialValues.backgroundType);
    onBackgroundImageChange(initialValues.backgroundImage);
    onSayHelloChange(initialValues.sayHello);
    onSelectAvatar(initialValues.selectedAvatar);
    onOfferHelpChange(initialValues.offerHelp);
    onCancel?.();
  };

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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "general" && (
          <div className="max-w-xs mx-auto space-y-4">
            {/* Logo */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Logo</label>
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
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Say hello <span className="text-destructive">*</span>
              </label>
              <Input
                value={sayHello}
                onChange={(e) => onSayHelloChange(e.target.value)}
                placeholder="Hello, nice to see you here 👋"
                className="h-10 rounded-lg border-border bg-muted/50 text-sm"
              />
            </div>

            <div className="border-t border-border" />

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={contactName}
                onChange={(e) => onContactNameChange(e.target.value)}
                placeholder="AI Agent"
                className="h-10 rounded-lg border-border bg-background text-sm"
              />
            </div>

            <div className="border-t border-border" />

            {/* Pick avatar */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <Label className="text-sm font-semibold text-foreground">Pick avatar</Label>
                <Tabs value={avatarTab} onValueChange={setAvatarTab}>
                  <TabsList className="h-9 bg-muted">
                    <TabsTrigger value="gallery" className="text-sm">Gallery</TabsTrigger>
                    <TabsTrigger value="upload" className="text-sm">Image upload</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {avatarTab === "gallery" && (
                <div className="rounded-xl bg-muted/60 p-2">
                  <div className="max-h-[100px] overflow-y-auto grid grid-cols-6 gap-1 p-1">
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
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => avatarInputRef.current?.click()}>
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
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
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
                className="min-h-[60px] resize-none rounded-lg border-border bg-muted/50 text-sm"
              />
            </div>

            <div className="border-t border-border" />

            {/* Pick theme and color */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-foreground">Pick theme and color</label>
              
              {/* Theme cards */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Light */}
                <button
                  onClick={() => onWidgetThemeChange("light")}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    widgetTheme === "light" ? "border-foreground" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="bg-[#f4f4f5] p-3 pb-2">
                    <div className="rounded-lg bg-white p-2.5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-muted" />
                        <div className="h-2 w-16 rounded-full bg-muted" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-muted/70" />
                        <div className="h-1.5 w-3/4 rounded-full bg-muted/70" />
                      </div>
                    </div>
                  </div>
                  {widgetTheme === "light" && (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <p className="py-1.5 text-center text-xs font-medium text-foreground">Light</p>
                </button>

                {/* Dark */}
                <button
                  onClick={() => onWidgetThemeChange("dark")}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    widgetTheme === "dark" ? "border-foreground" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="bg-[#f4f4f5] p-3 pb-2">
                    <div className="rounded-lg bg-[#1e293b] p-2.5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-cyan-400" />
                        <div className="h-2 w-16 rounded-full bg-slate-600" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-slate-600" />
                        <div className="h-1.5 w-3/4 rounded-full bg-slate-600" />
                      </div>
                    </div>
                  </div>
                  {widgetTheme === "dark" && (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <p className="py-1.5 text-center text-xs font-medium text-foreground">Dark</p>
                </button>
              </div>

              {/* Color circles */}
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => {
                  const isSelected = widgetColor.toLowerCase() === c.hex.toLowerCase() || widgetColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => onWidgetColorChange(c.hex)}
                      className={`relative h-9 w-9 rounded-full transition-all ${
                        isSelected ? "ring-2 ring-foreground ring-offset-2" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
                {/* Custom color picker */}
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className={`relative h-9 w-9 rounded-full border-2 border-border transition-all hover:scale-110 overflow-hidden ${
                    !presetColors.some(c => c.hex.toLowerCase() === widgetColor.toLowerCase() || c.name === widgetColor)
                      ? "ring-2 ring-foreground ring-offset-2"
                      : ""
                  }`}
                  style={{
                    background: "conic-gradient(from 0deg, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #9c27b0, #f44336)",
                  }}
                >
                  <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center">
                    <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={widgetColor.startsWith("#") ? widgetColor : "#3B82F6"}
                    onChange={(e) => onWidgetColorChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </button>
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Background</label>
              <p className="mb-3 text-xs text-muted-foreground">Choose the widget header background style.</p>
              <div className="space-y-2">
                {/* Solid */}
                <button
                  onClick={() => onBackgroundTypeChange("solid")}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    backgroundType === "solid"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    backgroundType === "solid" ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {backgroundType === "solid" && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">Solid</span>
                    <span className="ml-1.5 text-xs text-muted-foreground italic">(Theme color as background)</span>
                  </div>
                </button>

                {/* Gradient */}
                <button
                  onClick={() => onBackgroundTypeChange("gradient")}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    backgroundType === "gradient"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    backgroundType === "gradient" ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {backgroundType === "gradient" && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">Gradient</span>
                    <span className="ml-1.5 text-xs text-muted-foreground italic">(Auto-generated from theme color)</span>
                  </div>
                </button>

                {/* Image */}
                <button
                  onClick={() => onBackgroundTypeChange("image")}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                    backgroundType === "image"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    backgroundType === "image" ? "border-primary" : "border-muted-foreground/40"
                  }`}>
                    {backgroundType === "image" && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">Image</span>
                    <span className="ml-1.5 text-xs text-muted-foreground italic">(720×600 custom image)</span>
                  </div>
                </button>
              </div>

              {/* Image upload area - shown only when "image" is selected */}
              {backgroundType === "image" && (
                <div className="mt-3">
                  {backgroundImage ? (
                    <div className="flex items-center gap-3">
                      <img src={backgroundImage} alt="Background" className="h-12 w-16 rounded-lg object-cover border border-border" />
                      <Button variant="secondary" size="sm" onClick={() => onBackgroundImageChange(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="bg-image-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => onBackgroundImageChange(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="bg-image-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload image
                      </label>
                    </>
                  )}
                </div>
              )}
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

      {/* Footer with Save/Cancel - only shown when changes exist */}
      {hasChanges && (
        <div className="shrink-0 border-t border-border px-6 py-3 flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} className="rounded-lg px-5">
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-lg px-6">
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppearancePanel;
