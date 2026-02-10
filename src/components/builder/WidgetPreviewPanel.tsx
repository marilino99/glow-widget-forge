import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Home, MessageCircle, HelpCircle, ChevronDown, ChevronRight, ArrowLeft, MoreHorizontal, Smile, ArrowUp, Sparkles, Loader2, Smartphone, Monitor, Instagram, Star, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardData } from "@/types/productCard";
import { FaqItemData } from "@/types/faqItem";
import { InstagramPostData } from "@/types/instagramPost";
import { CustomLinkData } from "@/types/customLink";
import { getTranslations } from "@/lib/translations";

interface WidgetPreviewPanelProps {
  selectedAvatar?: string | null;
  faqEnabled?: boolean;
  contactName?: string;
  offerHelp?: string;
  widgetTheme?: "light" | "dark";
  widgetColor?: string;
  buttonLogo?: string | null;
  backgroundType?: "solid" | "gradient" | "image";
  productCards?: ProductCardData[];
  sayHello?: string;
  language?: string;
  faqItems?: FaqItemData[];
  instagramEnabled?: boolean;
  instagramPosts?: InstagramPostData[];
  websiteUrl?: string | null;
  whatsappEnabled?: boolean;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  customLinks?: CustomLinkData[];
  localPreviewLinks?: { id: string; name: string; url: string }[];
  reportBugsEnabled?: boolean;
  shareFeedbackEnabled?: boolean;
}

// Check if a color is a hex value
const isHexColor = (color: string) => color.startsWith('#');

// Darken a hex color for hover state
const darkenHex = (hex: string, percent: number = 10): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

// Lighten a hex color
const lightenHex = (hex: string, percent: number = 90): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

