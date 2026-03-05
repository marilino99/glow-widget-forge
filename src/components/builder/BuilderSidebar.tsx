import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Phone,
  Users,
  MessageCircle,
  HelpCircle,
  Link2,
  LayoutGrid,
  Gift,
  LogOut,
  Star,
  Palette,
  Type,
  Maximize2,
  Code,
  Instagram,
  BarChart3,
  Sparkles,
  Settings,
  LifeBuoy,
  ChevronRight,
  Bot,
  LayoutTemplate,
  Home,
  ChevronsLeft,
  ArrowUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SidebarItem from "./SidebarItem";
import ContactCardPanel from "./ContactCardPanel";
import ThemeColorsPanel from "./ThemeColorsPanel";
import ProductCarouselPanel from "./ProductCarouselPanel";
import TypographyPanel from "./TypographyPanel";
import FaqPanel from "./FaqPanel";
import InstagramPanel from "./InstagramPanel";
import GoogleReviewsPanel from "./GoogleReviewsPanel";
import WhatsAppPanel from "./WhatsAppPanel";
import CustomLinksPanel from "./CustomLinksPanel";
import MetricsPanel from "./MetricsPanel";
import SizePositionPanel from "./SizePositionPanel";
import InjectionCodePanel from "./InjectionCodePanel";
import SettingsDialog from "./SettingsDialog";
import ChatbotPanel from "./ChatbotPanel";
import TemplatesPanel, { WidgetTemplate } from "./TemplatesPanel";
import AddToWebsiteDialog from "./AddToWebsiteDialog";
import { ProductCardData } from "@/types/productCard";
import { FaqItemData } from "@/types/faqItem";
import { InstagramPostData } from "@/types/instagramPost";
import { LocalLink } from "./CustomLinksPanel";
import { GoogleBusinessData } from "./GoogleReviewsPanel";
import { supabase } from "@/integrations/supabase/client";

