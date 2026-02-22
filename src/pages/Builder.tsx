import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWidgetConfiguration } from "@/hooks/useWidgetConfiguration";
import { useProductCards } from "@/hooks/useProductCards";
import { useFaqItems } from "@/hooks/useFaqItems";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useCustomLinks } from "@/hooks/useCustomLinks";
import { useSubscription } from "@/hooks/useSubscription";
import { HelpCircle, Loader2, MessageCircle, ChevronsRight, ChevronsLeft } from "lucide-react";
import widjetLogoNavbar from "@/assets/widjet-logo-navbar.png";
import { Button } from "@/components/ui/button";
import BuilderSidebar from "@/components/builder/BuilderSidebar";
import WidgetPreviewPanel from "@/components/builder/WidgetPreviewPanel";
import UpgradeOverlay from "@/components/builder/UpgradeOverlay";
import AddToWebsiteDialog from "@/components/builder/AddToWebsiteDialog";
import OnboardingSurveyDialog from "@/components/builder/OnboardingSurveyDialog";
import OnboardingWebsiteStep from "@/components/builder/OnboardingWebsiteStep";

import { supabase } from "@/integrations/supabase/client";

import { ProductCardData } from "@/types/productCard";
import { LocalLink } from "@/components/builder/CustomLinksPanel";
import { GoogleBusinessData } from "@/components/builder/GoogleReviewsPanel";

