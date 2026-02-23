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
  CreditCard,
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
  onSaveChatbotConfig: (config: Record<string, unknown>) => void;
  widgetPosition: "left" | "right";
  onWidgetPositionChange: (position: "left" | "right") => void;
  widgetType: "popup" | "bottom-bar";
  onWidgetTypeChange: (type: "popup" | "bottom-bar") => void;
  initialGoogleReviewsEnabled?: boolean;
  initialHasGoogleBusiness?: boolean;
  builderView: "home" | "editor" | "conversations" | "contacts" | "appearance";
  onBuilderViewChange: (view: "home" | "editor" | "conversations" | "contacts" | "appearance") => void;
  isMiniSidebar?: boolean;
  widgetId?: string;
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
  const [responseCount, setResponseCount] = useState(0);

  // Load response count + realtime subscription
  useEffect(() => {
    let userId: string | null = null;

    const loadResponseCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;
      const { count } = await supabase
        .from("chat_messages")
        .select("id, conversations!inner(widget_owner_id)", { count: "exact", head: true })
        .eq("sender_type", "bot")
        .eq("conversations.widget_owner_id", user.id);
      setResponseCount(count ?? 0);
    };
    loadResponseCount();

    // Listen for new bot messages in realtime
    const channel = supabase
      .channel("response-counter")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          if (payload.new && (payload.new as any).sender_type === "bot") {
            setResponseCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  // Show Size & Position panel
  if (showSizePositionPanel) {
    return (
      <SizePositionPanel onBack={handleBackFromSizePosition} widgetPosition={widgetPosition} onWidgetPositionChange={onWidgetPositionChange} />
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

  // Show Chatbot panel
  if (showChatbotPanel) {
    return (
      <ChatbotPanel
        onBack={handleBackFromChatbot}
        chatbotEnabled={chatbotEnabled}
        onChatbotToggle={onChatbotToggle}
        chatbotInstructions={chatbotInstructions}
        aiProvider={aiProvider}
        aiApiKey={aiApiKey}
        onSaveConfig={onSaveChatbotConfig}
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
              onClick={() => handleSelectWidget("chatbot")}
              active={activeWidget === "chatbot"}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={LayoutTemplate}
              label="Templates"
              onClick={() => handleSelectWidget("templates")}
              active={activeWidget === "templates"}
              miniMode={isMiniSidebar}
            />
            <SidebarItem
              icon={Maximize2}
              label="Size & position"
              onClick={() => handleSelectWidget("size-position")}
              active={activeWidget === "size-position"}
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
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{isPro ? "Pro" : "Free"}</span>
            </div>
            <div className="text-sm text-foreground">
              <span className="font-semibold">{responseCount.toLocaleString()}</span>
              <span className="text-muted-foreground"> / {isPro ? "10,000" : "100"} responses</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min((responseCount / (isPro ? 10000 : 100)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom account section */}
      <div className={`shrink-0 py-2 ${isMiniSidebar ? 'px-1.5' : 'px-3'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex w-full items-center rounded-xl py-2 text-left transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] ${isMiniSidebar ? 'justify-center px-0' : 'gap-3 px-2'}`}>
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                  {userInitial}
                </div>
              )}
              {!isMiniSidebar && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{userDisplayName || userEmail || "Account"}</span>
                  <span className="text-xs text-muted-foreground">{isPro ? "Pro" : "Free"}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[calc(288px-24px)] rounded-2xl p-2">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-2">
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                  {userInitial}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground">{userDisplayName || userInitial}</span>
                <span className="text-xs text-muted-foreground truncate">@{userEmail?.split("@")[0] || "user"}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            {!isPro && (
              <DropdownMenuItem onClick={onUpgrade} className="gap-3 py-2 rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] focus:bg-[hsl(0_0%_93%)] focus:text-foreground">
                <Sparkles className="h-4 w-4" style={{ color: '#D946EF' }} />
                <span style={{ color: '#D946EF' }}>Upgrade plan</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-3 py-2 rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] focus:bg-[hsl(0_0%_93%)] focus:text-foreground" disabled>
              <LayoutGrid className="h-4 w-4" />
              Integrations
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">coming soon</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSettingsDialog(true)} className="gap-3 py-2 rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] focus:bg-[hsl(0_0%_93%)] focus:text-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-2 rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] focus:bg-[hsl(0_0%_93%)] focus:text-foreground">
              <LifeBuoy className="h-4 w-4" />
              Help
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="gap-3 py-2 rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] focus:bg-[hsl(0_0%_93%)] focus:text-foreground">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm rounded-3xl p-8 text-center [&>button]:hidden border-0 shadow-xl" overlayClassName="bg-black/10 backdrop-blur-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-medium text-center text-foreground whitespace-pre-line">
              {"Are you sure you\nwant to log out?"}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              Log out of Widjet as {userEmail}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 mt-2">
            <Button
              onClick={async () => {
                setShowLogoutDialog(false);
                await onSignOut?.();
                navigate("/");
              }}
              className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 py-6 text-base font-normal"
            >
              Log out
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="w-full rounded-full py-6 text-base font-normal sm:mt-0"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        userEmail={userEmail}
        language={language}
        onLanguageChange={onLanguageChange}
        onSaveConfig={onSaveConfig}
        isPro={isPro}
        subscriptionEnd={subscriptionEnd}
        onUpgrade={onUpgrade}
        showBranding={showBranding}
        onShowBrandingChange={onShowBrandingChange}
        onAvatarChange={setUserAvatarUrl}
        onNameChange={setUserDisplayName}
      />
    </div>
  );
};

export default BuilderSidebar;