// Check if color is light (for text contrast)
const isLightColor = (hex: string): boolean => {
  const num = parseInt(hex.slice(1), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00FF;
  const b = num & 0x0000FF;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

// Color mapping for buttons and gradients
const colorMap: Record<string, {
  button: string;
  buttonHover: string;
  gradientLight: string;
  gradientDark: string;
  solidHeader: string;
  solidHeaderText: string;
  hex: string;
}> = {
  gray: {
    button: "bg-gray-500",
    buttonHover: "hover:bg-gray-600",
    gradientLight: "bg-gradient-to-b from-gray-100 via-white to-slate-50",
    gradientDark: "bg-gradient-to-br from-gray-700 to-slate-900",
    solidHeader: "bg-gray-500",
    solidHeaderText: "text-white",
    hex: "#E5E5E5"
  },
  purple: {
    button: "bg-purple-500",
    buttonHover: "hover:bg-purple-600",
    gradientLight: "bg-gradient-to-b from-violet-100 via-white to-pink-50",
    gradientDark: "bg-gradient-to-br from-purple-700 to-slate-900",
    solidHeader: "bg-purple-500",
    solidHeaderText: "text-white",
    hex: "#8B5CF6"
  },
  blue: {
    button: "bg-blue-500",
    buttonHover: "hover:bg-blue-600",
    gradientLight: "bg-gradient-to-b from-violet-100 via-white to-cyan-50",
    gradientDark: "bg-gradient-to-br from-blue-700 to-slate-900",
    solidHeader: "bg-blue-500",
    solidHeaderText: "text-white",
    hex: "#3B82F6"
  },
  cyan: {
    button: "bg-cyan-500",
    buttonHover: "hover:bg-cyan-600",
    gradientLight: "bg-gradient-to-b from-cyan-100 via-white to-emerald-50",
    gradientDark: "bg-gradient-to-br from-cyan-700 to-slate-900",
    solidHeader: "bg-cyan-500",
    solidHeaderText: "text-white",
    hex: "#06B6D4"
  },
  green: {
    button: "bg-green-500",
    buttonHover: "hover:bg-green-600",
    gradientLight: "bg-gradient-to-b from-green-100 via-white to-lime-50",
    gradientDark: "bg-gradient-to-br from-green-700 to-slate-900",
    solidHeader: "bg-green-500",
    solidHeaderText: "text-white",
    hex: "#22C55E"
  },
  yellow: {
    button: "bg-yellow-500",
    buttonHover: "hover:bg-yellow-600",
    gradientLight: "bg-gradient-to-b from-yellow-100 via-white to-orange-50",
    gradientDark: "bg-gradient-to-br from-yellow-600 to-slate-900",
    solidHeader: "bg-yellow-500",
    solidHeaderText: "text-slate-900",
    hex: "#EAB308"
  },
  orange: {
    button: "bg-orange-500",
    buttonHover: "hover:bg-orange-600",
    gradientLight: "bg-gradient-to-b from-orange-100 via-white to-red-50",
    gradientDark: "bg-gradient-to-br from-orange-600 to-slate-900",
    solidHeader: "bg-orange-500",
    solidHeaderText: "text-slate-900",
    hex: "#F97316"
  },
  red: {
    button: "bg-red-500",
    buttonHover: "hover:bg-red-600",
    gradientLight: "bg-gradient-to-b from-red-100 via-white to-rose-50",
    gradientDark: "bg-gradient-to-br from-red-700 to-slate-900",
    solidHeader: "bg-red-500",
    solidHeaderText: "text-white",
    hex: "#EF4444"
  },
  pink: {
    button: "bg-pink-500",
    buttonHover: "hover:bg-pink-600",
    gradientLight: "bg-gradient-to-b from-pink-100 via-white to-rose-50",
    gradientDark: "bg-gradient-to-br from-pink-600 to-slate-900",
    solidHeader: "bg-pink-500",
    solidHeaderText: "text-white",
    hex: "#EC4899"
  }
};

// Find preset by hex color
const findPresetByHex = (hex: string) => {
  return Object.entries(colorMap).find(([, value]) => value.hex.toLowerCase() === hex.toLowerCase());
};
const WidgetPreviewPanel = ({
  selectedAvatar,
  faqEnabled = true,
  contactName = "ciao",
  offerHelp = "Write to us",
  widgetTheme = "dark",
  widgetColor = "blue",
  buttonLogo = null,
  backgroundType = "gradient",
  productCards = [],
  sayHello = "Hello, nice to see you here 👋",
  language = "en",
  faqItems = [],
  instagramEnabled = false,
  instagramPosts = [],
  websiteUrl = null,
  whatsappEnabled = false,
  whatsappCountryCode = "+39",
  whatsappNumber = "",
  customLinks = [],
  localPreviewLinks = [],
  reportBugsEnabled = false,
  shareFeedbackEnabled = false,
}: WidgetPreviewPanelProps) => {
  const t = getTranslations(language);
  const [previewUrl, setPreviewUrl] = useState("");
  const [proxyHtml, setProxyHtml] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingScreenshot, setIsLoadingScreenshot] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [useScreenshotFallback, setUseScreenshotFallback] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInputValue, setChatInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [showReportBug, setShowReportBug] = useState(false);
  const [reportBugDetails, setReportBugDetails] = useState("");
  const [reportBugFiles, setReportBugFiles] = useState<File[]>([]);
  const reportBugFileInputRef = useRef<HTMLInputElement>(null);
  const [reportBugStep, setReportBugStep] = useState(1);
  const [reportBugName, setReportBugName] = useState("");
  const [reportBugEmail, setReportBugEmail] = useState("");
  // Merge saved links with local preview links for display
  const allLinksForPreview = [
    ...customLinks,
    ...localPreviewLinks.map(link => ({
      id: link.id,
      name: link.name,
      url: link.url,
      sort_order: customLinks.length + localPreviewLinks.indexOf(link)
    }))
  ];

  const commonEmojis = ['😀', '😂', '😊', '🥰', '😍', '🤔', '😢', '😭', '😡', '🥳', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙏', '👋', '🤝'];

  // Check if HTML appears to be a JavaScript-heavy SPA with minimal static content
  const isSpaWithNoContent = (html: string): boolean => {
    // Remove scripts and styles
    const strippedHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '');
    
    // Get text content from body
    const bodyMatch = strippedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : strippedHtml;
    
    // Remove all HTML tags and get only text
    const textContent = bodyContent.replace(/<[^>]+>/g, '').trim();
    
    // If text content is very short (less than 50 chars), it's likely a SPA
    return textContent.length < 50;
  };

  const handleLoadUrl = async (urlToLoad?: string) => {
    const url = urlToLoad || previewUrl;
    if (!url.trim()) return;
    setIsLoading(true);
    setLoadError(null);
    setProxyHtml(null);
    setScreenshotUrl(null);
    setUseScreenshotFallback(false);
    
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('proxy-website', {
        body: {
          url: url.trim()
        }
      });
      if (error) {
        console.error('Proxy error:', error);
        // Try screenshot as fallback
        await loadScreenshotFallback(url.trim());
        return;
      }

      // If it's an error response from the function
      if (typeof data === 'object' && data.error) {
        setLoadError(data.error);
        return;
      }
      
      // Check if this is a SPA with no static content
      if (typeof data === 'string' && isSpaWithNoContent(data)) {
        console.log('Detected SPA with minimal content, loading screenshot...');
        setIsLoading(false);
        await loadScreenshotFallback(url.trim());
        return;
      }
      
      setProxyHtml(data);
    } catch (err) {
      console.error('Error loading website:', err);
      setLoadError('Failed to load website');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load screenshot as fallback
  const loadScreenshotFallback = async (urlToLoad?: string, viewport: "desktop" | "mobile" = devicePreview) => {
    const url = urlToLoad || previewUrl;
    if (!url.trim() || isLoadingScreenshot) return;
    
    setIsLoadingScreenshot(true);
    setUseScreenshotFallback(true);
    setIsLoading(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('website-screenshot', {
        body: { url: url.trim(), viewport }
      });
      
      if (error) {
        console.error('Screenshot error:', error);
        return;
      }
      
      if (data.success && data.screenshot) {
        setScreenshotUrl(data.screenshot);
      }
    } catch (err) {
      console.error('Error loading screenshot:', err);
    } finally {
      setIsLoadingScreenshot(false);
    }
  };

  // Reload screenshot when switching devices while in screenshot mode
  useEffect(() => {
    if (useScreenshotFallback && previewUrl && !isLoadingScreenshot) {
      loadScreenshotFallback(previewUrl, devicePreview);
    }
  }, [devicePreview]);

  // Auto-load website URL from config on mount
  useEffect(() => {
    if (websiteUrl && !hasAutoLoaded && !proxyHtml) {
      setPreviewUrl(websiteUrl);
      setHasAutoLoaded(true);
      handleLoadUrl(websiteUrl);
    }
  }, [websiteUrl, hasAutoLoaded, proxyHtml]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadUrl();
    }
  };
  // Theme-based styles
  const isLight = widgetTheme === "light";
  const isSolidMode = backgroundType === "solid";
  
  // Determine if using custom hex color or preset
  const isCustomHex = isHexColor(widgetColor);
  const presetByHex = isCustomHex ? findPresetByHex(widgetColor) : null;
  const presetKey = presetByHex ? presetByHex[0] : widgetColor;
  const colors = colorMap[presetKey] || colorMap.blue;
  
  // Get the actual hex color for custom styling
  const actualHexColor = isCustomHex ? widgetColor : colors.hex;
  const useInlineStyles = isCustomHex && !presetByHex;

  // Background based on backgroundType
  const getWidgetBg = () => {
    if (backgroundType === "gradient") {
      if (useInlineStyles) {
        // For custom hex, we'll use inline styles in the JSX
        return "";
      }
      return isLight ? colors.gradientLight : colors.gradientDark;
    } else if (backgroundType === "solid") {
      // For solid mode, main container is dark, header section gets the color
      return "bg-slate-800";
    }
    return isLight ? "bg-white" : "bg-slate-900";
  };
  const widgetBg = getWidgetBg();
  const widgetText = isSolidMode ? "text-white" : isLight ? "text-slate-900" : "text-white";
  const widgetSubtext = isSolidMode ? "text-white/60" : isLight ? "text-slate-500" : "text-white/60";
  const widgetBorder = isSolidMode ? "border-white/10" : isLight ? "border-slate-200" : "border-white/10";
  const widgetCardBg = isSolidMode ? "bg-slate-700/50" : isLight ? "bg-white" : "bg-slate-700/50";
  const widgetButtonBg = isSolidMode ? "bg-slate-800 hover:bg-slate-700" : isLight ? "bg-slate-200 hover:bg-slate-300" : "bg-slate-800 hover:bg-slate-700";

  // Button colors from selected color - use inline styles for custom hex
  const buttonClass = useInlineStyles ? "text-white" : `${colors.button} ${colors.buttonHover} text-white`;
  const buttonStyle = useInlineStyles ? { backgroundColor: actualHexColor } : {};
  const buttonHoverColor = useInlineStyles ? darkenHex(actualHexColor, 15) : "";

  // Header background for solid mode
  const headerBg = useInlineStyles ? "" : (isSolidMode ? colors.solidHeader : "");
  const headerStyle = useInlineStyles && isSolidMode ? { backgroundColor: actualHexColor } : {};
  const headerText = isSolidMode ? (useInlineStyles ? (isLightColor(actualHexColor) ? "text-slate-900" : "text-white") : colors.solidHeaderText) : "";
  
  // Custom gradient style for custom hex colors
  const customGradientStyle = useInlineStyles && backgroundType === "gradient" ? {
    background: isLight 
      ? `linear-gradient(to bottom, ${lightenHex(actualHexColor, 85)}, white, ${lightenHex(actualHexColor, 90)})`
      : `linear-gradient(to bottom right, ${actualHexColor}, #0f172a)`
  } : {};
  return <div className="flex h-full flex-col bg-muted/50 p-6">
      {/* Browser mockup */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Browser header */}
        <div className="flex items-center border-b border-border bg-muted/50 px-4 py-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
            <div className="h-3 w-3 rounded-full bg-green-400/60" />
          </div>
          
          {/* Centered controls */}
          <div className="flex flex-1 items-center justify-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Previewing</span>
            </div>
            
            {/* Device toggle */}
            <ToggleGroup 
              type="single" 
              value={devicePreview} 
              onValueChange={(value) => value && setDevicePreview(value as "desktop" | "mobile")} 
              className="bg-muted rounded-lg p-1"
            >
              <ToggleGroupItem value="desktop" aria-label="Desktop view" className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="mobile" aria-label="Mobile view" className="h-7 w-7 p-0 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            {/* URL input */}
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Your website URL" 
                value={previewUrl} 
                onChange={e => setPreviewUrl(e.target.value)} 
                onKeyDown={handleKeyDown} 
                className="h-8 w-64 bg-background text-sm" 
              />
              <Button size="icon" className="h-8 w-8" onClick={() => handleLoadUrl()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview content area */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          {isLoading ? (/* Loading state */
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading website...</span>
              </div>
            </div>
          ) : useScreenshotFallback && screenshotUrl ? (/* Screenshot fallback mode for SPA sites */
            <div className="absolute inset-0 overflow-hidden">
              {devicePreview === "mobile" ? (
                /* Mobile: centered screenshot in phone-like container */
                <div className="flex h-full justify-center items-start py-4 overflow-auto">
                  <div 
                    className="shadow-xl rounded-lg overflow-hidden flex-shrink-0" 
                    style={{ 
                      width: '280px', 
                      height: '498px'
                    }}
                  >
                    <img 
                      src={screenshotUrl} 
                      alt="Website screenshot" 
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
              ) : (
                /* Desktop: responsive screenshot that fills container */
          <div className="absolute inset-0">
                  <div className="relative h-full w-full overflow-hidden bg-white">
                    <img 
                      src={screenshotUrl} 
                      alt="Website screenshot" 
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : proxyHtml ? (/* Iframe with proxied website content */
            <div className="absolute inset-0 overflow-hidden">
              {devicePreview === "mobile" ? (
                /* Mobile: centered iframe scaled */
                <div className="flex h-full justify-center items-start py-4 overflow-auto">
                  <div 
                    className="shadow-xl rounded-lg overflow-hidden flex-shrink-0" 
                    style={{ 
                      width: '280px', 
                      height: '498px'
                    }}
                  >
                    <iframe 
                      srcDoc={proxyHtml} 
                      className="border-0 bg-white" 
                      title="Website preview" 
                      sandbox="allow-same-origin"
                      style={{ 
                        width: '375px', 
                        height: '667px',
                        transform: 'scale(0.7467)',
                        transformOrigin: 'top left'
                      }} 
                    />
                  </div>
                </div>
              ) : (
                /* Desktop: responsive iframe that fills container with scaling */
                <div className="absolute inset-0">
                  <div className="relative h-full w-full overflow-hidden">
                    <iframe 
                      srcDoc={proxyHtml} 
                      className="absolute border-0 bg-white" 
                      title="Website preview" 
                      sandbox="allow-same-origin"
                      style={{ 
                        width: '166.67%', 
                        height: '166.67%',
                        transform: 'scale(0.6)',
                        transformOrigin: 'top left'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (/* Skeleton placeholder for website - shown as default or when loading fails */
            devicePreview === "mobile" ? (
              <div className="h-full bg-slate-50 flex justify-center items-start py-4">
                <div className="space-y-5 p-8 bg-white shadow-xl rounded-lg w-[320px] h-[560px]">
                  {/* Header placeholder */}
                  <div className="h-10 w-48 rounded-lg bg-slate-200/80" />
                  {/* Text lines */}
                  <div className="h-3 w-full max-w-md rounded-md bg-slate-200/80" />
                  <div className="h-3 w-3/4 max-w-sm rounded-md bg-slate-200/80" />
                  {/* Main content block */}
                  <div className="mt-4 h-32 w-full max-w-xl rounded-xl bg-slate-200/80" />
                  {/* More text lines */}
                  <div className="h-3 w-full max-w-md rounded-md bg-slate-200/80" />
                  <div className="h-3 w-2/3 max-w-xs rounded-md bg-slate-200/80" />
                  {/* Card grid */}
                  <div className="mt-4 grid grid-cols-3 gap-3 max-w-xl">
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-50">
                <div className="h-full w-full bg-white p-8 space-y-5">
                  {/* Header placeholder */}
                  <div className="h-10 w-48 rounded-lg bg-slate-200/80" />
                  {/* Text lines */}
                  <div className="h-3 w-full max-w-md rounded-md bg-slate-200/80" />
                  <div className="h-3 w-3/4 max-w-sm rounded-md bg-slate-200/80" />
                  {/* Main content block */}
                  <div className="mt-4 h-32 w-full max-w-xl rounded-xl bg-slate-200/80" />
                  {/* More text lines */}
                  <div className="h-3 w-full max-w-md rounded-md bg-slate-200/80" />
                  <div className="h-3 w-2/3 max-w-xs rounded-md bg-slate-200/80" />
                  {/* Card grid */}
                  <div className="mt-4 grid grid-cols-3 gap-3 max-w-xl">
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                    <div className="h-20 rounded-xl bg-slate-200/80" />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Widget preview - interactive */}
          <div 
            className={`absolute z-20 transition-all duration-300 ${
              devicePreview === "mobile" 
                ? "w-72 scale-[0.55] origin-bottom-right" 
                : "w-80 bottom-5 right-5"
            }`} 
            style={devicePreview === "mobile" ? { 
              bottom: '48px',
              right: 'calc(50% - 100px)'
            } : undefined}
          >
            {isCollapsed ? (/* Collapsed Icon */
          <div className="flex justify-end">
                <button 
                  onClick={() => setIsCollapsed(false)} 
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${buttonClass} shadow-lg transition-colors overflow-hidden`}
                  style={buttonStyle}
                  onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                  onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                >
                  {buttonLogo ? <img src={buttonLogo} alt="Widget logo" className="h-full w-full object-cover" /> : <HelpCircle className="h-7 w-7 text-white" />}
                </button>
              </div>) : showChat ? (/* Chat View */
          <div className={`flex h-[500px] max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl shadow-2xl ${widgetBg} ${widgetText}`} style={customGradientStyle}>
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowChat(false)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${widgetCardBg}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">{contactName}</span>
                  </div>
                  <button onClick={() => setIsCollapsed(true)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {/* Welcome message */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 text-white">
                      <p className="text-sm">{t.welcomeMessage}</p>
                    </div>
                  </div>
                  {/* User messages */}
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="flex justify-end mt-3">
                      <div 
                        className={`rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] ${useInlineStyles ? "" : colors.button} text-white`}
                        style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                      >
                        <p className="text-sm">{msg}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat input */}
                <div className={`relative border-t p-4 ${widgetBorder}`}>
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className={`absolute bottom-full left-4 right-4 mb-2 p-3 rounded-xl shadow-lg ${isLight ? "bg-white border border-slate-200" : "bg-slate-800 border border-slate-700"}`}>
                      <div className="grid grid-cols-10 gap-1">
                        {commonEmojis.map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setChatInputValue(chatInputValue + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 rounded-full border border-violet-500/50 px-4 py-2 ${isLight ? "bg-white" : "bg-slate-800/50"}`}>
                    <input 
                      type="text" 
                      placeholder={t.writeMessage} 
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInputValue.trim()) {
                          setChatMessages([...chatMessages, chatInputValue.trim()]);
                          setChatInputValue('');
                          setShowEmojiPicker(false);
                        }
                      }}
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${isLight ? "placeholder:text-slate-400" : "placeholder:text-white/40"}`} 
                    />
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`${widgetSubtext} hover:opacity-80 transition-opacity`}
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (chatInputValue.trim()) {
                          setChatMessages([...chatMessages, chatInputValue.trim()]);
                          setChatInputValue('');
                          setShowEmojiPicker(false);
                        }
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                        chatInputValue.trim() 
                          ? `${useInlineStyles ? "" : colors.button} text-white` 
                          : isLight 
                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200" 
                            : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      }`}
                      style={chatInputValue.trim() && useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Powered by */}
                <div className={`border-t py-2 text-center ${widgetBorder}`}>
                  <span className={`text-xs ${widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
              </div>) : showContactPage ? (/* Contact Page View */
          <div className={`flex flex-col h-[500px] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl shadow-2xl ${isSolidMode ? "bg-slate-800" : ""} ${widgetText}`} style={{ backgroundColor: isLight ? '#f8f8f8' : '#000' }}>
                {/* Contact page header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => setShowContactPage(false)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setIsCollapsed(true)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact page content */}
                <div className="flex-1 overflow-y-auto px-6">
                  <h3 className={`text-2xl font-bold mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>{t.contact || "Contact us"}</h3>
                  
                  <p className={`text-sm mb-4 ${isLight ? "text-slate-400" : "text-white/40"}`}>Email</p>

                  {/* Report a bug card */}
                  {reportBugsEnabled && (
                    <button 
                      onClick={() => { setShowReportBug(true); setShowContactPage(false); }}
                      className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 mb-3 transition-colors ${
                        isLight ? "bg-white shadow-sm hover:bg-slate-50" : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <svg viewBox="0 0 24 24" className={`h-6 w-6 ${isLight ? "text-slate-700" : "text-white"}`} fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                          <path d="M12 9V3M12 15v6M9 12H3M15 12h6M7.5 7.5 4 4M16.5 16.5 20 20M7.5 16.5 4 20M16.5 7.5 20 4" />
                        </svg>
                        <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>Report a bug</span>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isLight ? "bg-slate-200" : "bg-slate-600"}`}>
                        <ArrowRight className={`h-4 w-4 ${isLight ? "text-slate-600" : "text-white"}`} />
                      </div>
                    </button>
                  )}

                  {/* Share feedback card */}
                  {shareFeedbackEnabled && (
                    <button 
                      className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 mb-3 transition-colors ${
                        isLight ? "bg-white shadow-sm hover:bg-slate-50" : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Star className={`h-6 w-6 ${isLight ? "text-slate-700" : "text-white"}`} />
                        <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>Share feedback</span>
                      </div>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isLight ? "bg-slate-200" : "bg-slate-600"}`}>
                        <ArrowRight className={`h-4 w-4 ${isLight ? "text-slate-600" : "text-white"}`} />
                      </div>
                    </button>
                  )}
                </div>

                {/* Footer nav */}
                <div className={`px-4 pb-1 pt-3 shrink-0`}>
                  <div className={`flex rounded-2xl backdrop-blur-md ${isLight ? "bg-white/70 shadow-sm" : "bg-slate-700/70"}`}>
                    <button 
                      className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-400 hover:text-slate-600" : `${widgetSubtext} hover:opacity-80`}`}
                      onClick={() => setShowContactPage(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-xs">{t.home}</span>
                    </button>
                    <button className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-900" : widgetText}`}>
                      <MessageCircle className="h-5 w-5" fill={isLight ? "currentColor" : "none"} />
                      <span className="text-xs">{t.contact}</span>
                    </button>
                  </div>
                </div>

                <div className={`py-2 text-center shrink-0`}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
              </div>) : showReportBug ? (/* Report Bug Form View */
          <div className={`flex flex-col h-[500px] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl shadow-2xl ${widgetText}`} style={{ backgroundColor: isLight ? '#f8f8f8' : '#000' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => { 
                    if (reportBugStep === 2) { setReportBugStep(1); } 
                    else { setShowReportBug(false); setShowContactPage(true); setReportBugStep(1); }
                  }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => { setShowReportBug(false); setReportBugStep(1); setIsCollapsed(true); }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col items-center">
                      {reportBugStep === 1 ? (
                        <div className="relative">
                          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${useInlineStyles ? "" : "bg-emerald-500"}`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}} />
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${isLight ? "border-slate-200 text-slate-500" : "border-slate-600 text-slate-400"}`}>
                            <span className="text-xs font-medium">1</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${useInlineStyles ? "" : "bg-emerald-600"} text-white`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}>
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                    <div className={`flex-1 border-t border-dashed mx-2 ${isLight ? "border-slate-300" : "border-slate-600"}`} />
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {reportBugStep === 2 && (
                          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${useInlineStyles ? "" : "bg-emerald-500"}`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}} />
                        )}
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${isLight ? "border-slate-200 text-slate-400" : "border-slate-600 text-slate-500"}`}>
                          <span className="text-xs font-medium">2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {reportBugStep === 1 ? (
                    <>
                      {/* Step 1: Describe problem */}
                      <h3 className={`text-sm font-bold mb-3 leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        Describe the problem you have encountered. Please be as specific as possible.
                      </h3>

                      <div className="mb-3">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          Share details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reportBugDetails}
                          onChange={(e) => setReportBugDetails(e.target.value)}
                          className={`w-full min-h-[100px] rounded-xl border-2 border-dashed p-2.5 text-xs resize-none focus:outline-none ${
                            isLight 
                              ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400" 
                              : "border-slate-600 bg-slate-800 text-white placeholder:text-white/40 focus:border-slate-500"
                          }`}
                          placeholder=""
                        />
                      </div>

                      {/* Attach and next */}
                      <div className={`flex items-center justify-between rounded-2xl px-3 py-2.5 mb-3 ${isLight ? "bg-white shadow-sm" : "bg-slate-800"}`}>
                        <input
                          type="file"
                          ref={reportBugFileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.txt,.log"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              setReportBugFiles(prev => [...prev, ...newFiles].slice(0, 3));
                            }
                            e.target.value = '';
                          }}
                        />
                        <button 
                          onClick={() => reportBugFileInputRef.current?.click()}
                          className={`flex items-center gap-2 ${isLight ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white/60"} transition-colors`}
                        >
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed ${isLight ? "border-slate-300" : "border-slate-600"}`}>
                            <Plus className="h-3 w-3" />
                          </div>
                          <span className="text-xs">{reportBugFiles.length > 0 ? `${reportBugFiles.length}/3 files` : "Attach files"}</span>
                        </button>
                        <button 
                          onClick={() => setReportBugStep(2)}
                          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                            isLight 
                              ? "bg-slate-100 text-slate-900 hover:bg-slate-200" 
                              : "bg-slate-700 text-white hover:bg-slate-600"
                          }`}
                        >
                          Next
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Step 2: Name & Email */}
                      <h3 className={`text-sm font-bold mb-4 leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        We will get back to you on provided email.
                      </h3>

                      <div className="mb-3">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          What's your name?
                        </label>
                        <input
                          type="text"
                          value={reportBugName}
                          onChange={(e) => setReportBugName(e.target.value)}
                          className={`w-full rounded-xl p-2.5 text-xs focus:outline-none ${
                            isLight 
                              ? "bg-white border border-slate-200 text-slate-900 focus:border-slate-400" 
                              : "bg-slate-800 border border-slate-600 text-white focus:border-slate-500"
                          }`}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          What's your email? <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={reportBugEmail}
                          onChange={(e) => setReportBugEmail(e.target.value)}
                          className={`w-full rounded-xl p-2.5 text-xs focus:outline-none ${
                            isLight 
                              ? "bg-white border border-slate-200 text-slate-900 focus:border-slate-400" 
                              : "bg-slate-800 border border-slate-600 text-white focus:border-slate-500"
                          }`}
                        />
                      </div>

                      {/* Previous and Send */}
                      <div className="flex items-center justify-between mb-3">
                        <button 
                          onClick={() => setReportBugStep(1)}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
                            isLight 
                              ? "bg-white shadow-sm text-slate-900 hover:bg-slate-50" 
                              : "bg-slate-800 text-white hover:bg-slate-700"
                          }`}
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          Previous
                        </button>
                        <button 
                          className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-medium text-white transition-colors ${useInlineStyles ? "" : "bg-blue-600 hover:bg-blue-700"}`}
                          style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                        >
                          Send
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer nav */}
                <div className={`px-4 pb-1 pt-3 shrink-0`}>
                  <div className={`flex rounded-2xl backdrop-blur-md ${isLight ? "bg-white/70 shadow-sm" : "bg-slate-700/70"}`}>
                    <button 
                      className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-400 hover:text-slate-600" : `${widgetSubtext} hover:opacity-80`}`}
                      onClick={() => { setShowReportBug(false); setShowContactPage(false); }}
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-xs">{t.home}</span>
                    </button>
                    <button 
                      className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-900" : widgetText}`}
                      onClick={() => { setShowReportBug(false); setShowContactPage(true); }}
                    >
                      <MessageCircle className="h-5 w-5" fill={isLight ? "currentColor" : "none"} />
                      <span className="text-xs">{t.contact}</span>
                    </button>
                  </div>
                </div>

                <div className={`py-2 text-center shrink-0`}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
              </div>) : (/* Home View */
          <div className={`flex flex-col h-[500px] max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl shadow-2xl ${isSolidMode ? "bg-slate-800" : widgetBg} ${widgetText}`} style={!isSolidMode ? customGradientStyle : {}}>
                {/* Scrollable content area */}
                <div className={`flex-1 overflow-y-auto ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                {/* Main content area - colored for solid mode (header + contact + extra space) */}
                <div 
                  className={`${isSolidMode ? `${useInlineStyles ? "" : colors.solidHeader} ${headerText} pb-12` : ""}`}
                  style={isSolidMode && useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                >
                  {/* Widget header */}
                  <div className="relative overflow-hidden px-6 py-5">
                    {!isSolidMode && !isLight && <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 blur-2xl" />}
                    <button onClick={() => setIsCollapsed(true)} className={`absolute right-4 top-4 ${isSolidMode ? "text-current opacity-70" : widgetSubtext} hover:opacity-80`}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <h3 className="relative text-2xl font-bold whitespace-pre-line max-w-[70%] break-words">
                      {sayHello}
                    </h3>
                  </div>

                  {/* Contact section */}
                  <div className={`mx-4 rounded-xl p-4 ${isSolidMode ? "bg-slate-800/90" : widgetCardBg}`}>
                    <div className="flex items-center gap-3">
                      {selectedAvatar ? <img src={selectedAvatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-sm font-bold text-slate-900">
                          C
                        </div>}
                    <div className="flex-1">
                      <p className={`text-xs ${isSolidMode ? "text-white/60" : widgetSubtext}`}>{contactName}</p>
                      <p className={`text-sm ${isSolidMode ? "text-white" : ""}`}>{offerHelp}</p>
                    </div>
                    </div>
                    <Button 
                      className={`mt-3 w-full ${buttonClass}`} 
                      style={buttonStyle}
                      onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                      onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                      onClick={() => setShowChat(true)}
                    >
                      {t.contactUs}
                    </Button>
                    {/* WhatsApp Button */}
                    {whatsappEnabled && (
                      <button 
                        onClick={() => {
                          if (whatsappNumber) {
                            const url = `https://wa.me/${whatsappCountryCode.replace('+', '')}${whatsappNumber}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`mt-2 w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                          isLight 
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-900" 
                            : "bg-transparent border border-white/20 hover:bg-white/10 text-white"
                        } ${!whatsappNumber ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={!whatsappNumber}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {t.contactWhatsApp || "Contact us on WhatsApp"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Cards Section - horizontal carousel */}
                {productCards.filter(c => !c.isLoading).length > 0 && <div className="relative mt-4">
                    {/* Solid mode background band - stops at ~1/4 of first card */}
                    {isSolidMode && (
                      <div 
                        className={`absolute top-0 left-0 right-0 h-12 ${useInlineStyles ? "" : colors.solidHeader}`}
                        style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                      />
                    )}
                    <div className={`relative pb-4 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                      <div className="relative">
                        <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {productCards.filter(c => !c.isLoading).map(card => <div key={card.id} className={`flex-shrink-0 rounded-2xl overflow-hidden ${isSolidMode ? "bg-slate-800" : isLight ? "bg-white shadow-sm" : "bg-slate-800"}`} style={{ width: 'calc(100% - 48px)' }}>
                              {/* Product Image - tall aspect ratio like reference */}
                              <div className={`aspect-[4/3] flex items-center justify-center ${isSolidMode ? "bg-slate-300" : isLight ? "bg-slate-200" : "bg-slate-300"}`}>
                                {card.imageUrl ? <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" /> : <div className="h-12 w-12 rounded bg-slate-400" />}
                              </div>
                              {/* Product Info */}
                              <div className={`p-4 ${isSolidMode ? "text-white" : ""}`}>
                                {card.price && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">{card.price}</span>
                                    {card.oldPrice && (
                                      <span className={`text-sm line-through ${isSolidMode ? "text-slate-400" : isLight ? "text-muted-foreground" : "text-slate-500"}`}>{card.oldPrice}</span>
                                    )}
                                  </div>
                                )}
                                <h4 className="font-bold text-base">{card.title}</h4>
                                {card.subtitle && (
                                  <p className={`text-sm mt-0.5 mb-3 ${isSolidMode ? "text-slate-300" : isLight ? "text-muted-foreground" : "text-slate-400"}`}>{card.subtitle}</p>
                                )}
                                {!card.subtitle && <div className="mb-3" />}
                                {card.productUrl ? (
                                  <a href={card.productUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <Button 
                                      className={`w-full ${buttonClass} rounded-lg py-2.5 text-sm font-medium`}
                                      style={buttonStyle}
                                      onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                                      onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                                    >
                                      {t.show}
                                    </Button>
                                  </a>
                                ) : (
                                  <Button 
                                    className={`w-full ${buttonClass} rounded-lg py-2.5 text-sm font-medium`}
                                    style={buttonStyle}
                                    onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                                    onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                                  >
                                    {t.show}
                                  </Button>
                                )}
                              </div>
                            </div>)}
                        </div>
                        {/* Scroll arrow button */}
                        {productCards.filter(c => !c.isLoading).length > 1 && (
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <ChevronDown className="h-5 w-5 text-slate-700 -rotate-90" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>}

                {/* Instagram UGC Section - horizontal carousel */}
                {instagramEnabled && instagramPosts.length > 0 && (
                  <div className={`relative ${productCards.filter(c => !c.isLoading).length === 0 ? "mt-4" : ""}`}>
                    {isSolidMode && productCards.filter(c => !c.isLoading).length === 0 && (
                      <div 
                        className={`absolute top-0 left-0 right-0 h-10 ${useInlineStyles ? "" : colors.solidHeader}`}
                        style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                      />
                    )}
                    <div className={`relative pb-4 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                      <div className="px-4 mb-2">
                        <div className="flex items-center gap-2">
                          <Instagram className={`h-4 w-4 ${isLight ? "text-pink-500" : "text-pink-400"}`} />
                          <span className={`text-sm font-medium ${isLight ? "text-slate-900" : ""}`}>Follow us on Instagram</span>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {instagramPosts.map((post) => (
                          <a
                            key={post.id}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                            style={{ width: '100px', height: '100px' }}
                          >
                            {post.thumbnailUrl ? (
                              <img 
                                src={post.thumbnailUrl} 
                                alt={post.caption || "Instagram post"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-slate-200" : "bg-slate-700"}`}>
                                <Instagram className={`h-6 w-6 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick answers section */}
                {faqEnabled && faqItems.length > 0 && <div className={`relative ${productCards.filter(c => !c.isLoading).length === 0 ? "mt-4" : ""}`}>
                    {/* Solid mode background band - stops at ~1/4 of FAQ box */}
                    {isSolidMode && productCards.filter(c => !c.isLoading).length === 0 && (
                      <div className={`absolute top-0 left-0 right-0 h-10 ${colors.solidHeader}`} />
                    )}
                    <div className={`relative px-4 pb-4 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                      <div className="rounded-2xl p-4" style={{ backgroundColor: isLight ? '#ffffff' : '#252525' }}>
                        <div className="mb-3 flex items-center gap-2">
                          <HelpCircle className={`h-4 w-4 ${isLight ? "text-slate-500" : widgetSubtext}`} />
                          <span className={`text-sm font-medium ${isLight ? "text-slate-900" : ""}`}>{t.quickAnswers}</span>
                        </div>
                        <div className="space-y-1">
                          {faqItems.map((faq) => (
                            <div key={faq.id}>
                              <button 
                                onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${isLight ? "text-slate-900 hover:bg-slate-100" : "hover:bg-white/5"}`}
                              >
                                <span className="font-medium">{faq.question || "Untitled question"}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedFaqId === faq.id ? "rotate-180" : ""} ${isLight ? "text-slate-500" : widgetSubtext}`} />
                              </button>
                              {expandedFaqId === faq.id && faq.answer && (
                                <div className={`px-3 pb-3 pt-1 text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>}

                {/* Custom Links section */}
                {allLinksForPreview.length > 0 && (
                  <div className={`px-4 pb-4 ${isLight ? "" : "bg-black"} ${
                    productCards.filter(c => !c.isLoading).length === 0 && 
                    !instagramEnabled && 
                    !(faqEnabled && faqItems.length > 0) 
                      ? "mt-4" 
                      : ""
                  }`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                    {allLinksForPreview.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          if (link.url) {
                            window.open(link.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className={`flex items-center justify-between rounded-xl px-4 py-3.5 mb-2 last:mb-0 transition-colors shadow-sm ${
                          isLight 
                            ? "bg-white hover:bg-slate-50" 
                            : "bg-slate-800 hover:bg-slate-700"
                        }`}
                      >
                        <span className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                          {link.name || ""}
                        </span>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          isLight ? "bg-slate-500" : "bg-slate-600"
                        }`}>
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                </div>

                {/* Footer nav - box with backdrop blur */}
                <div className={`px-4 pb-1 pt-3 shrink-0 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                  <div className={`flex rounded-2xl backdrop-blur-md ${isLight ? "bg-white/70 shadow-sm" : "bg-slate-700/70"}`}>
                    <button className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-900" : widgetText}`}>
                      <Home className="h-5 w-5" fill={isLight ? "currentColor" : "none"} />
                      <span className="text-xs">{t.home}</span>
                    </button>
                    <button className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-400 hover:text-slate-600" : `${widgetSubtext} hover:opacity-80`}`} onClick={() => { setShowContactPage(true); setShowChat(false); }}>
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-xs">{t.contact}</span>
                    </button>
                  </div>
                </div>

                <div className={`py-2 text-center shrink-0 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default WidgetPreviewPanel;