interface BuilderSidebarProps {
  onSelectWidget: (widgetType: string) => void;
  activeWidget: string | null;
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
  faqEnabled: boolean;
  onFaqToggle: (enabled: boolean) => void;
  contactName: string;
  onContactNameChange: (name: string) => void;
  offerHelp: string;
  onOfferHelpChange: (help: string) => void;
  widgetTheme: "light" | "dark";
  onWidgetThemeChange: (theme: "light" | "dark") => void;
  widgetColor: string;
  onWidgetColorChange: (color: string) => void;
  buttonLogo: string | null;
  onButtonLogoChange: (logo: string | null) => void;
  backgroundType: "solid" | "gradient" | "image";
  onBackgroundTypeChange: (type: "solid" | "gradient" | "image") => void;
  backgroundImage: string | null;
  onBackgroundImageChange: (image: string | null) => void;
  onSaveConfig: (config: Record<string, unknown>) => void;
  productCards: ProductCardData[];
  onAddProductCard: (card: ProductCardData) => void;
  onUpdateProductCard: (cardId: string, updates: Partial<ProductCardData>) => void;
  onDeleteProductCard: (cardId: string) => void;
  onProductCardPreviewUpdate?: (cardId: string | null, updates: Partial<ProductCardData> | null) => void;
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  sayHello: string;
  onSayHelloChange: (text: string) => void;
  initialLogo: string | null;
  initialLanguage: string;
  initialSayHello: string;
  faqItems: FaqItemData[];
  onAddFaqItem: () => void;
  onUpdateFaqItem: (itemId: string, updates: Partial<FaqItemData>) => void;
  onDeleteFaqItem: (itemId: string) => void;
  onReorderFaqItems: (fromIndex: number, toIndex: number) => void;
  instagramEnabled: boolean;
  onInstagramToggle: (enabled: boolean) => void;
  instagramPosts: InstagramPostData[];
  onAddInstagramPost: (url: string, thumbnailUrl?: string) => Promise<void>;
  onUpdateInstagramPost: (postId: string, updates: Partial<InstagramPostData>) => void;
  onDeleteInstagramPost: (postId: string) => void;
  onReorderInstagramPosts: (fromIndex: number, toIndex: number) => void;
  whatsappEnabled: boolean;
  onWhatsappToggle: (enabled: boolean) => void;
  whatsappCountryCode: string;
  onWhatsappCountryCodeChange: (code: string) => void;
  whatsappNumber: string;
  onWhatsappNumberChange: (number: string) => void;
  onLocalLinksChange?: (links: LocalLink[]) => void;
  reportBugsEnabled: boolean;
  onReportBugsChange: (enabled: boolean) => void;
  shareFeedbackEnabled: boolean;
  onShareFeedbackChange: (enabled: boolean) => void;
  forwardEmail: string;
  onForwardEmailChange: (email: string) => void;
  isPro: boolean;
  subscriptionEnd?: string | null;
  onUpgrade: () => void;
  onGoogleBusinessSelect?: (business: GoogleBusinessData | null) => void;
  customCss: string;
  customJs: string;
  onInjectionCodeLivePreview?: (css: string, js: string) => void;
  userEmail?: string;
  onSignOut?: () => void;
  onPanelOpenChange?: (isOpen: boolean) => void;
  onCollapseSidebar?: () => void;
  showBranding: boolean;
  onShowBrandingChange: (show: boolean) => void;
  chatbotEnabled: boolean;
  onChatbotToggle: (enabled: boolean) => void;
  chatbotInstructions: string;
  aiProvider: string;
  aiApiKey: string;
  aiTemperature: number;
  aiTone: string;
  onSaveChatbotConfig: (config: Record<string, unknown>) => void;
  widgetPosition: "left" | "right";
  onWidgetPositionChange: (position: "left" | "right") => void;
  widgetType: "popup" | "bottom-bar";
  onWidgetTypeChange: (type: "popup" | "bottom-bar") => void;
  initialGoogleReviewsEnabled?: boolean;
  initialHasGoogleBusiness?: boolean;
  builderView: "home" | "editor" | "conversations" | "contacts" | "appearance" | "ai" | null;
  onBuilderViewChange: (view: "home" | "editor" | "conversations" | "contacts" | "appearance" | "ai" | null) => void;
  isMiniSidebar?: boolean;
  widgetId?: string;
  aiResponsesThisMonth: number;
  aiResponseLimit: number;
  isApproachingLimit: boolean;
  isAtLimit: boolean;
}

