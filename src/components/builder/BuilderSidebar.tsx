import { useState } from "react";
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
import { ProductCardData } from "@/types/productCard";
import { FaqItemData } from "@/types/faqItem";
import { InstagramPostData } from "@/types/instagramPost";
import { LocalLink } from "./CustomLinksPanel";
import { GoogleBusinessData } from "./GoogleReviewsPanel";

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
  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(false);
  const [hasGoogleBusiness, setHasGoogleBusiness] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const handleGoogleBusinessSelect = (business: GoogleBusinessData | null) => {
    onGoogleBusinessSelect?.(business);
    if (business) {
      setGoogleReviewsEnabled(true);
      setHasGoogleBusiness(true);
    }
  };

  const handleGoogleReviewsToggle = (enabled: boolean) => {
    setGoogleReviewsEnabled(enabled);
    if (!enabled) onGoogleBusinessSelect?.(null);
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
    }
    onPanelOpenChange?.(true);
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
      />
    );
  }

  // Show Size & Position panel
  if (showSizePositionPanel) {
    return (
      <SizePositionPanel onBack={handleBackFromSizePosition} />
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

  // Show Google Reviews panel
  if (showGoogleReviewsPanel) {
    return (
      <GoogleReviewsPanel onBack={handleBackFromGoogleReviews} onBusinessSelect={handleGoogleBusinessSelect} />
    );
  }

  const userInitial = userEmail?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#f9f9f9' }}>
      <div className="flex-1 overflow-hidden px-4 py-3">
        <h1 className="mb-4 text-lg font-semibold text-foreground">Widget content</h1>

        {/* Provide help section */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Support customer
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={MessageSquare}
              label="Contact card"
              onClick={() => handleSelectWidget("contact-card")}
              active={activeWidget === "contact-card"}
            />
            <SidebarItem
              icon={Phone}
              label="WhatsApp"
              hasToggle
              toggleValue={whatsappEnabled}
              onToggle={onWhatsappToggle}
              onClick={() => handleSelectWidget("whatsapp")}
              active={activeWidget === "whatsapp"}
            />
            <SidebarItem
              icon={HelpCircle}
              label="FAQ"
              hasToggle
              toggleValue={faqEnabled}
              onToggle={onFaqToggle}
              onClick={() => handleSelectWidget("faq")}
              active={activeWidget === "faq"}
            />
            <SidebarItem
              icon={Link2}
              label="Custom links"
              onClick={() => handleSelectWidget("custom-links")}
              active={activeWidget === "custom-links"}
            />
          </div>
        </div>

        {/* Customize look section */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Customize look
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={Palette}
              label="Theme & colors"
              onClick={() => handleSelectWidget("theme-colors")}
              active={activeWidget === "theme-colors"}
            />
            <SidebarItem
              icon={Type}
              label="Typography"
              onClick={() => handleSelectWidget("typography")}
              active={activeWidget === "typography"}
            />
            <SidebarItem
              icon={Maximize2}
              label="Size & position"
              onClick={() => handleSelectWidget("size-position")}
              active={activeWidget === "size-position"}
            />
            <SidebarItem
              icon={Code}
              label="Injection code"
              onClick={() => handleSelectWidget("injection-code")}
              active={activeWidget === "injection-code"}
            />
          </div>
        </div>

        {/* Boost sales section */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Boost sales
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={LayoutGrid}
              label="Product carousel"
              onClick={() => handleSelectWidget("product-carousel")}
              active={activeWidget === "product-carousel"}
            />
            <SidebarItem
              icon={BarChart3}
              label="Metrics"
              badge="PRO"
              onClick={() => isPro ? handleSelectWidget("metrics") : onUpgrade()}
              active={activeWidget === "metrics"}
            />
          </div>
        </div>

        {/* Build trust section */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Build trust
          </p>
          <div className="space-y-0.5">
            <SidebarItem
              icon={Star}
              label="Google reviews"
              hasToggle={hasGoogleBusiness}
              toggleValue={googleReviewsEnabled}
              onToggle={handleGoogleReviewsToggle}
              onClick={() => handleSelectWidget("google-reviews")}
              active={activeWidget === "google-reviews"}
            />
            <SidebarItem
              icon={Instagram}
              label="Instagram UGC"
              hasToggle
              toggleValue={instagramEnabled}
              onToggle={onInstagramToggle}
              onClick={() => handleSelectWidget("instagram")}
              active={activeWidget === "instagram"}
            />
          </div>
        </div>
      </div>

      {/* Bottom account section */}
      <div className="shrink-0 px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{userEmail || "Account"}</span>
                <span className="text-xs text-muted-foreground">{isPro ? "Pro" : "Free"}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-[calc(288px-24px)] rounded-2xl p-2">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                {userInitial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground">{userInitial}</span>
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
        onUpgrade={onUpgrade}
        showBranding={showBranding}
        onShowBrandingChange={onShowBrandingChange}
      />
    </div>
  );
};

export default BuilderSidebar;
