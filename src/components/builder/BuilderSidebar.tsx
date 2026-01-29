import { useState } from "react";
import {
  MessageSquare,
  Phone,
  MessageCircle,
  HelpCircle,
  Link2,
  LayoutGrid,
  Gift,
  Users,
  Star,
  Palette,
  Type,
  Maximize2,
  Sparkles,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import ContactCardPanel from "./ContactCardPanel";
import ThemeColorsPanel from "./ThemeColorsPanel";
import ProductCarouselPanel from "./ProductCarouselPanel";
import TypographyPanel from "./TypographyPanel";
import { ProductCardData } from "@/types/productCard";

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
  initialSayHello
}: BuilderSidebarProps) => {
  const [visitorCounterEnabled, setVisitorCounterEnabled] = useState(false);
  const [showContactCardPanel, setShowContactCardPanel] = useState(false);
  const [showThemeColorsPanel, setShowThemeColorsPanel] = useState(false);
  const [showProductCarouselPanel, setShowProductCarouselPanel] = useState(false);
  const [showTypographyPanel, setShowTypographyPanel] = useState(false);

  const handleSelectWidget = (widgetType: string) => {
    if (widgetType === "contact-card") {
      setShowContactCardPanel(true);
    } else if (widgetType === "theme-colors") {
      setShowThemeColorsPanel(true);
    } else if (widgetType === "product-carousel") {
      setShowProductCarouselPanel(true);
    } else if (widgetType === "typography") {
      setShowTypographyPanel(true);
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
      />
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
            onClick={() => handleSelectWidget("whatsapp")}
            active={activeWidget === "whatsapp"}
          />
          <SidebarItem
            icon={MessageCircle}
            label="Messenger"
            onClick={() => handleSelectWidget("messenger")}
            active={activeWidget === "messenger"}
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
            icon={Gift}
            label="Product recommendations"
            onClick={() => handleSelectWidget("product-recommendations")}
            active={activeWidget === "product-recommendations"}
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
            icon={Users}
            label="Visitor counter"
            hasToggle
            toggleValue={visitorCounterEnabled}
            onToggle={setVisitorCounterEnabled}
            onClick={() => handleSelectWidget("visitor-counter")}
            active={activeWidget === "visitor-counter"}
          />
          <SidebarItem
            icon={Star}
            label="Google reviews"
            onClick={() => handleSelectWidget("google-reviews")}
            active={activeWidget === "google-reviews"}
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