const BuilderSidebar = ({
  onSelectWidget, 
  activeWidget, 
  selectedAvatar, 
  onSelectAvatar, 
  faqEnabled, 
  onFaqToggle,
  contactName,
  onContactNameChange,
  offerHelp,
  onOfferHelpChange,
  widgetTheme,
  onWidgetThemeChange,
  widgetColor,
  onWidgetColorChange,
  buttonLogo,
  onButtonLogoChange,
  backgroundType,
  onBackgroundTypeChange,
  backgroundImage,
  onBackgroundImageChange,
  onSaveConfig,
  productCards,
  onAddProductCard,
  onUpdateProductCard,
  onDeleteProductCard,
  onProductCardPreviewUpdate,
  logo,
  onLogoChange,
  language,
  onLanguageChange,
  sayHello,
  onSayHelloChange,
  initialLogo,
  initialLanguage,
  initialSayHello,
  faqItems,
  onAddFaqItem,
  onUpdateFaqItem,
  onDeleteFaqItem,
  onReorderFaqItems,
  instagramEnabled,
  onInstagramToggle,
  instagramPosts,
  onAddInstagramPost,
  onUpdateInstagramPost,
  onDeleteInstagramPost,
  onReorderInstagramPosts,
  whatsappEnabled,
  onWhatsappToggle,
  whatsappCountryCode,
  onWhatsappCountryCodeChange,
  whatsappNumber,
  onWhatsappNumberChange,
  onLocalLinksChange,
  reportBugsEnabled,
  onReportBugsChange,
  shareFeedbackEnabled,
  onShareFeedbackChange,
  forwardEmail,
  onForwardEmailChange,
  isPro,
  subscriptionEnd,
  onUpgrade,
  onGoogleBusinessSelect,
  customCss,
  customJs,
  onInjectionCodeLivePreview,
  userEmail,
  onSignOut,
  onPanelOpenChange,
  onCollapseSidebar,
  showBranding,
  onShowBrandingChange,
  chatbotEnabled,
  onChatbotToggle,
  chatbotInstructions,
  aiProvider,
  aiApiKey,
  aiTemperature,
  aiTone,
  onSaveChatbotConfig,
  widgetPosition,
  onWidgetPositionChange,
  widgetType,
  onWidgetTypeChange,
  initialGoogleReviewsEnabled,
  initialHasGoogleBusiness,
  builderView,
  onBuilderViewChange,
  isMiniSidebar,
  widgetId,
  aiResponsesThisMonth,
  aiResponseLimit,
  isApproachingLimit,
  isAtLimit,
}: BuilderSidebarProps) => {
  const navigate = useNavigate();
  
  const [showContactCardPanel, setShowContactCardPanel] = useState(false);
  const [showThemeColorsPanel, setShowThemeColorsPanel] = useState(false);
  const [showProductCarouselPanel, setShowProductCarouselPanel] = useState(false);
  const [showTypographyPanel, setShowTypographyPanel] = useState(false);
  const [showInstagramPanel, setShowInstagramPanel] = useState(false);
  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [showWhatsAppPanel, setShowWhatsAppPanel] = useState(false);
  const [showCustomLinksPanel, setShowCustomLinksPanel] = useState(false);
  const [showMetricsPanel, setShowMetricsPanel] = useState(false);
  const [showGoogleReviewsPanel, setShowGoogleReviewsPanel] = useState(false);
  const [showSizePositionPanel, setShowSizePositionPanel] = useState(false);
  const [showInjectionCodePanel, setShowInjectionCodePanel] = useState(false);
  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(initialGoogleReviewsEnabled ?? false);
  const [hasGoogleBusiness, setHasGoogleBusiness] = useState(initialHasGoogleBusiness ?? false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showChatbotPanel, setShowChatbotPanel] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  // Load user profile (avatar + name)
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("avatar_url, first_name").eq("user_id", user.id).single();
      if (data?.avatar_url) setUserAvatarUrl(data.avatar_url);
      if (data?.first_name) setUserDisplayName(data.first_name);
    };
    loadProfile();
  }, []);

  const handleGoogleBusinessSelect = (business: GoogleBusinessData | null) => {
    onGoogleBusinessSelect?.(business);
    if (business) {
      setGoogleReviewsEnabled(true);
      setHasGoogleBusiness(true);
      // Persist to DB
      onSaveConfig({
        googleReviewsEnabled: true,
        googleBusinessName: business.name,
        googleBusinessRating: business.rating ?? null,
        googleBusinessRatingsTotal: business.user_ratings_total ?? null,
        googleBusinessUrl: business.url ?? null,
        googleBusinessPlaceId: business.place_id ?? null,
      } as Record<string, unknown>);
    }
  };

  const handleGoogleReviewsToggle = (enabled: boolean) => {
    setGoogleReviewsEnabled(enabled);
    if (!enabled) onGoogleBusinessSelect?.(null);
    onSaveConfig({ googleReviewsEnabled: enabled } as Record<string, unknown>);
  };

  const handleSelectWidget = (widgetType: string) => {
    if (widgetType === "contact-card") {
      setShowContactCardPanel(true);
    } else if (widgetType === "theme-colors") {
      setShowThemeColorsPanel(true);
    } else if (widgetType === "product-carousel") {
      setShowProductCarouselPanel(true);
    } else if (widgetType === "typography") {
      setShowTypographyPanel(true);
    } else if (widgetType === "faq") {
      setShowFaqPanel(true);
    } else if (widgetType === "instagram") {
      setShowInstagramPanel(true);
    } else if (widgetType === "whatsapp") {
      setShowWhatsAppPanel(true);
    } else if (widgetType === "custom-links") {
      setShowCustomLinksPanel(true);
    } else if (widgetType === "metrics") {
      setShowMetricsPanel(true);
    } else if (widgetType === "google-reviews") {
      setShowGoogleReviewsPanel(true);
    } else if (widgetType === "size-position") {
      setShowSizePositionPanel(true);
    } else if (widgetType === "injection-code") {
      setShowInjectionCodePanel(true);
    } else if (widgetType === "chatbot") {
      setShowChatbotPanel(true);
    } else if (widgetType === "templates") {
      setShowTemplatesPanel(true);
    }
    onPanelOpenChange?.(true);
    onBuilderViewChange("editor");
    onSelectWidget(widgetType);
  };

  const closePanel = () => {
    onPanelOpenChange?.(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromContactCard = () => {
    setShowContactCardPanel(false);
    closePanel();
  };

  const handleBackFromThemeColors = () => {
    setShowThemeColorsPanel(false);
    closePanel();
  };

  const handleBackFromProductCarousel = () => {
    setShowProductCarouselPanel(false);
    closePanel();
  };

  const handleBackFromTypography = () => {
    setShowTypographyPanel(false);
    closePanel();
  };

  const handleBackFromFaq = () => {
    setShowFaqPanel(false);
    closePanel();
  };

  const handleBackFromInstagram = () => {
    setShowInstagramPanel(false);
    closePanel();
  };

  const handleBackFromWhatsApp = () => {
    setShowWhatsAppPanel(false);
    closePanel();
  };

  const handleBackFromCustomLinks = () => {
    setShowCustomLinksPanel(false);
    closePanel();
  };

  const handleBackFromMetrics = () => {
    setShowMetricsPanel(false);
    closePanel();
  };

  const handleBackFromGoogleReviews = () => {
    setShowGoogleReviewsPanel(false);
    closePanel();
  };

  const handleBackFromSizePosition = () => {
    setShowSizePositionPanel(false);
    closePanel();
  };

  const handleBackFromInjectionCode = () => {
    setShowInjectionCodePanel(false);
    closePanel();
  };

  const handleBackFromChatbot = () => {
    setShowChatbotPanel(false);
    closePanel();
  };

  const handleBackFromTemplates = () => {
    setShowTemplatesPanel(false);
    closePanel();
  };

  const handleApplyTemplate = (template: WidgetTemplate) => {
    onWidgetThemeChange(template.theme);
    onWidgetColorChange(template.color);
    onBackgroundTypeChange(template.backgroundType);
    onSayHelloChange(template.sayHello);
    onSaveConfig({
      widgetTheme: template.theme,
      widgetColor: template.color,
      backgroundType: template.backgroundType,
      sayHello: template.sayHello,
    });
  };

  // Check if typography has unsaved changes
  const hasTypographyUnsavedChanges = 
    logo !== initialLogo || 
    language !== initialLanguage || 
    sayHello !== initialSayHello;

  const handleTypographyCancel = () => {
    onLogoChange(initialLogo);
    onLanguageChange(initialLanguage);
    onSayHelloChange(initialSayHello);
  };

  const handleTypographySave = (config: Record<string, unknown>) => {
    onSaveConfig(config);
  };

  // Show Metrics panel
  if (showMetricsPanel) {
    return (
      <MetricsPanel onBack={handleBackFromMetrics} isPro={isPro} onUpgrade={onUpgrade} />
    );
  }

  // Show Custom Links panel
  if (showCustomLinksPanel) {
    return (
      <CustomLinksPanel
        onBack={handleBackFromCustomLinks}
        onLocalLinksChange={onLocalLinksChange}
      />
    );
  }

  // Show Instagram panel
  if (showInstagramPanel) {
    return (
      <InstagramPanel
        onBack={handleBackFromInstagram}
        instagramEnabled={instagramEnabled}
        onInstagramToggle={onInstagramToggle}
        instagramPosts={instagramPosts}
        onAddPost={onAddInstagramPost}
        onUpdatePost={onUpdateInstagramPost}
        onDeletePost={onDeleteInstagramPost}
        onReorderPosts={onReorderInstagramPosts}
      />
    );
  }

  // Show WhatsApp panel
  if (showWhatsAppPanel) {
    return (
      <WhatsAppPanel
        onBack={handleBackFromWhatsApp}
        whatsappEnabled={whatsappEnabled}
        onWhatsappToggle={onWhatsappToggle}
        whatsappCountryCode={whatsappCountryCode}
        onWhatsappCountryCodeChange={onWhatsappCountryCodeChange}
        whatsappNumber={whatsappNumber}
        onWhatsappNumberChange={onWhatsappNumberChange}
        onSaveConfig={onSaveConfig}
      />
    );
  }

  // Show FAQ panel
  if (showFaqPanel) {
    return (
      <FaqPanel
        onBack={handleBackFromFaq}
        faqEnabled={faqEnabled}
        onFaqToggle={onFaqToggle}
        faqItems={faqItems}
        onAddFaqItem={onAddFaqItem}
        onUpdateFaqItem={onUpdateFaqItem}
        onDeleteFaqItem={onDeleteFaqItem}
        onReorderFaqItems={onReorderFaqItems}
      />
    );
  }

  // Show Typography panel
  if (showTypographyPanel) {
    return (
      <TypographyPanel
        onBack={handleBackFromTypography}
        logo={logo}
        onLogoChange={onLogoChange}
        language={language}
        onLanguageChange={onLanguageChange}
        sayHello={sayHello}
        onSayHelloChange={onSayHelloChange}
        onSaveConfig={handleTypographySave}
        hasUnsavedChanges={hasTypographyUnsavedChanges}
        onCancel={handleTypographyCancel}
      />
    );
  }

  // Show Product Carousel panel
  if (showProductCarouselPanel) {
    return (
      <ProductCarouselPanel 
        onBack={handleBackFromProductCarousel}
        addedCards={productCards}
        onAddCard={onAddProductCard}
        onUpdateCard={onUpdateProductCard}
        onDeleteCard={onDeleteProductCard}
        onPreviewUpdate={onProductCardPreviewUpdate}
      />
    );
  }

  // Show Theme Colors panel
  if (showThemeColorsPanel) {
    return (
      <ThemeColorsPanel 
        onBack={handleBackFromThemeColors}
        widgetTheme={widgetTheme}
        onWidgetThemeChange={onWidgetThemeChange}
        widgetColor={widgetColor}
        onWidgetColorChange={onWidgetColorChange}
        buttonLogo={buttonLogo}
        onButtonLogoChange={onButtonLogoChange}
        backgroundType={backgroundType}
        onBackgroundTypeChange={onBackgroundTypeChange}
        backgroundImage={backgroundImage}
        onBackgroundImageChange={onBackgroundImageChange}
        onSaveConfig={onSaveConfig}
      />
    );
  }

  // Show Contact Card detail panel
  if (showContactCardPanel) {
    return (
      <ContactCardPanel
        onBack={handleBackFromContactCard}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={onSelectAvatar}
        contactName={contactName}
        onContactNameChange={onContactNameChange}
        offerHelp={offerHelp}
        onOfferHelpChange={onOfferHelpChange}
        onSaveConfig={onSaveConfig}
        reportBugsEnabled={reportBugsEnabled}
        onReportBugsChange={onReportBugsChange}
        shareFeedbackEnabled={shareFeedbackEnabled}
        onShareFeedbackChange={onShareFeedbackChange}
        forwardEmail={forwardEmail}
        onForwardEmailChange={onForwardEmailChange}
        logo={logo}
        onLogoChange={onLogoChange}
        sayHello={sayHello}
        onSayHelloChange={onSayHelloChange}
      />
    );
  }


  // Show Injection Code panel
  if (showInjectionCodePanel) {
    return (
      <InjectionCodePanel
        onBack={handleBackFromInjectionCode}
        customCss={customCss}
        customJs={customJs}
        onSave={onSaveConfig}
        onLivePreviewChange={onInjectionCodeLivePreview}
      />
    );
  }



  // Show Templates panel
  if (showTemplatesPanel) {
    return (
      <TemplatesPanel
        onBack={handleBackFromTemplates}
        isPro={isPro}
        onUpgrade={onUpgrade}
        onApplyTemplate={handleApplyTemplate}
        widgetType={widgetType}
        onWidgetTypeChange={onWidgetTypeChange}
        hasGoogleBusiness={hasGoogleBusiness}
        googleReviewsEnabled={googleReviewsEnabled}
        onGoogleReviewsToggle={handleGoogleReviewsToggle}
        onOpenGoogleReviews={() => {
          setShowTemplatesPanel(false);
          handleSelectWidget("google-reviews");
        }}
      />
    );
  }

  // Show Google Reviews panel
  if (showGoogleReviewsPanel) {
    return (
      <GoogleReviewsPanel onBack={handleBackFromGoogleReviews} onBusinessSelect={handleGoogleBusinessSelect} />
    );
  }

  const userInitial = userEmail?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-full flex-col bg-[#fafafa]">
      <div className={`flex-1 overflow-hidden ${isMiniSidebar ? 'px-1.5' : 'px-4'} py-3`}>
        
        {/* Home */}
        <div className="mb-6 -mt-3">
          <div className="space-y-0.5">
            <SidebarItem
              icon={Home}
              label="Home"
              active={builderView === "home"}
              onClick={() => onBuilderViewChange("home")}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={MessageCircle}
              label="Conversations"
              active={builderView === "conversations"}
              onClick={() => onBuilderViewChange("conversations")}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={Users}
              label="Contacts"
              active={builderView === "contacts"}
              onClick={() => onBuilderViewChange("contacts")}
              miniMode={isMiniSidebar}
            />
          </div>
        </div>
        {/* Provide help section */}
        <div className="mb-6">
          {!isMiniSidebar && (
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "#787880" }}>
              Product
            </p>
          )}
          <div className="space-y-0.5">
            <SidebarItem
              icon={Palette}
              label="Appearance"
              active={builderView === "appearance"}
              onClick={() => onBuilderViewChange("appearance")}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={Bot}
              label="AI Chatbot"
              active={builderView === "ai"}
              onClick={() => onBuilderViewChange("ai")}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={LayoutTemplate}
              label="Templates"
              onClick={() => handleSelectWidget("templates")}
              active={activeWidget === "templates"}
              miniMode={isMiniSidebar}
            />
          </div>
        </div>

      </div>

      {/* Publish button */}
      <div className={`shrink-0 ${isMiniSidebar ? 'px-1.5' : 'px-3'} pb-2`}>
        <AddToWebsiteDialog widgetId={widgetId} fullWidth={!isMiniSidebar} />
      </div>

      {/* Usage overview */}
      {!isMiniSidebar && (
        <div className={`shrink-0 px-3 pb-2`}>
          <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
            {/* Responses header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Responses</span>
              <span className="text-sm text-foreground">{aiResponsesThisMonth.toLocaleString()} / {aiResponseLimit.toLocaleString()}</span>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${Math.min((aiResponsesThisMonth / aiResponseLimit) * 100, 100)}%` }}
              />
            </div>

            <div className="h-px w-full bg-border" />

            {/* Reset date */}
            {(() => {
              const resetDate = subscriptionEnd
                ? new Date(subscriptionEnd)
                : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
              return (
                <p className="text-xs text-muted-foreground">
                  Resets on {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {resetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              );
            })()}

            {/* Upgrade button */}
            {!isPro && (
              <div className="group relative p-[2px] rounded-xl overflow-hidden cursor-pointer" onClick={onUpgrade}>
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#f97316,#ec4899,#a855f7,#f97316)] opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ animation: "rainbow-spin 4s linear infinite" }} />
                <button className="relative w-full flex items-center justify-center gap-2.5 rounded-[10px] bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground">
                    <ArrowUp className="h-3.5 w-3.5 text-background" />
                  </div>
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default BuilderSidebar;
