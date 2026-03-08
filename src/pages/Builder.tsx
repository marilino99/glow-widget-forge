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
import { HelpCircle, Loader2, MessageCircle, ChevronsRight, ChevronsLeft, Plus, Check, PanelLeft, Bell, BookOpen, Sparkles, LayoutGrid, Settings, LifeBuoy, ChevronRight, ChevronLeft, LogOut, ArrowRight, ExternalLink, Gift, Home, Palette, Puzzle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import widjetLogoNavbar from "@/assets/widjet-logo-navbar.png";
import widjetIcon from "@/assets/widjet-icon.png";
import changelogFeatured from "@/assets/changelog-featured.png";
import { Button } from "@/components/ui/button";
import BuilderSidebar from "@/components/builder/BuilderSidebar";
import BuilderHome from "@/components/builder/BuilderHome";
import ConversationsPanel from "@/components/builder/ConversationsPanel";
import ContactsPanel from "@/components/builder/ContactsPanel";
import AppearancePanel from "@/components/builder/AppearancePanel";
import ChatbotPanel from "@/components/builder/ChatbotPanel";
import DataSourcesPanel from "@/components/builder/DataSourcesPanel";
import WidgetPreviewPanel from "@/components/builder/WidgetPreviewPanel";
import UpgradeOverlay from "@/components/builder/UpgradeOverlay";
import AddToWebsiteDialog from "@/components/builder/AddToWebsiteDialog";
import OnboardingWebsiteStep from "@/components/builder/OnboardingWebsiteStep";
import OnboardingTrainStep from "@/components/builder/OnboardingTrainStep";
import OnboardingBrandStep from "@/components/builder/OnboardingBrandStep";
import OnboardingTestStep from "@/components/builder/OnboardingTestStep";
import OnboardingSurveyDialog, { type SurveyAnswers } from "@/components/builder/OnboardingSurveyDialog";
import AllChannelsOverlay from "@/components/builder/AllChannelsOverlay";
import IntegrationsPanel from "@/components/builder/IntegrationsPanel";
import SettingsDialog from "@/components/builder/SettingsDialog";
import FeedbackPopover from "@/components/builder/FeedbackPopover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
  const [showTrainStep, setShowTrainStep] = useState(false);
  const [showBrandStep, setShowBrandStep] = useState(false);
  const [showTestStep, setShowTestStep] = useState(false);
  const [showWebsiteStep, setShowWebsiteStep] = useState(false);
  const [showSurveyDialog, setShowSurveyDialog] = useState(false);
  const [onboardingWebsiteUrl, setOnboardingWebsiteUrl] = useState("");
  const [extractedBranding, setExtractedBranding] = useState<{ logo: string | null; color: string | null }>({ logo: null, color: null });
  

  // Auto-detect users who never completed onboarding (no widget config)
  // Also check activity logs to avoid re-showing after completion
  useEffect(() => {
    if (isLoading || !user) return;
    if (config?.id) return; // Config exists → onboarding already done
    if (showWebsiteStep || showTrainStep || showBrandStep || showTestStep || showSurveyDialog) return;

    const checkIfAlreadyCompleted = async () => {
      const { data } = await (supabase.from("user_activity_logs") as any)
        .select("id")
        .eq("user_id", user.id)
        .in("event_type", ["survey_completed", "survey_skipped", "onboarding_completed"])
        .limit(1);
      if (!data || data.length === 0) {
        setShowWebsiteStep(true);
      }
    };
    checkIfAlreadyCompleted();
  }, [isLoading, user, config?.id]);
  const { hasUnread } = useUnreadMessages();
  const { plan, subscriptionEnd, startCheckout, aiResponsesThisMonth, aiResponseLimit, isApproachingLimit, isAtLimit } = useSubscription();
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
    addLink: addCustomLink,
    updateLink: updateCustomLink,
    deleteLink: deleteCustomLink,
    reorderLinks: reorderCustomLinks,
  } = useCustomLinks();
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [builderView, setBuilderViewRaw] = useState<"home" | "editor" | "conversations" | "contacts" | "appearance" | "data-sources" | "ai" | null>(() => {
    const saved = sessionStorage.getItem("widjet_builder_view");
    return saved ? (saved as "home" | "editor" | "conversations" | "contacts" | "appearance" | "data-sources" | "ai") : null;
  });
  const setBuilderView = (view: "home" | "editor" | "conversations" | "contacts" | "appearance" | "data-sources" | "ai" | null) => {
    setBuilderViewRaw(view);
    if (view) {
      sessionStorage.setItem("widjet_builder_view", view);
    } else {
      sessionStorage.removeItem("widjet_builder_view");
    }
  };
  const [reportBugsEnabled, setReportBugsEnabled] = useState(false);
  const [appearanceTab, setAppearanceTab] = useState("general");
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
  const [isMiniSidebar, setIsMiniSidebar] = useState(false);
  const [autoMini, setAutoMini] = useState(false);

  // Auto-collapse sidebar when window is narrow (e.g. 50% split screen)
  useEffect(() => {
    const THRESHOLD = 1100;
    const handleResize = () => {
      if (window.innerWidth < THRESHOLD) {
        setAutoMini(true);
        setIsMiniSidebar(true);
      } else if (autoMini) {
        setAutoMini(false);
        setIsMiniSidebar(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autoMini]);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
   const [showAllChannels, setShowAllChannels] = useState(false);
    const [widgetPopoverOpen, setWidgetPopoverOpen] = useState(false);
   const [changelogDetailOpen, setChangelogDetailOpen] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [promoClaimed, setPromoClaimed] = useState(false);
  const [promoClaimLoading, setPromoClaimLoading] = useState(false);
  const [widgetIsLive, setWidgetIsLive] = useState(false);
  const [phReviewUrl, setPhReviewUrl] = useState("");
  const [phReviewSaved, setPhReviewSaved] = useState(false);
  const [g2ReviewApproved, setG2ReviewApproved] = useState(false);

  // Load user profile for top bar
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("avatar_url, first_name, lovable_promo_claimed, g2_review_approved").eq("user_id", user.id).single();
      if (data?.avatar_url) setUserAvatarUrl(data.avatar_url);
      if (data?.first_name) setUserDisplayName(data.first_name);
      if ((data as any)?.lovable_promo_claimed) setPromoClaimed(true);
      if ((data as any)?.g2_review_approved) {
        setG2ReviewApproved(true);
        setPhReviewSaved(true);
      }
    };
    loadProfile();
  }, [user]);

  // Check if widget is live (has impressions)
  useEffect(() => {
    const checkWidgetLive = async () => {
      if (!config.id) return;
      const { data } = await supabase
        .from("widget_events")
        .select("id")
        .eq("widget_id", config.id)
        .eq("event_type", "impression")
        .limit(1);
      if (data && data.length > 0) setWidgetIsLive(true);
    };
    checkWidgetLive();
  }, [config.id]);
  
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
    const formattedUrl = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    if (user && websiteUrl) {
      // Save website URL to config
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("widget_configurations") as any).upsert({
        user_id: user.id,
        website_url: formattedUrl,
      }, { onConflict: "user_id" });

      // Extract branding (logo, color) in background
      supabase.functions.invoke('extract-branding', {
        body: { url: formattedUrl }
      }).then(({ data, error }) => {
        if (!error && data?.success) {
          setExtractedBranding({
            logo: data.logo || null,
            color: data.primaryColor || data.widgetColor || null,
          });
        }
      });
    }
    setOnboardingWebsiteUrl(websiteUrl);
    setShowWebsiteStep(false);
    setShowTrainStep(true);
  };

  const handleWebsiteStepSkip = () => {
    setShowWebsiteStep(false);
    setShowTrainStep(true);
  };

  // Handle train step completion
  const handleTrainStepNext = () => {
    setShowTrainStep(false);
    setShowBrandStep(true);
  };

  const handleTrainStepBack = () => {
    setShowTrainStep(false);
    setShowWebsiteStep(true);
  };

  // Handle brand step completion
  const handleBrandStepNext = () => {
    setShowBrandStep(false);
    setShowTestStep(true);
  };

  const handleBrandStepBack = () => {
    setShowBrandStep(false);
    setShowTrainStep(true);
  };

  // Handle test step completion
  const handleTestStepNext = () => {
    setShowTestStep(false);
    searchParams.delete("onboarding");
    setSearchParams(searchParams, { replace: true });
    setShowSurveyDialog(true);
  };

  const handleTestStepBack = () => {
    setShowTestStep(false);
    setShowBrandStep(true);
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

  const userInitial = (userDisplayName || user?.email || "U").charAt(0).toUpperCase();
  const viewLabels: Record<string, string> = { home: "Home", editor: "Editor", conversations: "Conversations", contacts: "Contacts", appearance: "Appearance", "data-sources": "Data Sources", ai: "AI & Automation" };

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar - full height, hidden on mobile */}
      <div className={`hidden md:flex shrink-0 flex-col border-r border-border transition-all duration-300 overflow-hidden bg-[#fafafa] ${isSidebarCollapsed ? 'w-0 border-r-0' : isMiniSidebar ? 'w-[60px]' : isPanelOpen ? 'w-96' : 'w-64'}`}>
        {/* Sidebar logo row - same height as content header */}
        <div className={`shrink-0 flex items-center h-12 ${isMiniSidebar ? 'justify-center px-2' : 'px-4'}`}>
          {isMiniSidebar ? (
            <button onClick={() => window.location.reload()} className="flex items-center justify-center">
              <img src={widjetIcon} className="h-7 w-7 object-contain" alt="Widjet" />
            </button>
          ) : (
            <button onClick={() => window.location.reload()} className="flex items-center">
              <img src={widjetLogoNavbar} className="h-7 w-auto" alt="Widjet logo" />
            </button>
          )}
        </div>
        {/* Sidebar header - workspace selector */}
        <div className={`shrink-0 pt-1 pb-2 ${isMiniSidebar ? 'px-2' : 'px-4'}`}>
          {/* Workspace selector / mini icon */}
          {isMiniSidebar ? (
            <div className="mt-3 flex justify-center">
              <Popover open={widgetPopoverOpen} onOpenChange={setWidgetPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background transition-all duration-200 hover:bg-[#f0f0f0] hover:scale-[1.02]"
                  >
                    {config?.logo ? (
                      <img src={config.logo} alt="" className="h-5 w-5 rounded-full object-cover" />
                    ) : config?.websiteUrl ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(config.websiteUrl).hostname}&sz=64`}
                        alt=""
                        className="h-5 w-5 rounded-full object-cover bg-muted"
                      />
                    ) : (
                      <div className="h-4 w-4 rounded-full" style={{ background: 'radial-gradient(circle at 40% 40%, #f9a825, #ef6c00, #d84315, #bf360c)' }} />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" side="right" sideOffset={12} className="w-64 rounded-2xl p-3 bg-background border border-border shadow-lg z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">My Widgets</h3>
                    <button onClick={() => { setWidgetPopoverOpen(false); setShowAllChannels(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-2.5 border border-primary/10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                        {config?.logo ? (
                          <img src={config.logo} alt="" className="h-7 w-7 rounded-full object-cover" />
                        ) : config?.websiteUrl ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(config.websiteUrl).hostname}&sz=64`}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover bg-muted"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full" style={{ background: 'radial-gradient(circle at 40% 40%, #f9a825, #ef6c00, #d84315, #bf360c)' }} />
                        )}
                      </div>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {config?.websiteUrl ? new URL(config.websiteUrl).hostname.replace('www.', '').split('.')[0] + ' widget' : config?.contactName ? config.contactName + ' widget' : 'My Widget'}
                      </span>
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="mt-3">
              <Popover open={widgetPopoverOpen} onOpenChange={setWidgetPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-background -ml-2 pl-2 pr-3 py-1.5 text-left transition-colors hover:bg-[#f0f0f0]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                      {config?.logo ? (
                        <img src={config.logo} alt="" className="h-4.5 w-4.5 rounded-full object-cover" />
                      ) : config?.websiteUrl ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(config.websiteUrl).hostname}&sz=64`}
                          alt=""
                          className="h-4.5 w-4.5 rounded-full object-cover bg-muted"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full" style={{ background: 'radial-gradient(circle at 40% 40%, #f9a825, #ef6c00, #d84315, #bf360c)' }} />
                      )}
                    </div>
                    <span className="flex-1 truncate text-sm font-medium text-foreground">
                      {config?.websiteUrl ? new URL(config.websiteUrl).hostname.replace('www.', '').split('.')[0] + ' widget' : config?.contactName ? config.contactName + ' widget' : 'My Widget'}
                    </span>
                    <ChevronsRight className="h-4 w-4 shrink-0 text-muted-foreground rotate-90" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" side="bottom" className="w-[calc(288px-32px)] rounded-2xl p-3 bg-background border border-border shadow-lg z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">My Widgets</h3>
                    <button onClick={() => { setWidgetPopoverOpen(false); setShowAllChannels(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-2.5 border border-primary/10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                        {config?.logo ? (
                          <img src={config.logo} alt="" className="h-7 w-7 rounded-full object-cover" />
                        ) : config?.websiteUrl ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${new URL(config.websiteUrl).hostname}&sz=64`}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover bg-muted"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full" style={{ background: 'radial-gradient(circle at 40% 40%, #f9a825, #ef6c00, #d84315, #bf360c)' }} />
                        )}
                      </div>
                      <span className="flex-1 truncate text-sm font-medium text-foreground">
                        {config?.websiteUrl ? new URL(config.websiteUrl).hostname.replace('www.', '').split('.')[0] + ' widget' : config?.contactName ? config.contactName + ' widget' : 'My Widget'}
                      </span>
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
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
            aiTemperature={config.aiTemperature}
            aiTone={config.aiTone}
            onSaveChatbotConfig={saveConfig}
            widgetPosition={config.widgetPosition}
            onWidgetPositionChange={(pos) => saveConfig({ widgetPosition: pos })}
            widgetType={config.widgetType}
            onWidgetTypeChange={(type) => saveConfig({ widgetType: type })}
            initialGoogleReviewsEnabled={config.googleReviewsEnabled}
            initialHasGoogleBusiness={!!config.googleBusinessName}
            builderView={builderView}
            onBuilderViewChange={(view) => {
              const wasConversations = builderView === "conversations";
              setBuilderView(view);
              if (view === "conversations") setIsMiniSidebar(true);
              if (wasConversations && view === "contacts" && !autoMini) setIsMiniSidebar(false);
            }}
            isMiniSidebar={isMiniSidebar}
            widgetId={config.id || undefined}
            aiResponsesThisMonth={aiResponsesThisMonth}
            aiResponseLimit={aiResponseLimit}
            isApproachingLimit={isApproachingLimit}
            isAtLimit={isAtLimit}
          />
        </div>
      </div>
      {/* Reopen sidebar button - desktop only */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden md:flex absolute left-2 top-4 z-10 h-8 w-8 items-center justify-center rounded-lg bg-background border border-border shadow-sm transition-colors hover:bg-muted"
          title="Apri sidebar"
        >
          <ChevronsRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {/* Right panel - full height */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#ffffff] pb-16 lg:pb-0">
        {/* Content header - same height as sidebar logo row */}
        <div className="shrink-0 flex items-center justify-between h-12 border-b border-border px-4">
          <div className="flex items-center gap-2">
            {/* Mobile: show logo */}
            <button onClick={() => window.location.reload()} className="flex items-center md:hidden">
              <img src={widjetLogoNavbar} className="h-6 w-auto" alt="Widjet logo" />
            </button>
            {/* Desktop: sidebar toggle + view label */}
            {builderView !== "conversations" && (
              <button
                onClick={() => setIsMiniSidebar(!isMiniSidebar)}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 hover:bg-muted"
                title={isMiniSidebar ? "Espandi sidebar" : "Riduci sidebar"}
              >
                <PanelLeft className="h-[18px] w-[18px] text-muted-foreground" />
              </button>
            )}
            <span className="hidden md:inline text-sm font-medium text-foreground">{viewLabels[builderView] || "Home"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FeedbackPopover userEmail={user?.email} />
            <Popover onOpenChange={(open) => { if (!open) setChangelogDetailOpen(false); }}>
              <PopoverTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                  <Bell className="h-4 w-4 text-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={12} className="w-[380px] p-0 rounded-2xl shadow-xl border border-border overflow-hidden">
                <div className="max-h-[480px] overflow-y-auto">
                  {!changelogDetailOpen ? (
                    <>
                      {/* Featured update */}
                      <div className="p-5 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => setChangelogDetailOpen(true)}>
                        <h3 className="text-base font-bold text-foreground mb-1.5 flex items-center gap-1.5">Get 3 months of Lovable Pro for free <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          Get 100 monthly credits for 3 months completely free. Start building faster today.
                        </p>
                        <img src={changelogFeatured} alt="Lovable x WidJet partnership" className="rounded-xl w-full object-cover" />
                        <p className="text-xs text-muted-foreground mt-2">Just now</p>
                      </div>
                    </>
                  ) : (
                    <div className="p-5">
                      <button onClick={() => setChangelogDetailOpen(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                      <img src={changelogFeatured} alt="Lovable x WidJet partnership" className="rounded-xl w-full object-cover mb-4" />
                      <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Get 3 months of Lovable Pro for free
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Complete these 3 steps to unlock your exclusive <span className="font-semibold text-foreground">100 credits/month for 3 months</span>.
                      </p>

                      {/* Step 1: Widget Live */}
                      <div className="space-y-3 mb-5">
                        <div className="flex items-start gap-3">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${widgetIsLive ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                            {widgetIsLive ? <Check className="h-3.5 w-3.5" /> : '1'}
                          </span>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${widgetIsLive ? 'text-green-600 line-through' : 'text-foreground'}`}>Install the widget on your website</p>
                            <p className="text-xs text-muted-foreground">We'll detect it automatically once it receives its first visit.</p>
                          </div>
                        </div>

                        {/* Step 2: G2 Review */}
                        <div className="flex items-start gap-3">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${phReviewSaved ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                            {phReviewSaved ? <Check className="h-3.5 w-3.5" /> : '2'}
                          </span>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${phReviewSaved ? 'text-green-600 line-through' : 'text-foreground'}`}>Leave a review on G2</p>
                            {!phReviewSaved ? (
                              <div className="mt-1.5 flex flex-col gap-1.5">
                                <a
                                  href="https://www.g2.com/products/widjet/take_survey"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Write your review on G2
                                </a>
                                <div className="flex gap-1.5">
                                  <input
                                    type="url"
                                    value={phReviewUrl}
                                    onChange={(e) => setPhReviewUrl(e.target.value)}
                                    placeholder="Paste your G2 review link"
                                    className="flex-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                  <button
                                    disabled={!phReviewUrl.includes("g2.com")}
                                    onClick={() => {
                                      setPhReviewSaved(true);
                                      if (user) {
                                        supabase.from("user_activity_logs").insert({
                                          user_id: user.id,
                                          event_type: "g2_review_submitted",
                                          metadata: { url: phReviewUrl },
                                        });
                                        supabase.functions.invoke("notify-review", {
                                          body: { reviewUrl: phReviewUrl, userEmail: user.email },
                                        });
                                      }
                                    }}
                                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                </div>
                            ) : g2ReviewApproved ? (
                              <p className="text-xs text-green-500 mt-0.5">Review approved ✓</p>
                            ) : (
                              <p className="text-xs text-amber-500 mt-0.5">Under review — we'll approve it shortly ⏳</p>
                            )}
                          </div>
                        </div>

                        {/* Step 3: Claim */}
                        <div className="flex items-start gap-3">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${promoClaimed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                            {promoClaimed ? <Check className="h-3.5 w-3.5" /> : '3'}
                          </span>
                          <p className={`text-sm font-medium ${promoClaimed ? 'text-green-600 line-through' : 'text-foreground'}`}>Claim your free credits</p>
                        </div>
                      </div>

                      {promoClaimed ? (
                        <div className="flex items-center justify-center gap-2 w-full rounded-xl bg-muted text-muted-foreground font-medium py-2.5 text-sm cursor-default">
                          <Check className="h-4 w-4" />
                          Already claimed
                        </div>
                      ) : (
                        <button
                          disabled={promoClaimLoading || !widgetIsLive || !g2ReviewApproved}
                          onClick={async () => {
                            if (!user) return;
                            setPromoClaimLoading(true);
                            await (supabase.from("profiles") as any).update({ lovable_promo_claimed: true }).eq("user_id", user.id);
                            setPromoClaimed(true);
                            setPromoClaimLoading(false);
                            window.open("https://lovable.dev/lp/learnn-2512?reward_code=03aa3b40-4c2b-4f78-8cc5-7d7cb0588f97", "_blank", "noopener,noreferrer");
                          }}
                          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground font-medium py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {promoClaimLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                          {!widgetIsLive ? 'Install widget first' : !g2ReviewApproved ? (phReviewSaved ? 'Waiting for approval' : 'Submit review first') : 'Claim your free credits'}
                        </button>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-3 leading-tight">*Valid only for new Lovable accounts.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden hover:ring-2 hover:ring-border transition-all">
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                      {userInitial}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={12} className="w-52 rounded-xl p-1.5">
                {/* Balance / Responses section */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Responses</span>
                    {plan !== "pro" && (
                      <button
                        onClick={() => setShowUpgradeOverlay(true)}
                        className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background hover:bg-foreground/90 transition-colors"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Remaining</span>
                    <span className="font-medium text-foreground">{(aiResponseLimit - aiResponsesThisMonth).toLocaleString()}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* Current workspace */}
                <div className="px-3 py-2.5">
                  <span className="text-[11px] text-muted-foreground">Current workspace</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{userDisplayName || userInitial}</p>
                      <p className="text-xs text-muted-foreground">{plan === "pro" ? "Pro plan" : "Free plan"}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* Menu items */}
                <DropdownMenuItem onClick={() => setShowSettingsDialog(true)} className="py-2 rounded-lg text-sm">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setShowSettingsDialog(true); }} className="py-2 rounded-lg text-sm">
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 rounded-lg text-sm" disabled>
                  Integrations
                  <span className="ml-auto text-[10px] text-muted-foreground">soon</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2 rounded-lg text-sm">
                  Help
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="py-2 rounded-lg text-sm">
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {builderView === "home" || builderView === null ? (
          <BuilderHome isPro={plan === "pro"} userName={config.contactName !== "Support" ? config.contactName : null} />
        ) : builderView === "conversations" ? (
          <ConversationsPanel isAtLimit={isAtLimit} isPro={plan === "pro"} onUpgrade={() => setShowUpgradeOverlay(true)} />
        ) : builderView === "contacts" ? (
          <ContactsPanel />
        ) : builderView === "appearance" ? (
          <div className="flex flex-1 min-h-0">
            {/* Left column: header + panel */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Full-width header */}
              <div className="shrink-0 px-8 pt-5 pb-0">
                <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust the appearance of your chat widget to match your website's style.
                </p>
                <div className="mt-6 flex gap-0">
                  {["General", "Style", "Home Screen", "Widget button"].map((tab) => {
                    const tabValue = tab.toLowerCase().replace(/ /g, "-");
                    return (
                      <button
                        key={tabValue}
                        onClick={() => setAppearanceTab(tabValue)}
                        className={`relative px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
                          appearanceTab === tabValue
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground border-b-2 border-transparent hover:text-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <AppearancePanel
                  contactName={config.contactName}
                  onContactNameChange={(name) => updateConfig({ contactName: name })}
                  logo={config.logo}
                  onLogoChange={(logo) => updateConfig({ logo })}
                  widgetColor={config.widgetColor}
                  onWidgetColorChange={(color) => updateConfig({ widgetColor: color })}
                  widgetTheme={config.widgetTheme}
                  onWidgetThemeChange={(theme) => updateConfig({ widgetTheme: theme })}
                  backgroundType={config.backgroundType as "solid" | "gradient" | "image"}
                  onBackgroundTypeChange={(type) => updateConfig({ backgroundType: type })}
                  backgroundImage={config.backgroundImage}
                  onBackgroundImageChange={(image) => updateConfig({ backgroundImage: image })}
                  sayHello={config.sayHello}
                  onSayHelloChange={(sayHello) => updateConfig({ sayHello })}
                  selectedAvatar={config.selectedAvatar}
                  onSelectAvatar={(avatar) => updateConfig({ selectedAvatar: avatar })}
                  offerHelp={config.offerHelp}
                  onOfferHelpChange={(help) => updateConfig({ offerHelp: help })}
                  ctaText={config.ctaText}
                  onCtaTextChange={(text) => updateConfig({ ctaText: text })}
                  onSave={() => saveConfig({})}
                  activeTab={appearanceTab}
                  whatsappEnabled={config.whatsappEnabled ?? false}
                  onWhatsappToggle={(enabled) => saveConfig({ whatsappEnabled: enabled })}
                  whatsappCountryCode={config.whatsappCountryCode ?? "+39"}
                  onWhatsappCountryCodeChange={(code) => updateConfig({ whatsappCountryCode: code })}
                  whatsappNumber={config.whatsappNumber ?? ""}
                  onWhatsappNumberChange={(number) => updateConfig({ whatsappNumber: number })}
                  faqEnabled={config.faqEnabled}
                  onFaqToggle={(enabled) => saveConfig({ faqEnabled: enabled })}
                  faqItems={faqItems}
                  onAddFaqItem={addFaqItem}
                  onUpdateFaqItem={updateFaqItem}
                  onDeleteFaqItem={deleteFaqItem}
                  onReorderFaqItems={reorderFaqItems}
                  reportBugsEnabled={reportBugsEnabled}
                  onReportBugsChange={setReportBugsEnabled}
                  shareFeedbackEnabled={shareFeedbackEnabled}
                  onShareFeedbackChange={setShareFeedbackEnabled}
                  forwardEmail={config.forwardEmail}
                  onForwardEmailChange={(email: string) => updateConfig({ forwardEmail: email })}
                  customLinks={customLinks}
                  onAddCustomLink={addCustomLink}
                  onUpdateCustomLink={updateCustomLink}
                  onDeleteCustomLink={deleteCustomLink}
                  onReorderCustomLinks={reorderCustomLinks}
                  productCards={productCards}
                  onAddProductCard={handleAddProductCard}
                  onUpdateProductCard={handleUpdateProductCard}
                  onDeleteProductCard={handleDeleteProductCard}
                  instagramEnabled={config.instagramEnabled}
                  onInstagramToggle={(enabled) => saveConfig({ instagramEnabled: enabled })}
                  instagramPosts={instagramPosts}
                  onAddInstagramPost={addInstagramPost}
                  onUpdateInstagramPost={updateInstagramPost}
                  onDeleteInstagramPost={deleteInstagramPost}
                  onReorderInstagramPosts={reorderInstagramPosts}
                  widgetPosition={config.widgetPosition}
                  onWidgetPositionChange={(position) => saveConfig({ widgetPosition: position })}
                  buttonLogo={config.buttonLogo}
                  onButtonLogoChange={(logo) => saveConfig({ buttonLogo: logo })}
                  widgetType={config.widgetType}
                  onWidgetTypeChange={(type) => saveConfig({ widgetType: type })}
                  hasGoogleBusiness={!!config.googleBusinessName}
                  googleReviewsEnabled={config.googleReviewsEnabled}
                  onGoogleReviewsToggle={(enabled) => saveConfig({ googleReviewsEnabled: enabled })}
                  onOpenGoogleReviews={() => {}}
                  savedGoogleBusiness={config.googleBusinessName ? {
                    name: config.googleBusinessName,
                    rating: config.googleBusinessRating ?? undefined,
                    user_ratings_total: config.googleBusinessRatingsTotal ?? undefined,
                    url: config.googleBusinessUrl ?? undefined,
                  } : null}
                  onBusinessSelect={(business) => {
                    if (business) {
                      saveConfig({
                        googleBusinessName: business.name,
                        googleBusinessRating: business.rating ?? null,
                        googleBusinessRatingsTotal: business.user_ratings_total ?? null,
                        googleBusinessUrl: business.url ?? null,
                        googleReviewsEnabled: true,
                      });
                    } else {
                      saveConfig({
                        googleBusinessName: null,
                        googleBusinessRating: null,
                        googleBusinessRatingsTotal: null,
                        googleBusinessUrl: null,
                        googleReviewsEnabled: false,
                      });
                    }
                  }}
                />
              </div>
            </div>
            {/* Right column: preview - hidden on mobile */}
            <div className="hidden md:flex flex-col flex-1 overflow-clip border-l border-border bg-[#f8f8f8]">
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
                  ctaText={config.ctaText}
                  minimal
                />
              </div>
          </div>
        ) : builderView === "data-sources" ? (
          <DataSourcesPanel onNavigateToFaq={() => {
            setBuilderView("editor");
            setActiveWidget("faq");
            setIsPanelOpen(true);
          }} />
        ) : builderView === "ai" ? (
          <div className="flex h-full flex-col">
            <div className="shrink-0 px-8 pt-8 pb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">AI & Automation</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Optimize responses and manage automated actions
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 flex justify-center">
              <ChatbotPanel
                chatbotInstructions={config.chatbotInstructions}
                aiProvider={config.aiProvider}
                aiTemperature={config.aiTemperature}
                aiTone={config.aiTone}
                onSaveConfig={saveConfig}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Right header with actions */}
            <div className="flex h-14 shrink-0 items-center justify-end border-b border-border px-4">
              {isSaving && (
                <div className="flex items-center gap-2 text-muted-foreground mr-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              
              
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
          </>
        )}
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

      {/* Onboarding: train step (full-page) */}
      {showTrainStep && (
        <OnboardingTrainStep
          onNext={handleTrainStepNext}
          onBack={handleTrainStepBack}
          websiteUrl={onboardingWebsiteUrl}
        />
      )}

      {/* Onboarding: brand step (full-page) */}
      {showBrandStep && (
        <OnboardingBrandStep
          onNext={handleBrandStepNext}
          onBack={handleBrandStepBack}
          extractedLogo={extractedBranding.logo}
          extractedColor={extractedBranding.color}
        />
      )}

      {/* Onboarding: test step (full-page) */}
      {showTestStep && (
        <OnboardingTestStep
          onNext={handleTestStepNext}
          onBack={handleTestStepBack}
          widgetId={config.id || undefined}
        />
      )}

      <OnboardingSurveyDialog
        open={showSurveyDialog}
        onComplete={async (answers: SurveyAnswers) => {
          setShowSurveyDialog(false);
          searchParams.delete("onboarding");
          setSearchParams(searchParams, { replace: true });
          if (user) {
            const isSkipped = !answers.businessType && !answers.mainGoal && !answers.monthlyVisitors;
            await (supabase.from("user_activity_logs") as any).insert([
              {
                user_id: user.id,
                event_type: isSkipped ? "survey_skipped" : "survey_completed",
                metadata: answers as any,
              },
              {
                user_id: user.id,
                event_type: "onboarding_completed",
                metadata: {} as any,
              },
            ]);
          }
        }}
      />

      {/* Logout confirmation dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm rounded-3xl p-8 text-center [&>button]:hidden border-0 shadow-xl" overlayClassName="bg-black/10 backdrop-blur-sm">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-medium text-center text-foreground whitespace-pre-line">
              {"Are you sure you\nwant to log out?"}
            </DialogTitle>
            <DialogDescription className="text-center text-base text-muted-foreground">
              Log out of Widjet as {user?.email}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 mt-2">
            <Button
              onClick={async () => {
                setShowLogoutDialog(false);
                await signOut();
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
        userEmail={user?.email}
        language={config.language}
        onLanguageChange={(language) => updateConfig({ language })}
        onSaveConfig={saveConfig}
        isPro={plan === "pro"}
        subscriptionEnd={subscriptionEnd}
        onUpgrade={() => setShowUpgradeOverlay(true)}
        showBranding={config.showBranding}
        onShowBrandingChange={(show) => updateConfig({ showBranding: show })}
        onAvatarChange={setUserAvatarUrl}
        onNameChange={setUserDisplayName}
      />
      {showAllChannels && (
        <AllChannelsOverlay onClose={() => setShowAllChannels(false)} />
      )}

      {/* Mobile bottom navigation bar */}
      {!showWebsiteStep && !showTrainStep && !showBrandStep && !showTestStep && !showSurveyDialog && (
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm px-2 py-1.5 safe-bottom">
        {[
          { key: "home" as const, icon: Home, label: "Home" },
          { key: "conversations" as const, icon: MessageCircle, label: "Chats" },
          { key: "appearance" as const, icon: Palette, label: "Design" },
          { key: "data-sources" as const, icon: BookOpen, label: "Data" },
          { key: "ai" as const, icon: Sparkles, label: "AI" },
        ].map((item) => {
          const isActive = builderView === item.key || (item.key === "home" && builderView === null);
          return (
            <button
              key={item.key}
              onClick={() => {
                setBuilderView(item.key);
                if (item.key === "conversations") setIsMiniSidebar(true);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default Builder;