const Builder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { config, isLoading, isSaving, saveConfig, updateConfig } = useWidgetConfiguration();

  // Onboarding for first-time users
  const isNewUser = searchParams.get("onboarding") === "true";
  const [showSurvey, setShowSurvey] = useState(false);
  const [showWebsiteStep, setShowWebsiteStep] = useState(false);
  

  // Check if user already completed or skipped the survey
  useEffect(() => {
    if (!isNewUser || !user) return;
    const checkSurvey = async () => {
      const { data } = await (supabase.from("user_activity_logs") as any)
        .select("id")
        .eq("user_id", user.id)
        .in("event_type", ["survey_completed", "survey_skipped"])
        .limit(1);
      if (!data || data.length === 0) {
        setShowWebsiteStep(true);
      }
    };
    checkSurvey();
  }, [isNewUser, user]);
  const { hasUnread } = useUnreadMessages();
  const { plan, subscriptionEnd, startCheckout } = useSubscription();
  const { 
    productCards, 
    isLoading: isLoadingCards, 
    addProductCard, 
    updateProductCard, 
    deleteProductCard 
  } = useProductCards();
  const {
    faqItems,
    isLoading: isLoadingFaq,
    addFaqItem,
    updateFaqItem,
    deleteFaqItem,
    reorderFaqItems,
  } = useFaqItems();
  const {
    instagramPosts,
    isLoading: isLoadingInstagram,
    addInstagramPost,
    updateInstagramPost,
    deleteInstagramPost,
    reorderInstagramPosts,
  } = useInstagramPosts();
  const {
    links: customLinks,
    isLoading: isLoadingCustomLinks,
  } = useCustomLinks();
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [reportBugsEnabled, setReportBugsEnabled] = useState(false);
  const [shareFeedbackEnabled, setShareFeedbackEnabled] = useState(false);
  
  
  // Live preview state for product card edits
  const [previewCardOverride, setPreviewCardOverride] = useState<{
    cardId: string;
    updates: Partial<ProductCardData>;
  } | null>(null);
  
  // Live preview state for local (unsaved) custom links
  const [localPreviewLinks, setLocalPreviewLinks] = useState<LocalLink[]>([]);
  // Initialize googleBusiness from persisted config
  const [googleBusiness, setGoogleBusiness] = useState<GoogleBusinessData | null>(null);
  
  // Load persisted Google business from config
  useEffect(() => {
    if (!isLoading && config.googleReviewsEnabled && config.googleBusinessName) {
      setGoogleBusiness({
        name: config.googleBusinessName,
        rating: config.googleBusinessRating ?? undefined,
        user_ratings_total: config.googleBusinessRatingsTotal ?? undefined,
        url: config.googleBusinessUrl ?? undefined,
        place_id: config.googleBusinessPlaceId ?? undefined,
      });
    }
  }, [isLoading]);
  const [livePreviewCss, setLivePreviewCss] = useState<string | null>(null);
  const [livePreviewJs, setLivePreviewJs] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  
  // Track initial typography values for cancel functionality
  const [initialTypography, setInitialTypography] = useState({
    logo: config.logo,
    language: config.language,
    sayHello: config.sayHello,
  });

  // Update initial values when config is loaded from DB
  useEffect(() => {
    if (!isLoading) {
      setInitialTypography({
        logo: config.logo,
        language: config.language,
        sayHello: config.sayHello,
      });
    }
  }, [isLoading]);

  const handleTypographySave = (typographyConfig: Record<string, unknown>) => {
    saveConfig(typographyConfig);
    // Update initial values after save using the saved values
    setInitialTypography({
      logo: "logo" in typographyConfig ? (typographyConfig.logo as string | null) : config.logo,
      language: "language" in typographyConfig ? (typographyConfig.language as string) : config.language,
      sayHello: "sayHello" in typographyConfig ? (typographyConfig.sayHello as string) : config.sayHello,
    });
  };

  const handleTypographyCancel = () => {
    // Reset to initial values
    updateConfig({
      logo: initialTypography.logo,
      language: initialTypography.language,
      sayHello: initialTypography.sayHello,
    });
  };

  const handleAddProductCard = (card: ProductCardData) => {
    addProductCard(card);
  };

  const handleUpdateProductCard = (cardId: string, updates: Partial<ProductCardData>) => {
    updateProductCard(cardId, updates);
  };

  const handleDeleteProductCard = (cardId: string) => {
    deleteProductCard(cardId);
  };

  const handleProductCardPreviewUpdate = (cardId: string | null, updates: Partial<ProductCardData> | null) => {
    if (cardId && updates) {
      setPreviewCardOverride({ cardId, updates });
    } else {
      setPreviewCardOverride(null);
    }
  };

  // Merge preview override with product cards for live preview
  const previewProductCards = productCards.map(card => {
    if (previewCardOverride && card.id === previewCardOverride.cardId) {
      return { ...card, ...previewCardOverride.updates };
    }
    return card;
  });

  // Handle local links change for live preview
  const handleLocalLinksChange = useCallback((links: LocalLink[]) => {
    setLocalPreviewLinks(links);
  }, []);

  const handleInjectionCodeLivePreview = useCallback((css: string, js: string) => {
    setLivePreviewCss(css);
    setLivePreviewJs(js);
  }, []);

  // Handle website step completion
  const handleWebsiteStepNext = async (websiteUrl: string) => {
    if (user && websiteUrl) {
      // Save website URL to config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("widget_configurations") as any).upsert({
        user_id: user.id,
        website_url: websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
      }, { onConflict: "user_id" });
    }
    setShowWebsiteStep(false);
    setShowSurvey(true);
  };

  const handleWebsiteStepSkip = () => {
    setShowWebsiteStep(false);
    setShowSurvey(true);
  };

  // Handle survey completion
  const handleSurveyComplete = async (answers: { businessType: string; mainGoal: string; monthlyVisitors: string }) => {
    setShowSurvey(false);
    // Remove onboarding param from URL
    searchParams.delete("onboarding");
    setSearchParams(searchParams, { replace: true });
    if (user) {
      const isSkipped = !answers.businessType && !answers.mainGoal && !answers.monthlyVisitors;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("user_activity_logs") as any).insert({
        user_id: user.id,
        event_type: isSkipped ? "survey_skipped" : "survey_completed",
        metadata: answers,
      });
    }
  };


  // Cleanup landing page widget if it leaked into the builder
  useEffect(() => {
    const root = document.getElementById("wj-root");
    if (root) root.remove();
    (window as any).__wj_loaded = false;
  }, []);


  if (isLoading || isLoadingCards || isLoadingFaq || isLoadingInstagram || isLoadingCustomLinks) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar - full height */}
      <div className={`flex shrink-0 flex-col border-r border-border transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'w-0 border-r-0' : isPanelOpen ? 'w-96' : 'w-72'}`}>
        {/* Sidebar header with logo */}
        <div className="group flex h-14 shrink-0 items-center justify-between px-4 bg-gradient-to-br from-[hsl(260,30%,97%)] to-[hsl(270,40%,94%)]">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <img src={widjetLogoNavbar} className="h-8 w-auto -ml-2.5" alt="Widjet logo" />
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:bg-[hsl(0_0%_93%)] hover:scale-[1.02] opacity-0 group-hover:opacity-100"
            title="Chiudi sidebar"
          >
            <ChevronsLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          <BuilderSidebar
            onSelectWidget={setActiveWidget}
            activeWidget={activeWidget}
            selectedAvatar={config.selectedAvatar}
            onSelectAvatar={(avatar) => updateConfig({ selectedAvatar: avatar })}
            faqEnabled={config.faqEnabled}
            onFaqToggle={(enabled) => saveConfig({ faqEnabled: enabled })}
            contactName={config.contactName}
            onContactNameChange={(name) => updateConfig({ contactName: name })}
            offerHelp={config.offerHelp}
            onOfferHelpChange={(help) => updateConfig({ offerHelp: help })}
            widgetTheme={config.widgetTheme}
            onWidgetThemeChange={(theme) => updateConfig({ widgetTheme: theme })}
            widgetColor={config.widgetColor}
            onWidgetColorChange={(color) => updateConfig({ widgetColor: color })}
            buttonLogo={config.buttonLogo}
            onButtonLogoChange={(logo) => updateConfig({ buttonLogo: logo })}
            backgroundType={config.backgroundType}
            onBackgroundTypeChange={(type) => updateConfig({ backgroundType: type })}
            backgroundImage={config.backgroundImage}
            onBackgroundImageChange={(image) => updateConfig({ backgroundImage: image })}
            onSaveConfig={saveConfig}
            productCards={productCards}
            onAddProductCard={handleAddProductCard}
            onUpdateProductCard={handleUpdateProductCard}
            onDeleteProductCard={handleDeleteProductCard}
            onProductCardPreviewUpdate={handleProductCardPreviewUpdate}
            logo={config.logo}
            onLogoChange={(logo) => updateConfig({ logo })}
            language={config.language}
            onLanguageChange={(language) => updateConfig({ language })}
            sayHello={config.sayHello}
            onSayHelloChange={(sayHello) => updateConfig({ sayHello })}
            initialLogo={initialTypography.logo}
            initialLanguage={initialTypography.language}
            initialSayHello={initialTypography.sayHello}
            faqItems={faqItems}
            onAddFaqItem={addFaqItem}
            onUpdateFaqItem={updateFaqItem}
            onDeleteFaqItem={deleteFaqItem}
            onReorderFaqItems={reorderFaqItems}
            instagramEnabled={config.instagramEnabled}
            onInstagramToggle={(enabled) => saveConfig({ instagramEnabled: enabled })}
            instagramPosts={instagramPosts}
            onAddInstagramPost={addInstagramPost}
            onUpdateInstagramPost={updateInstagramPost}
            onDeleteInstagramPost={deleteInstagramPost}
            onReorderInstagramPosts={reorderInstagramPosts}
            whatsappEnabled={config.whatsappEnabled}
            onWhatsappToggle={(enabled) => saveConfig({ whatsappEnabled: enabled })}
            whatsappCountryCode={config.whatsappCountryCode}
            onWhatsappCountryCodeChange={(code) => updateConfig({ whatsappCountryCode: code })}
            whatsappNumber={config.whatsappNumber}
            onWhatsappNumberChange={(number) => updateConfig({ whatsappNumber: number })}
            onLocalLinksChange={handleLocalLinksChange}
            reportBugsEnabled={reportBugsEnabled}
            onReportBugsChange={setReportBugsEnabled}
            shareFeedbackEnabled={shareFeedbackEnabled}
            onShareFeedbackChange={setShareFeedbackEnabled}
            forwardEmail={config.forwardEmail}
            onForwardEmailChange={(email: string) => updateConfig({ forwardEmail: email })}
            isPro={plan === "pro"}
            subscriptionEnd={subscriptionEnd}
            onUpgrade={() => setShowUpgradeOverlay(true)}
            onGoogleBusinessSelect={setGoogleBusiness}
            customCss={config.customCss}
            customJs={config.customJs}
            onInjectionCodeLivePreview={handleInjectionCodeLivePreview}
            userEmail={user?.email || ""}
            onSignOut={signOut}
            onPanelOpenChange={setIsPanelOpen}
            onCollapseSidebar={() => setIsSidebarCollapsed(true)}
            showBranding={config.showBranding}
            onShowBrandingChange={(show) => updateConfig({ showBranding: show })}
            chatbotEnabled={config.chatbotEnabled}
            onChatbotToggle={(enabled) => saveConfig({ chatbotEnabled: enabled })}
            chatbotInstructions={config.chatbotInstructions}
            aiProvider={config.aiProvider}
            aiApiKey={config.aiApiKey}
            onSaveChatbotConfig={saveConfig}
            widgetPosition={config.widgetPosition}
            onWidgetPositionChange={(pos) => saveConfig({ widgetPosition: pos })}
            widgetType={config.widgetType}
            onWidgetTypeChange={(type) => saveConfig({ widgetType: type })}
            initialGoogleReviewsEnabled={config.googleReviewsEnabled}
            initialHasGoogleBusiness={!!config.googleBusinessName}
          />
        </div>
      </div>
      {/* Reopen sidebar button */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="absolute left-2 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border shadow-sm transition-colors hover:bg-muted"
          title="Apri sidebar"
        >
          <ChevronsRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* Right panel - full height */}
      <div className="flex flex-1 flex-col">
        {/* Right header with actions */}
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4">
          {isSaving && (
            <div className="flex items-center gap-2 text-muted-foreground mr-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/chats")}
          >
            <MessageCircle className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
            <span className="hidden sm:inline">Chat</span>
          </Button>
          <AddToWebsiteDialog widgetId={config.id || undefined} />
        </div>
        <div className="flex-1 overflow-hidden">
          <WidgetPreviewPanel 
            activeWidget={activeWidget}
            selectedAvatar={config.selectedAvatar} 
            faqEnabled={config.faqEnabled}
            contactName={config.contactName}
            offerHelp={config.offerHelp}
            widgetTheme={config.widgetTheme}
            widgetColor={config.widgetColor}
            buttonLogo={config.buttonLogo}
            backgroundType={config.backgroundType}
            backgroundImage={config.backgroundImage}
            logo={config.logo}
            productCards={previewProductCards}
            sayHello={config.sayHello}
            language={config.language}
            faqItems={faqItems}
            instagramEnabled={config.instagramEnabled}
            instagramPosts={instagramPosts}
            websiteUrl={config.websiteUrl}
            whatsappEnabled={config.whatsappEnabled}
            whatsappCountryCode={config.whatsappCountryCode}
            whatsappNumber={config.whatsappNumber}
            customLinks={customLinks}
            localPreviewLinks={localPreviewLinks}
            reportBugsEnabled={reportBugsEnabled}
            shareFeedbackEnabled={shareFeedbackEnabled}
            widgetId={config.id || undefined}
            googleBusiness={googleBusiness}
            customCss={livePreviewCss ?? config.customCss}
            customJs={livePreviewJs ?? config.customJs}
            showBranding={config.showBranding}
            widgetPosition={config.widgetPosition}
            widgetType={config.widgetType}
          />
        </div>
      </div>

      {/* Upgrade overlay */}
      {showUpgradeOverlay && (
        <UpgradeOverlay
          onBack={() => setShowUpgradeOverlay(false)}
          onUpgrade={startCheckout}
        />
      )}

      {/* Onboarding: website step (full-page) */}
      {showWebsiteStep && (
        <OnboardingWebsiteStep
          onNext={handleWebsiteStepNext}
          onSkip={handleWebsiteStepSkip}
        />
      )}

      {/* Onboarding survey for first-time users */}
      <OnboardingSurveyDialog
        open={showSurvey && !showWebsiteStep}
        onComplete={handleSurveyComplete}
      />
    </div>
  );
};

export default Builder;
