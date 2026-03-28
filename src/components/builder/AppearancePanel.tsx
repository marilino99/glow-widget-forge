import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImagePlus, Upload, Loader2, Sparkles, Check, Pipette, MessageCircle, Bug, Star, HelpCircle, Link2, ShoppingBag, Plus, Trash2, GripVertical, ExternalLink, Instagram, ChevronRight, ChevronDown, Eye, Clock, Search, MapPin, Film } from "lucide-react";
import { GoogleBusinessData } from "@/components/builder/GoogleReviewsPanel";
import { FaqItemData } from "@/types/faqItem";
import { CustomLinkData } from "@/types/customLink";
import { ProductCardData } from "@/types/productCard";
import { InstagramPostData } from "@/types/instagramPost";
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
  productCarouselEnabled: boolean;
  onProductCarouselToggle: (enabled: boolean) => void;
  onAddProductCard: (card: ProductCardData) => void;
  onUpdateProductCard: (id: string, updates: Partial<ProductCardData>) => void;
  onDeleteProductCard: (id: string) => void;
  // Instagram UGC
  instagramEnabled: boolean;
  onInstagramToggle: (enabled: boolean) => void;
  instagramPosts: InstagramPostData[];
  onAddInstagramPost: (url: string, thumbnailUrl?: string) => Promise<void>;
  onUpdateInstagramPost: (postId: string, updates: Partial<InstagramPostData>) => void;
  onDeleteInstagramPost: (postId: string) => void;
  onReorderInstagramPosts: (fromIndex: number, toIndex: number) => void;
  // Widget button
  widgetPosition: "left" | "right";
  onWidgetPositionChange: (position: "left" | "right") => void;
  buttonLogo: string | null;
  onButtonLogoChange: (logo: string | null) => void;
  // Style tab - widget type & google reviews
  widgetType: "popup" | "bottom-bar" | "search-bar";
  onWidgetTypeChange: (type: "popup" | "bottom-bar" | "search-bar") => void;
  hasGoogleBusiness?: boolean;
  googleReviewsEnabled?: boolean;
  onGoogleReviewsToggle?: (enabled: boolean) => void;
  onOpenGoogleReviews?: () => void;
  onBusinessSelect?: (business: GoogleBusinessData | null) => void;
  savedGoogleBusiness?: GoogleBusinessData | null;
  // Inspire Me
  inspireEnabled: boolean;
  onInspireToggle: (enabled: boolean) => void;
  inspireVideos: import("@/hooks/useInspireVideos").InspireVideo[];
  onAddInspireVideo: (file: File) => Promise<void>;
  onDeleteInspireVideo: (videoId: string) => void;
  onUpdateInspireLinkedProducts: (videoId: string, productIds: string[]) => void;
  // Store products for linking to Inspire videos (from connected store)
  inspireStoreProducts: ProductCardData[];
  hasStoreConnection: boolean;
  // Home section order
  homeSectionOrder: string[];
  onHomeSectionOrderChange: (order: string[]) => void;
  // Navigation to section panels
  onNavigateToSection?: (sectionKey: string) => void;
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
  productCarouselEnabled,
  onProductCarouselToggle,
  onAddProductCard,
  onUpdateProductCard,
  onDeleteProductCard,
  instagramEnabled,
  onInstagramToggle,
  instagramPosts,
  onAddInstagramPost,
  onUpdateInstagramPost,
  onDeleteInstagramPost,
  onReorderInstagramPosts,
  widgetPosition,
  onWidgetPositionChange,
  buttonLogo,
  onButtonLogoChange,
  widgetType,
  onWidgetTypeChange,
  hasGoogleBusiness,
  googleReviewsEnabled,
  onGoogleReviewsToggle,
  onOpenGoogleReviews,
  onBusinessSelect,
  savedGoogleBusiness,
  inspireEnabled,
  onInspireToggle,
  inspireVideos,
  onAddInspireVideo,
  onDeleteInspireVideo,
  onUpdateInspireLinkedProducts,
  inspireStoreProducts,
  hasStoreConnection,
  homeSectionOrder,
  onHomeSectionOrderChange,
}: AppearancePanelProps) => {
  const inspireFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingInspire, setIsUploadingInspire] = useState(false);
  const [expandedInspireVideoId, setExpandedInspireVideoId] = useState<string | null>(null);
  const [inspireProductSearch, setInspireProductSearch] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarTab, setAvatarTab] = useState("gallery");
  const [isUploading, setIsUploading] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [googleExpanded, setGoogleExpanded] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [googleLinkValue, setGoogleLinkValue] = useState("");
  const [googleSearchTab, setGoogleSearchTab] = useState<"search" | "link">("search");
  const [googlePredictions, setGooglePredictions] = useState<any[]>([]);
  const [isGoogleSearching, setIsGoogleSearching] = useState(false);
  const [googleSelectedBusiness, setGoogleSelectedBusiness] = useState<GoogleBusinessData | null>(null);
  const [isLoadingGoogleDetails, setIsLoadingGoogleDetails] = useState(false);
  const googleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Google Places autocomplete effect
  useEffect(() => {
    if (googleDebounceRef.current) clearTimeout(googleDebounceRef.current);
    if (googleSearchQuery.length < 2 || googleSelectedBusiness) {
      setGooglePredictions([]);
      return;
    }
    googleDebounceRef.current = setTimeout(async () => {
      setIsGoogleSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("google-places-autocomplete", {
          body: { query: googleSearchQuery },
        });
        if (error) throw error;
        setGooglePredictions(data?.predictions || []);
      } catch (err) {
        console.error("Autocomplete error:", err);
        setGooglePredictions([]);
      } finally {
        setIsGoogleSearching(false);
      }
    }, 350);
    return () => { if (googleDebounceRef.current) clearTimeout(googleDebounceRef.current); };
  }, [googleSearchQuery, googleSelectedBusiness]);

  const handleGoogleSelectBusiness = async (prediction: any) => {
    setGooglePredictions([]);
    setGoogleSearchQuery(prediction.structured_formatting?.main_text || prediction.description);
    setIsLoadingGoogleDetails(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-places-autocomplete", {
        body: { place_id: prediction.place_id },
      });
      if (error) throw error;
      const business: GoogleBusinessData = { ...data?.result, place_id: prediction.place_id };
      setGoogleSelectedBusiness(business);
    } catch (err) {
      console.error("Place details error:", err);
    } finally {
      setIsLoadingGoogleDetails(false);
    }
  };

  const handleGoogleSearchChange = (value: string) => {
    setGoogleSearchQuery(value);
    if (googleSelectedBusiness) setGoogleSelectedBusiness(null);
  };

  const handleGoogleSaveAndEnable = () => {
    if (!googleSelectedBusiness) return;
    onBusinessSelect?.(googleSelectedBusiness);
    onGoogleReviewsToggle?.(true);
  };

  const handleGoogleRemove = () => {
    onBusinessSelect?.(null);
    onGoogleReviewsToggle?.(false);
    setGoogleSelectedBusiness(null);
    setGoogleSearchQuery("");
  };

  const truncateUrl = (url: string, maxLen = 40) => {
    try {
      const u = new URL(url);
      const display = u.origin + u.pathname;
      return display.length > maxLen ? display.slice(0, maxLen) + "..." : display;
    } catch {
      return url.length > maxLen ? url.slice(0, maxLen) + "..." : url;
    }
  };

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
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
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

        {activeTab === "style" && (
          <div className="max-w-xs mx-auto space-y-6 pb-48">
            {/* Widget Type Selector */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Widget type</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onWidgetTypeChange("popup")}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    widgetType === "popup"
                      ? "border-foreground bg-card shadow-sm"
                      : "border-border bg-card/50"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <MessageCircle className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Popup</span>
                </button>
                <button
                  onClick={() => onWidgetTypeChange("bottom-bar")}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    widgetType === "bottom-bar"
                      ? "border-foreground bg-card shadow-sm"
                      : "border-border bg-card/50"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Star className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground">Bottom Bar</span>
                </button>
                <button
                  onClick={() => onWidgetTypeChange("search-bar")}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    widgetType === "search-bar"
                      ? "border-foreground bg-card shadow-sm"
                      : "border-border bg-card/50"
                  }`}
                >
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                     <Search className="h-5 w-5 text-foreground" />
                   </div>
                   <span className="text-xs font-medium text-foreground">Search Bar</span>
                   <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Coming soon</span>
                 </button>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Add-ons */}
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Add-ons</p>
              <button
                onClick={() => setGoogleExpanded(!googleExpanded)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-muted/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Star className="h-4 w-4 text-foreground" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">Google reviews</span>
                {hasGoogleBusiness && onGoogleReviewsToggle && (
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch checked={googleReviewsEnabled} onCheckedChange={onGoogleReviewsToggle} />
                  </span>
                )}
                {googleExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Inline Google Reviews content */}
              {googleExpanded && (
                <div className="mt-3 space-y-4 px-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enhance your business's credibility and customer appeal by displaying Google Reviews right on your website!
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">Visible once per visit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">Shows up for 8 seconds</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">Asks customer to leave a review</span>
                    </div>
                  </div>

                  {/* Saved state */}
                  {savedGoogleBusiness ? (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground leading-tight">{savedGoogleBusiness.name}</h4>
                        {(savedGoogleBusiness.url || savedGoogleBusiness.website) && (
                          <button
                            onClick={() => window.open(savedGoogleBusiness.url || savedGoogleBusiness.website, "_blank")}
                            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      {savedGoogleBusiness.rating != null && (
                        <p className="mt-1 text-xs">
                          <span className="font-bold text-foreground">{savedGoogleBusiness.rating}</span>
                          {savedGoogleBusiness.user_ratings_total != null && (
                            <span className="text-muted-foreground"> ({savedGoogleBusiness.user_ratings_total} reviews)</span>
                          )}
                        </p>
                      )}
                      {savedGoogleBusiness.formatted_address && (
                        <p className="mt-1 text-xs text-muted-foreground">{savedGoogleBusiness.formatted_address}</p>
                      )}
                      {savedGoogleBusiness.website && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{truncateUrl(savedGoogleBusiness.website)}</p>
                      )}
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleGoogleRemove}
                          className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Tabs value={googleSearchTab} onValueChange={(v) => setGoogleSearchTab(v as "search" | "link")} className="mb-4">
                        <TabsList className="w-full bg-muted">
                          <TabsTrigger value="search" className="flex-1 text-xs">Search your business</TabsTrigger>
                          <TabsTrigger value="link" className="flex-1 text-xs">Provide link</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      {googleSearchTab === "search" ? (
                        <div>
                          <h3 className="text-xs font-bold text-foreground mb-2">Search your business</h3>
                          <div className="relative">
                            <Input
                              value={googleSearchQuery}
                              onChange={(e) => handleGoogleSearchChange(e.target.value)}
                              placeholder="Enter full name or website address"
                              className="bg-muted border-0 pr-9 text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isGoogleSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : (
                                <Search className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {googlePredictions.length > 0 && (
                              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                                {googlePredictions.map((p: any) => (
                                  <button
                                    key={p.place_id}
                                    onClick={() => handleGoogleSelectBusiness(p)}
                                    className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-accent transition-colors"
                                  >
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-foreground truncate">
                                        {p.structured_formatting?.main_text || p.description}
                                      </p>
                                      {p.structured_formatting?.secondary_text && (
                                        <p className="text-[11px] text-muted-foreground truncate">
                                          {p.structured_formatting.secondary_text}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {isLoadingGoogleDetails && (
                            <div className="mt-3 flex items-center justify-center gap-2 py-4">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Loading business details...</span>
                            </div>
                          )}

                          {googleSelectedBusiness && !isLoadingGoogleDetails && (
                            <div className="mt-3 space-y-3">
                              <div className="rounded-xl border border-border bg-background p-3">
                                <h4 className="text-sm font-bold text-foreground">{googleSelectedBusiness.name}</h4>
                                {googleSelectedBusiness.rating != null && (
                                  <p className="mt-1 text-xs">
                                    <span className="font-bold text-foreground">{googleSelectedBusiness.rating}</span>
                                    {googleSelectedBusiness.user_ratings_total != null && (
                                      <span className="text-muted-foreground"> ({googleSelectedBusiness.user_ratings_total} reviews)</span>
                                    )}
                                  </p>
                                )}
                                {googleSelectedBusiness.formatted_address && (
                                  <p className="mt-1 text-xs text-muted-foreground">{googleSelectedBusiness.formatted_address}</p>
                                )}
                              </div>
                              <Button
                                onClick={handleGoogleSaveAndEnable}
                                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 h-10 text-sm font-semibold"
                              >
                                Save and enable
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xs font-bold text-foreground mb-2">Provide link</h3>
                          <Input
                            value={googleLinkValue}
                            onChange={(e) => setGoogleLinkValue(e.target.value)}
                            placeholder="Paste your Google Reviews link"
                            className="bg-muted border-0 text-sm"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "home-screen" && (() => {
          const sectionRenderers: Record<string, () => React.ReactNode> = {
            "faq": () => (
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
              </div>
            ),
            "custom-links": () => (
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
              </div>
            ),
            "product-carousel": () => (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Product Carousel</p>
                      <p className="text-[11px] text-muted-foreground">Showcase products</p>
                    </div>
                  </div>
                  <Switch checked={productCarouselEnabled} onCheckedChange={onProductCarouselToggle} />
                </div>
              </div>
            ),
            "inspire-me": () => (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Film className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Inspire Me</p>
                      <p className="text-[11px] text-muted-foreground">Video reels with tagged products</p>
                    </div>
                  </div>
                  <Switch checked={inspireEnabled} onCheckedChange={onInspireToggle} />
                </div>
              </div>
            ),
          };

          const handleSectionDrop = (e: React.DragEvent, toIdx: number) => {
            e.preventDefault();
            const fromIdx = parseInt(e.dataTransfer.getData("section-idx"), 10);
            if (isNaN(fromIdx) || fromIdx === toIdx) return;
            const newOrder = [...homeSectionOrder];
            const [moved] = newOrder.splice(fromIdx, 1);
            newOrder.splice(toIdx, 0, moved);
            onHomeSectionOrderChange(newOrder);
          };

          return (
            <div className="max-w-xs mx-auto space-y-1">
              <p className="mb-3 text-xs text-muted-foreground">Drag to reorder sections on the widget home screen.</p>

              {homeSectionOrder.map((sectionKey, idx) => {
                const renderer = sectionRenderers[sectionKey];
                if (!renderer) return null;
                return (
                  <div
                    key={sectionKey}
                    className="relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleSectionDrop(e, idx)}
                  >
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("section-idx", String(idx));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="absolute -left-6 top-2.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    {renderer()}
                  </div>
                );
              })}

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
          );
        })()}


        {activeTab === "widget-button" && (
          <div className="flex-1 p-6 space-y-0">
            {/* Logo */}
            <div className="pb-8">
              <h3 className="text-base font-semibold text-foreground">Logo</h3>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30 overflow-hidden">
                  {buttonLogo ? (
                    <img src={buttonLogo} alt="Button logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="button-logo-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onButtonLogoChange(ev.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <label
                    htmlFor="button-logo-upload"
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </label>
                  {buttonLogo && (
                    <button
                      onClick={() => onButtonLogoChange(null)}
                      className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Button position */}
            <div className="pb-8">
              <h3 className="text-base font-semibold text-foreground">Button position</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose whether the chat button appears on the <strong className="text-foreground">left</strong> or <strong className="text-foreground">right</strong> side of your site.
              </p>
              <RadioGroup
                value={widgetPosition}
                onValueChange={(v) => onWidgetPositionChange(v as "left" | "right")}
                className="mt-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="left" id="pos-left" className="h-5 w-5 border-muted-foreground/40 text-primary" />
                  <Label htmlFor="pos-left" className="text-sm font-medium text-foreground cursor-pointer">Left</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="right" id="pos-right" className="h-5 w-5 border-muted-foreground/40 text-primary" />
                  <Label htmlFor="pos-right" className="text-sm font-medium text-foreground cursor-pointer">Right</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t border-border" />

            {/* Button size */}
            <div className="pt-8">
              <h3 className="text-base font-semibold text-foreground">Button size</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust the button's size to fit your layout.
              </p>
              <RadioGroup
                defaultValue="medium"
                className="mt-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="small" id="size-small" className="h-5 w-5 border-muted-foreground/40 text-primary" />
                  <Label htmlFor="size-small" className="text-sm font-medium text-foreground cursor-pointer">Small (40 px)</Label>
                  <span className="text-sm italic text-muted-foreground">(Compact size, minimal presence)</span>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="medium" id="size-medium" className="h-5 w-5 border-muted-foreground/40 text-primary" />
                  <Label htmlFor="size-medium" className="text-sm font-medium text-foreground cursor-pointer">Medium (60 px)</Label>
                  <span className="text-sm italic text-muted-foreground">(Balanced size for visibility and usability—default option)</span>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="large" id="size-large" className="h-5 w-5 border-muted-foreground/40 text-primary" />
                  <Label htmlFor="size-large" className="text-sm font-medium text-foreground cursor-pointer">Large (80 px)</Label>
                  <span className="text-sm italic text-muted-foreground">(More prominent for high engagement)</span>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-8 border-t border-border" />
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
