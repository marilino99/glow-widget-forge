import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Upload, Loader2, Sparkles, Check, Pipette, MessageCircle, Bug, Star, HelpCircle, Link2, ShoppingBag, Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { FaqItemData } from "@/types/faqItem";
import { CustomLinkData } from "@/types/customLink";
import { ProductCardData } from "@/types/productCard";
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
  ctaText: string;
  onCtaTextChange: (text: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  activeTab: string;
  // Home screen toggles
  whatsappEnabled: boolean;
  onWhatsappToggle: (enabled: boolean) => void;
  whatsappCountryCode: string;
  onWhatsappCountryCodeChange: (code: string) => void;
  whatsappNumber: string;
  onWhatsappNumberChange: (number: string) => void;
  faqEnabled: boolean;
  onFaqToggle: (enabled: boolean) => void;
  faqItems: FaqItemData[];
  onAddFaqItem: (item: FaqItemData) => void;
  onUpdateFaqItem: (id: string, updates: Partial<FaqItemData>) => void;
  onDeleteFaqItem: (id: string) => void;
  onReorderFaqItems: (fromIndex: number, toIndex: number) => void;
  reportBugsEnabled: boolean;
  onReportBugsChange: (enabled: boolean) => void;
  shareFeedbackEnabled: boolean;
  onShareFeedbackChange: (enabled: boolean) => void;
  forwardEmail: string;
  onForwardEmailChange: (email: string) => void;
  // Custom Links
  customLinks: CustomLinkData[];
  onAddCustomLink: (name: string, url: string) => void;
  onUpdateCustomLink: (id: string, updates: Partial<Pick<CustomLinkData, "name" | "url">>) => void;
  onDeleteCustomLink: (id: string) => void;
  onReorderCustomLinks: (reordered: CustomLinkData[]) => void;
  // Product Carousel
  productCards: ProductCardData[];
  onAddProductCard: (card: ProductCardData) => void;
  onUpdateProductCard: (id: string, updates: Partial<ProductCardData>) => void;
  onDeleteProductCard: (id: string) => void;
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
  ctaText,
  onCtaTextChange,
  onSave,
  onCancel,
  activeTab,
  whatsappEnabled,
  onWhatsappToggle,
  whatsappCountryCode,
  onWhatsappCountryCodeChange,
  whatsappNumber,
  onWhatsappNumberChange,
  faqEnabled,
  onFaqToggle,
  faqItems,
  onAddFaqItem,
  onUpdateFaqItem,
  onDeleteFaqItem,
  onReorderFaqItems,
  reportBugsEnabled,
  onReportBugsChange,
  shareFeedbackEnabled,
  onShareFeedbackChange,
  forwardEmail,
  onForwardEmailChange,
  customLinks,
  onAddCustomLink,
  onUpdateCustomLink,
  onDeleteCustomLink,
  onReorderCustomLinks,
  productCards,
  onAddProductCard,
  onUpdateProductCard,
  onDeleteProductCard,
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
    sayHello, selectedAvatar, offerHelp, ctaText, forwardEmail,
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
    offerHelp !== initialValues.offerHelp ||
    ctaText !== initialValues.ctaText ||
    forwardEmail !== initialValues.forwardEmail;

  const handleSave = () => {
    onSave();
    setInitialValues({
      contactName, logo, widgetColor, widgetTheme, backgroundType, backgroundImage,
      sayHello, selectedAvatar, offerHelp, ctaText, forwardEmail,
    });
  };

  const handleCancel = () => {
    onContactNameChange(initialValues.contactName);
    onLogoChange(initialValues.logo);
    onWidgetColorChange(initialValues.widgetColor);
    onWidgetThemeChange(initialValues.widgetTheme);
    onBackgroundTypeChange(initialValues.backgroundType);
    onBackgroundImageChange(initialValues.backgroundImage);
    onSayHelloChange(initialValues.sayHello);
    onSelectAvatar(initialValues.selectedAvatar);
    onOfferHelpChange(initialValues.offerHelp);
    onCtaTextChange(initialValues.ctaText);
    onForwardEmailChange(initialValues.forwardEmail);
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
              <div className="mt-3">
                <Label className="text-sm font-semibold text-foreground">Button text</Label>
                <Input
                  value={ctaText}
                  onChange={(e) => onCtaTextChange(e.target.value)}
                  placeholder="Contact us"
                  className="mt-1 h-8 rounded-lg border-border bg-muted/50 text-sm"
                />
              </div>
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
          <div className="max-w-xs mx-auto space-y-1">
            <p className="mb-3 text-xs text-muted-foreground">Toggle sections visible on the widget home screen.</p>

            {/* WhatsApp */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">WhatsApp</p>
                    <p className="text-[11px] text-muted-foreground">Quick contact button</p>
                  </div>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={onWhatsappToggle} />
              </div>
              {whatsappEnabled && (
                <div className="border-t border-border px-3 py-2.5 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={whatsappCountryCode}
                      onChange={(e) => onWhatsappCountryCodeChange(e.target.value)}
                      placeholder="+39"
                      className="h-8 w-16 rounded-md border-border bg-muted/50 text-xs text-center"
                    />
                    <Input
                      value={whatsappNumber}
                      onChange={(e) => onWhatsappNumberChange(e.target.value.replace(/\D/g, ""))}
                      placeholder="Phone number"
                      className="h-8 flex-1 rounded-md border-border bg-muted/50 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* FAQs */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">FAQs</p>
                    <p className="text-[11px] text-muted-foreground">Frequently asked questions</p>
                  </div>
                </div>
                <Switch checked={faqEnabled} onCheckedChange={onFaqToggle} />
              </div>
              {faqEnabled && (
                <div className="border-t border-border px-3 py-3 space-y-3">
                  {faqItems.map((item, idx) => {
                    const ordinal = idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-card p-4"
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData("faq-idx", String(idx)); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIdx = parseInt(e.dataTransfer.getData("faq-idx"), 10);
                          if (!isNaN(fromIdx) && fromIdx !== idx) onReorderFaqItems(fromIdx, idx);
                        }}
                      >
                        {/* Header row: grip + ordinal + "Question" + delete */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{ordinal}</span>
                          <span className="text-sm font-semibold text-foreground">Question</span>
                          <button
                            onClick={() => onDeleteFaqItem(item.id)}
                            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Question input */}
                        <Input
                          value={item.question}
                          onChange={(e) => onUpdateFaqItem(item.id, { question: e.target.value })}
                          placeholder={`Question ${idx + 1}`}
                          className="mb-3 rounded-xl border-border bg-muted/30 text-sm"
                        />
                        {/* Answer label */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-foreground">Answer</span>
                          <Sparkles className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        {/* Answer textarea */}
                        <Textarea
                          value={item.answer}
                          onChange={(e) => onUpdateFaqItem(item.id, { answer: e.target.value })}
                          placeholder="Enter the answer..."
                          className="min-h-[80px] resize-none rounded-xl border-border bg-muted/30 text-sm"
                        />
                      </div>
                    );
                  })}
                  <button
                    onClick={() => onAddFaqItem({ id: crypto.randomUUID(), question: "", answer: "", sortOrder: faqItems.length })}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add question
                  </button>
                </div>
              )}
            </div>

            {/* Custom Links */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Link2 className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Custom Links</p>
                    <p className="text-[11px] text-muted-foreground">External URL cards</p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{customLinks.length} links</span>
              </div>
              <div className="border-t border-border px-3 py-2.5 space-y-2">
                {customLinks.map((link, idx) => (
                  <div
                    key={link.id}
                    className="flex items-start gap-1.5 group"
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData("link-idx", String(idx)); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIdx = parseInt(e.dataTransfer.getData("link-idx"), 10);
                      if (!isNaN(fromIdx) && fromIdx !== idx) {
                        const newLinks = [...customLinks];
                        const [moved] = newLinks.splice(fromIdx, 1);
                        newLinks.splice(idx, 0, moved);
                        onReorderCustomLinks(newLinks);
                      }
                    }}
                  >
                    <div className="mt-2 cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        value={link.name}
                        onChange={(e) => onUpdateCustomLink(link.id, { name: e.target.value })}
                        placeholder="Link name"
                        className="h-7 rounded-md border-border bg-muted/50 text-xs"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => onUpdateCustomLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="h-7 rounded-md border-border bg-muted/50 text-xs"
                      />
                    </div>
                    <button
                      onClick={() => onDeleteCustomLink(link.id)}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onAddCustomLink("", "")}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add link
                </button>
              </div>
            </div>

            {/* Product Carousel */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Product Carousel</p>
                    <p className="text-[11px] text-muted-foreground">Showcase products</p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">{productCards.length} products</span>
              </div>
              <div className="border-t border-border px-3 py-2.5 space-y-2">
                {productCards.map((card) => (
                  <div key={card.id} className="flex items-start gap-1.5 group">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={card.title}
                        onChange={(e) => onUpdateProductCard(card.id, { title: e.target.value })}
                        placeholder="Product title"
                        className="h-7 rounded-md border-border bg-muted/50 text-xs"
                      />
                      <div className="flex gap-1">
                        <Input
                          value={card.price || ""}
                          onChange={(e) => onUpdateProductCard(card.id, { price: e.target.value })}
                          placeholder="Price"
                          className="h-7 w-20 rounded-md border-border bg-muted/50 text-xs"
                        />
                        <Input
                          value={card.productUrl || ""}
                          onChange={(e) => onUpdateProductCard(card.id, { productUrl: e.target.value })}
                          placeholder="Product URL"
                          className="h-7 flex-1 rounded-md border-border bg-muted/50 text-xs"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteProductCard(card.id)}
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onAddProductCard({ id: crypto.randomUUID(), title: "", isLoading: false })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add product
                </button>
              </div>
            </div>

            {/* Report Bugs */}
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <Bug className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Report Bugs</p>
                  <p className="text-[11px] text-muted-foreground">Let visitors report issues</p>
                </div>
              </div>
              <Switch checked={reportBugsEnabled} onCheckedChange={onReportBugsChange} />
            </div>

            {/* Share Feedback */}
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Share Feedback</p>
                  <p className="text-[11px] text-muted-foreground">Collect user feedback</p>
                </div>
              </div>
              <Switch checked={shareFeedbackEnabled} onCheckedChange={onShareFeedbackChange} />
            </div>

            {/* Forward form inquiries to */}
            <div className="mt-4">
              <Label className="mb-2 block text-sm font-semibold text-foreground">
                Forward form inquires to <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={forwardEmail}
                onChange={(e) => onForwardEmailChange(e.target.value)}
                placeholder="your@email.com"
                className="rounded-xl"
              />
            </div>
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
