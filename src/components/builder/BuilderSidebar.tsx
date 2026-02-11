import { useState } from "react";
import {
  MessageSquare,
  Phone,
  MessageCircle,
  HelpCircle,
  Link2,
  LayoutGrid,
  Gift,
  
  Star,
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Instagram,
  BarChart3,
} from "lucide-react";
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
}: BuilderSidebarProps) => {
  
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
  const [googleReviewsEnabled, setGoogleReviewsEnabled] = useState(false);
  const [hasGoogleBusiness, setHasGoogleBusiness] = useState(false);

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
    }
    onSelectWidget(widgetType);
  };

  const handleBackFromContactCard = () => {
    setShowContactCardPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromThemeColors = () => {
    setShowThemeColorsPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromProductCarousel = () => {
    setShowProductCarouselPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromTypography = () => {
    setShowTypographyPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromFaq = () => {
    setShowFaqPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromInstagram = () => {
    setShowInstagramPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromWhatsApp = () => {
    setShowWhatsAppPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromCustomLinks = () => {
    setShowCustomLinksPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromMetrics = () => {
    setShowMetricsPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromGoogleReviews = () => {
    setShowGoogleReviewsPanel(false);
    onSelectWidget(null as unknown as string);
  };

  const handleBackFromSizePosition = () => {
    setShowSizePositionPanel(false);
    onSelectWidget(null as unknown as string);
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

  // Show Google Reviews panel
  if (showGoogleReviewsPanel) {
    return (
      <GoogleReviewsPanel onBack={handleBackFromGoogleReviews} onBusinessSelect={handleGoogleBusinessSelect} />
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Widget content</h1>

      {/* Provide help section */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Provide help
        </p>
        <div className="space-y-2">
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

      {/* Boost sales section */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Boost sales
        </p>
        <div className="space-y-2">
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
            onClick={() => handleSelectWidget("metrics")}
            active={activeWidget === "metrics"}
          />
        </div>
      </div>

      {/* Build trust section */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Build trust
        </p>
        <div className="space-y-2">
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

      {/* Customize look section */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Customize look
        </p>
        <div className="space-y-2">
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
            icon={Sparkles}
            label="Animations"
            onClick={() => handleSelectWidget("animations")}
            active={activeWidget === "animations"}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderSidebar;
