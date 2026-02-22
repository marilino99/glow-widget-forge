import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Home, MessageCircle, HelpCircle, ChevronDown, ChevronRight, ArrowLeft, MoreHorizontal, Smile, ArrowUp, Sparkle, Sparkles, Loader2, Smartphone, Monitor, Instagram, Star, Plus, X, Download, Trash2, Maximize2, Minimize2, Mic } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { ProductCardData } from "@/types/productCard";
import { FaqItemData } from "@/types/faqItem";
import { InstagramPostData } from "@/types/instagramPost";
import { CustomLinkData } from "@/types/customLink";
import { GoogleBusinessData } from "./GoogleReviewsPanel";
import { getTranslations } from "@/lib/translations";
import TypewriterText from "./TypewriterText";
import SocialProofTooltip from "./SocialProofTooltip";

interface WidgetPreviewPanelProps {
  activeWidget?: string | null;
  selectedAvatar?: string | null;
  faqEnabled?: boolean;
  contactName?: string;
  offerHelp?: string;
  widgetTheme?: "light" | "dark";
  widgetColor?: string;
  buttonLogo?: string | null;
  logo?: string | null;
  backgroundType?: "solid" | "gradient" | "image";
  backgroundImage?: string | null;
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
  widgetId?: string;
  googleBusiness?: GoogleBusinessData | null;
  customCss?: string;
  customJs?: string;
  showBranding?: boolean;
  widgetPosition?: "left" | "right";
  widgetType?: "popup" | "bottom-bar";
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
  logo = null,
  backgroundType = "gradient",
  backgroundImage = null,
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
  widgetId,
  googleBusiness,
  activeWidget,
  customCss = "",
  customJs = "",
  showBranding = true,
  widgetPosition = "right",
  widgetType = "popup",
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
  const [isAnimatingCollapse, setIsAnimatingCollapse] = useState(false);
  const [isAnimatingExpand, setIsAnimatingExpand] = useState(false);
  const [showButtonPop, setShowButtonPop] = useState(false);
  const [showFaqPills, setShowFaqPills] = useState(false);
  const [isBottomBarExpanded, setIsBottomBarExpanded] = useState(false);

  // Auto-show FAQ pills after delay when bottom bar is expanded
  useEffect(() => {
    if (widgetType === "bottom-bar" && !isCollapsed && faqItems.length > 0) {
      const timer = setTimeout(() => setShowFaqPills(true), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowFaqPills(false);
    }
  }, [widgetType, isCollapsed, faqItems.length]);

  // Animated collapse: play animation then hide
  const handleCollapse = () => {
    if (isAnimatingCollapse) return;
    setIsAnimatingCollapse(true);
    setIsBottomBarExpanded(false);
    setTimeout(() => {
      setIsCollapsed(true);
      setIsAnimatingCollapse(false);
      setShowButtonPop(true);
      setTimeout(() => setShowButtonPop(false), 400);
    }, 250);
  };

  // Animated expand
  const handleExpand = () => {
    setIsCollapsed(false);
    setIsAnimatingExpand(true);
    setTimeout(() => setIsAnimatingExpand(false), 600);
  };

  // Auto-expand widget when widgetType changes: collapse first, then re-expand like a click
  const isFirstWidgetType = useRef(true);
  useEffect(() => {
    if (isFirstWidgetType.current) {
      isFirstWidgetType.current = false;
      return;
    }
    // First collapse it
    setIsCollapsed(true);
    setShowButtonPop(true);
    // Then after the button pop, simulate a click to expand
    setTimeout(() => {
      setShowButtonPop(false);
      handleExpand();
    }, 500);
  }, [widgetType]);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
   const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [faqAiAnswers, setFaqAiAnswers] = useState<Record<string, string>>({});
  const [faqAiLoading, setFaqAiLoading] = useState<string | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const [useScreenshotFallback, setUseScreenshotFallback] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string; sender: "user" | "bot"}[]>([]);
  const [chatInputValue, setChatInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [showReportBug, setShowReportBug] = useState(false);
  const [reportBugDetails, setReportBugDetails] = useState("");
  const [reportBugFiles, setReportBugFiles] = useState<File[]>([]);
  const reportBugFileInputRef = useRef<HTMLInputElement>(null);
  const [reportBugStep, setReportBugStep] = useState(1);
  const [reportBugName, setReportBugName] = useState("");
  const [reportBugEmail, setReportBugEmail] = useState("");
  const [reportBugDetailsError, setReportBugDetailsError] = useState(false);
  const [isSendingBugReport, setIsSendingBugReport] = useState(false);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [feedbackStep, setFeedbackStep] = useState(1);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackRatingError, setFeedbackRatingError] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [googleReviewDismissed, setGoogleReviewDismissed] = useState(false);
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language || "en";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setChatInputValue(finalTranscript + interim);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
        recognitionRef.current = null;
      };

      setIsListening(true);
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Close chat menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setShowChatMenu(false);
      }
    };
    if (showChatMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showChatMenu]);

  const handleClearChat = () => {
    setChatMessages([]);
    setShowChatMenu(false);
  };

  const handleDownloadTranscript = () => {
    const lines = chatMessages.map(m => `${m.sender === "user" ? "You" : contactName || "Bot"}: ${m.text}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
    setShowChatMenu(false);
  };

  const handleSendChatMessage = async (text: string) => {
    const userMsg = { text, sender: "user" as const };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInputValue('');
    setShowEmojiPicker(false);

    if (!widgetId) return;

    setIsBotTyping(true);
    try {
      const allMessages = [...chatMessages, userMsg].map(m => ({ text: m.text, sender: m.sender }));
      const { data, error } = await supabase.functions.invoke('chatbot-preview', {
        body: { messages: allMessages, widgetId },
      });
      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 429) {
          setChatMessages(prev => [...prev, { text: "⚠️ Hai raggiunto il limite di richieste AI. Riprova tra qualche minuto.", sender: "bot" as const }]);
        } else {
          setChatMessages(prev => [...prev, { text: "⚠️ Si è verificato un errore. Riprova più tardi.", sender: "bot" as const }]);
        }
      } else if (data?.reply) {
        setChatMessages(prev => [...prev, { text: data.reply, sender: "bot" as const }]);
      }
    } catch (err) {
      console.error('Preview chatbot error:', err);
      setChatMessages(prev => [...prev, { text: "⚠️ Errore di connessione. Riprova più tardi.", sender: "bot" as const }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Fetch AI answer when expanding a FAQ without a user-set answer
  useEffect(() => {
    if (!expandedFaqId || !widgetId) return;
    const faq = faqItems.find(f => f.id === expandedFaqId);
    if (!faq || faq.answer?.trim() || faqAiAnswers[expandedFaqId]) return;
    if (!faq.question?.trim()) return;

    let cancelled = false;
    setFaqAiLoading(expandedFaqId);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('chatbot-preview', {
          body: {
            messages: [{ text: faq.question, sender: "user" }],
            widgetId,
          },
        });
        if (!cancelled && data?.reply) {
          setFaqAiAnswers(prev => ({ ...prev, [expandedFaqId]: data.reply }));
        }
      } catch (err) {
        console.error('FAQ AI answer error:', err);
      } finally {
        if (!cancelled) setFaqAiLoading(null);
      }
    })();

    return () => { cancelled = true; };
  }, [expandedFaqId, widgetId, faqItems, faqAiAnswers]);

  useEffect(() => {
    const id = 'wj-preview-custom-css';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (customCss) {
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        document.head.appendChild(el);
      }
      el.textContent = customCss;
    } else if (el) {
      el.remove();
    }
    return () => { document.getElementById(id)?.remove(); };
  }, [customCss]);

  // Execute custom JS when it changes
  useEffect(() => {
    if (customJs) {
      try { new Function(customJs)(); } catch(e) { console.error('[Widget Preview] Custom JS error:', e); }
    }
  }, [customJs]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  // Reset dismissed state when business changes
  useEffect(() => {
    setGoogleReviewDismissed(false);
  }, [googleBusiness]);

  // Collapse widget when entering Google Reviews section
  useEffect(() => {
    if (activeWidget === "google-reviews") {
      handleCollapse();
    }
  }, [activeWidget]);

  const handleSendBugReport = async () => {
    // Bug report sending removed
    setReportBugStep(3);
  };
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
    if (!url.trim()) {
      // Reset to skeleton placeholder when URL is cleared
      setProxyHtml(null);
      setScreenshotUrl(null);
      setUseScreenshotFallback(false);
      setLoadError(null);
      return;
    }
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
  const buttonTextColor = isLightColor(actualHexColor) ? "text-slate-900" : "text-white";
  const buttonClass = useInlineStyles ? buttonTextColor : `${colors.button} ${colors.buttonHover} ${buttonTextColor}`;
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
                /* Mobile: iPhone frame centered */
                <div className="flex h-full items-center justify-center bg-muted/30">
                  <div className="relative rounded-[3rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden" style={{ width: '290px', height: '620px', maxHeight: '100%' }}>
                    {/* Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[90px] h-[28px] bg-black rounded-full" />
                    <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-white">
                      <img 
                        src={screenshotUrl} 
                        alt="Website screenshot" 
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
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
                /* Mobile: iPhone frame centered */
                <div className="flex h-full items-center justify-center bg-muted/30">
                  <div className="relative rounded-[3rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden" style={{ width: '290px', height: '620px', maxHeight: '100%' }}>
                    {/* Dynamic Island */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[90px] h-[28px] bg-black rounded-full" />
                    <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-white">
                      <iframe 
                        srcDoc={proxyHtml} 
                        className="absolute border-0 bg-white" 
                        title="Website preview" 
                        sandbox="allow-same-origin"
                        style={{ 
                          width: '375px', 
                          height: '812px',
                          transform: 'scale(0.747)',
                          transformOrigin: 'top left'
                        }} 
                      />
                    </div>
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
              <div className="flex h-full items-center justify-center bg-muted/30">
                <div className="relative rounded-[3rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden" style={{ width: '290px', height: '620px', maxHeight: '100%' }}>
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-[90px] h-[28px] bg-black rounded-full" />
                  <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-white p-6 space-y-5">
                    <div className="h-10 w-40 rounded-lg bg-slate-200/80 mt-8" />
                    <div className="h-3 w-full rounded-md bg-slate-200/80" />
                    <div className="h-3 w-3/4 rounded-md bg-slate-200/80" />
                    <div className="mt-4 h-28 w-full rounded-xl bg-slate-200/80" />
                    <div className="h-3 w-full rounded-md bg-slate-200/80" />
                    <div className="h-3 w-2/3 rounded-md bg-slate-200/80" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-xl bg-slate-200/80" />
                      <div className="h-20 rounded-xl bg-slate-200/80" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-slate-50">
                <div className="h-full w-full bg-white p-8 space-y-5">
                  {/* Header placeholder */}
                  <div className="h-10 w-1/4 rounded-lg bg-slate-200/80" />
                  {/* Nav bar */}
                  <div className="flex gap-4">
                    <div className="h-3 w-16 rounded-md bg-slate-200/80" />
                    <div className="h-3 w-16 rounded-md bg-slate-200/80" />
                    <div className="h-3 w-16 rounded-md bg-slate-200/80" />
                    <div className="h-3 w-16 rounded-md bg-slate-200/80" />
                  </div>
                  {/* Hero block */}
                  <div className="mt-6 h-48 w-full rounded-xl bg-slate-200/80" />
                  {/* Text lines */}
                  <div className="h-4 w-3/4 rounded-md bg-slate-200/80" />
                  <div className="h-4 w-1/2 rounded-md bg-slate-200/80" />
                  <div className="h-3 w-full rounded-md bg-slate-100/80" />
                  <div className="h-3 w-5/6 rounded-md bg-slate-100/80" />
                  {/* Card grid */}
                  <div className="mt-6 grid grid-cols-3 gap-4 w-full">
                    <div className="h-32 rounded-xl bg-slate-200/80" />
                    <div className="h-32 rounded-xl bg-slate-200/80" />
                    <div className="h-32 rounded-xl bg-slate-200/80" />
                  </div>
                  {/* Footer area */}
                  <div className="mt-6 flex gap-4">
                    <div className="h-3 w-20 rounded-md bg-slate-100/80" />
                    <div className="h-3 w-20 rounded-md bg-slate-100/80" />
                    <div className="h-3 w-20 rounded-md bg-slate-100/80" />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Bottom Bar widget type */}
          {widgetType === "bottom-bar" && (
            isCollapsed && !isAnimatingCollapse ? (
              /* Collapsed: show circular launcher button (tondolino) */
              <div
                className={`absolute z-20 bottom-5 ${widgetPosition === 'left' ? 'left-5' : 'right-5'} flex flex-col ${widgetPosition === 'left' ? 'items-start' : 'items-end'}`}
              >
                {/* Google Reviews notification card */}
                {googleBusiness && !googleReviewDismissed && (
                  <div
                    className="mb-3 w-[300px] rounded-2xl bg-white shadow-lg p-4 border border-slate-100 cursor-pointer"
                    onClick={() => {
                      const mapsUrl = googleBusiness.url || googleBusiness.website;
                      if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xl font-bold text-slate-900">{googleBusiness.rating ?? "–"}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const rating = googleBusiness.rating ?? 0;
                              const full = star <= Math.floor(rating);
                              const half = !full && star === Math.ceil(rating) && rating % 1 >= 0.25;
                              return (
                                <div key={star} className="relative h-5 w-5">
                                  <Star className="absolute inset-0 h-5 w-5 text-slate-300" />
                                  {(full || half) && (
                                    <div className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
                                      <Star className="h-5 w-5 text-slate-900 fill-slate-900" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{googleBusiness.name}</p>
                        <p className="text-sm text-slate-500">
                          Check <span className="font-bold text-slate-900">{googleBusiness.user_ratings_total ?? 0}</span> reviews on{" "}
                          <span className="text-[#4285F4]">G</span>
                          <span className="text-[#EA4335]">o</span>
                          <span className="text-[#FBBC05]">o</span>
                          <span className="text-[#4285F4]">g</span>
                          <span className="text-[#34A853]">l</span>
                          <span className="text-[#EA4335]">e</span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setGoogleReviewDismissed(true);
                          handleExpand();
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                {!(googleBusiness && !googleReviewDismissed) && (
                  <button 
                    onClick={() => handleExpand()} 
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${buttonClass} shadow-lg transition-colors overflow-hidden ${showButtonPop ? 'animate-button-pop' : ''}`}
                    id="wj-btn"
                    style={buttonStyle}
                    onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                    onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                  >
                    {buttonLogo ? <img src={buttonLogo} alt="Widget logo" className="h-full w-full object-cover" /> : <HelpCircle className="h-7 w-7 text-white" />}
                  </button>
                )}
              </div>
            ) : isBottomBarExpanded ? (
              /* Expanded bottom bar with chat */
              <>
                <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0) 100%)' }} />
                <div
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[540px] px-4 animate-widget-expand`}
                >
                  <div className="flex flex-col rounded-2xl bg-white shadow-xl overflow-hidden" style={{ border: `1px solid ${actualHexColor}` }}>
                    {/* Top-right controls */}
                    <div className="flex items-center justify-end px-3 pt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsBottomBarExpanded(false)}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                        <button
                          onClick={() => { setIsBottomBarExpanded(false); handleCollapse(); }}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                        >
                          <X className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    {/* Chat messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col max-h-[280px] min-h-[120px]">
                      {/* Welcome message */}
                      <div className="flex items-start gap-2">
                        {selectedAvatar ? (
                          <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                            {contactName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="rounded-2xl px-4 py-2.5 text-white text-sm" style={{ backgroundColor: actualHexColor }}>
                          {t.welcomeMessage}
                        </div>
                      </div>
                      {/* Chat messages */}
                      {chatMessages.map((msg, index) => (
                        msg.sender === "user" ? (
                          <div key={index} className="flex justify-end mt-3">
                            <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-white text-sm" style={{ backgroundColor: actualHexColor }}>
                              {msg.text}
                            </div>
                          </div>
                        ) : (
                          <div key={index} className="flex items-start gap-2 mt-3">
                            {selectedAvatar ? (
                              <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                                {contactName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )}
                            <div className="rounded-2xl px-4 py-2.5 text-white text-sm max-w-[70%]" style={{ backgroundColor: actualHexColor }}>
                              {msg.text}
                            </div>
                          </div>
                        )
                      ))}
                      {isBotTyping && (
                        <div className="flex items-start gap-2 mt-3">
                          {selectedAvatar ? (
                            <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                              {contactName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div className="rounded-2xl px-4 py-2.5 text-white" style={{ backgroundColor: actualHexColor }}>
                            <div className="flex gap-1">
                              <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                      <div className="flex-1" />
                    </div>
                    {/* Input area */}
                    <div className="px-4 py-3 border-t border-slate-100">
                      <div 
                        className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition-all duration-200 bg-slate-50"
                        style={chatInputFocused ? { borderColor: actualHexColor, boxShadow: `0 0 0 2px ${actualHexColor}25` } : {}}
                      >
                        <input
                          type="text"
                          placeholder={t.writeMessage}
                          value={chatInputValue}
                          onChange={(e) => setChatInputValue(e.target.value)}
                          onFocus={() => setChatInputFocused(true)}
                          onBlur={() => setChatInputFocused(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && chatInputValue.trim()) {
                              handleSendChatMessage(chatInputValue.trim());
                            }
                          }}
                          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                        />
                        <button
                          onClick={() => isListening ? stopListening() : startListening()}
                          className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                            isListening 
                              ? "text-white animate-pulse" 
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          style={isListening ? { backgroundColor: actualHexColor } : {}}
                        >
                          <Mic className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (chatInputValue.trim()) {
                              handleSendChatMessage(chatInputValue.trim());
                            }
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                            chatInputValue.trim() ? "text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          style={chatInputValue.trim() ? { backgroundColor: actualHexColor } : {}}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {/* Bottom spacing */}
                    <div className="pb-3" />
                  </div>
                </div>
              </>
            ) : (
              /* Expanded: show bottom bar */
              <>
                {/* Full-width horizontal glow behind the bar */}
                <div className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0) 100%)' }} />
                <div
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[540px] px-4 ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`}
                >
                  {/* Social proof tooltip */}
                  <SocialProofTooltip />
                  {/* FAQ pills */}
                  {showFaqPills && faqItems.filter(f => f.question.trim()).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {faqItems.filter(f => f.question.trim()).map((faq, index) => (
                        <div
                          key={faq.id}
                          className="inline-flex rounded-full bg-white px-4 py-2 shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 hover:shadow-lg transition-all duration-200"
                          style={{ 
                            animation: `fadeInUp 0.4s ease-out ${index * 150}ms forwards`,
                            opacity: 0,
                          }}
                          onClick={() => {
                            setShowFaqPills(false);
                            setIsBottomBarExpanded(true);
                            handleSendChatMessage(faq.question);
                          }}
                        >
                          <span className="text-sm font-medium text-slate-600">{faq.question}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-3 rounded-full bg-white px-5 py-3.5 shadow-lg"
                    style={{ cursor: 'pointer', border: `1px solid ${actualHexColor}` }}
                    onClick={() => setIsBottomBarExpanded(true)}
                  >
                    <input
                      type="text"
                      readOnly
                      placeholder={sayHello || "Ask me anything..."}
                      className="flex-1 text-base text-slate-400 bg-transparent border-none outline-none cursor-pointer truncate"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsBottomBarExpanded(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4 text-slate-400" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCollapse(); }}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )
          )}

          {/* Popup widget type */}
          {widgetType === "popup" && (
          <div 
            className={`absolute z-20 transition-all duration-300 ${
              devicePreview === "mobile" 
                ? `w-[350px] scale-[0.65] ${widgetPosition === 'left' ? 'origin-bottom-left' : 'origin-bottom-right'}` 
                : `w-[350px] bottom-5 ${widgetPosition === 'left' ? 'left-5' : 'right-5'}`
            }`}
            style={devicePreview === "mobile" ? {
              bottom: 'calc(50% - 250px)',
              [widgetPosition === 'left' ? 'left' : 'right']: 'calc(50% - 130px)'
            } : undefined}
          >
            {/* Google Reviews notification card - always visible */}
            {googleBusiness && !googleReviewDismissed && (
              <div
                className="mb-3 w-full rounded-2xl bg-white shadow-lg p-4 border border-slate-100 cursor-pointer"
                onClick={() => {
                  const mapsUrl = googleBusiness.url || googleBusiness.website;
                  if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-2xl font-bold text-slate-900">{googleBusiness.rating ?? "–"}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = googleBusiness.rating ?? 0;
                          const full = star <= Math.floor(rating);
                          const half = !full && star === Math.ceil(rating) && rating % 1 >= 0.25;
                          return (
                            <div key={star} className="relative h-5 w-5">
                              {/* Empty star background */}
                              <Star className="absolute inset-0 h-5 w-5 text-slate-300" />
                              {/* Filled portion */}
                              {(full || half) && (
                                <div className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
                                  <Star className="h-5 w-5 text-slate-900 fill-slate-900" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{googleBusiness.name}</p>
                    <p className="text-sm text-slate-500">
                      Check <span className="font-bold text-slate-900">{googleBusiness.user_ratings_total ?? 0}</span> reviews on{" "}
                      <span className="text-[#4285F4]">G</span>
                      <span className="text-[#EA4335]">o</span>
                      <span className="text-[#FBBC05]">o</span>
                      <span className="text-[#4285F4]">g</span>
                      <span className="text-[#34A853]">l</span>
                      <span className="text-[#EA4335]">e</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGoogleReviewDismissed(true);
                      handleExpand();
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {isCollapsed && !isAnimatingCollapse ? (/* Collapsed Icon */
          <div
            className={`flex flex-col ${widgetPosition === 'left' ? 'items-start' : 'items-end'}`}
            onMouseEnter={() => setShowFaqPills(true)}
          >
                {/* FAQ pills on hover */}
                {showFaqPills && faqItems.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {faqItems.map((faq, index) => (
                      <div
                        key={faq.id}
                        className="inline-flex self-start rounded-full bg-white px-5 py-2.5 shadow-md border border-slate-100 cursor-pointer hover:bg-slate-100 hover:shadow-lg transition-all duration-200 opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
                        onClick={() => {
                          setShowFaqPills(false);
                          handleExpand();
                          setShowChat(true);
                          handleSendChatMessage(faq.question);
                        }}
                      >
                        <span className="text-sm font-medium text-slate-700">{faq.question}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!(googleBusiness && !googleReviewDismissed) && (
                  <button 
                    onClick={() => handleExpand()} 
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${buttonClass} shadow-lg transition-colors overflow-hidden ${showButtonPop ? 'animate-button-pop' : ''}`}
                    id="wj-btn"
                    style={buttonStyle}
                    onMouseEnter={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = buttonHoverColor)}
                    onMouseLeave={(e) => useInlineStyles && (e.currentTarget.style.backgroundColor = actualHexColor)}
                  >
                    {buttonLogo ? <img src={buttonLogo} alt="Widget logo" className="h-full w-full object-cover" /> : <HelpCircle className="h-7 w-7 text-white" />}
                  </button>
                )}
              </div>) : showChat ? (/* Chat View */
          <div className={`flex h-[540px] max-h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl shadow-2xl ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`} style={{ backgroundColor: isLight ? '#ffffff' : '#000000', color: isLight ? '#0f172a' : '#ffffff' }}>
                {/* Chat header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? "border-slate-200" : "border-white/10"}`}>
                  <button onClick={() => setShowChat(false)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                        {contactName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold leading-tight">{contactName}</span>
                      <span className={`text-xs leading-tight ${isLight ? "text-slate-500" : "text-white/50"}`}>{t.contactUs || "The team can also help"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={chatMenuRef}>
                      <button onClick={() => setShowChatMenu(prev => !prev)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {showChatMenu && (
                        <div className={`absolute right-0 top-10 z-50 w-44 rounded-xl shadow-lg border ${isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-white/10"}`}>
                          <button
                            onClick={handleClearChat}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap ${isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-white/10 text-white"} rounded-t-xl`}
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
                            Clear chat
                          </button>
                          <button
                            onClick={handleDownloadTranscript}
                            disabled={chatMessages.length === 0}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap ${isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-white/10 text-white"} rounded-b-xl disabled:opacity-40`}
                          >
                            <Download className="h-4 w-4 shrink-0" />
                            Download transcript
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleCollapse()} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
                  {/* Welcome message */}
                    <div className="flex items-start gap-2">
                    {selectedAvatar ? (
                      <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                        {contactName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-white ${useInlineStyles ? "" : colors.button}`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}>
                      <p className="text-sm">{t.welcomeMessage}</p>
                    </div>
                  </div>
                  {/* User messages */}
                  {chatMessages.map((msg, index) => (
                    msg.sender === "user" ? (
                      <div key={index} className="flex justify-end mt-3">
                        <div 
                          className={`rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] ${useInlineStyles ? "" : colors.button} text-white`}
                          style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="flex items-start gap-2 mt-3">
                        {selectedAvatar ? (
                          <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                            {contactName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-3 text-white max-w-[80%] ${useInlineStyles ? "" : colors.button}`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    )
                  ))}
                  {isBotTyping && (
                    <div className="flex items-start gap-2 mt-3">
                      {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Avatar" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                          {contactName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-3 text-white ${useInlineStyles ? "" : colors.button}`} style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}>
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                  <div className="flex-1" />
                </div>

                {/* Chat input */}
                <div className="relative px-4 py-2">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className={`absolute bottom-full left-4 right-4 mb-2 p-3 rounded-xl shadow-lg ${isLight ? "bg-white border border-slate-200" : "bg-neutral-900 border border-white/10"}`}>
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
                  <div 
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-200 ${isLight ? "bg-white border-slate-200" : "bg-neutral-900 border-white/15"}`}
                    style={chatInputFocused ? { borderColor: actualHexColor, boxShadow: `0 0 0 2px ${actualHexColor}25` } : {}}
                  >
                    <input 
                      type="text" 
                      placeholder={t.writeMessage} 
                      value={chatInputValue}
                      onChange={(e) => setChatInputValue(e.target.value)}
                      onFocus={() => setChatInputFocused(true)}
                      onBlur={() => setChatInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInputValue.trim()) {
                          handleSendChatMessage(chatInputValue.trim());
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
                      onClick={() => isListening ? stopListening() : startListening()}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                        isListening 
                          ? "text-white animate-pulse" 
                          : isLight 
                            ? "text-slate-400 hover:text-slate-600" 
                            : "text-white/40 hover:text-white/70"
                      }`}
                      style={isListening ? { backgroundColor: actualHexColor } : {}}
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (chatInputValue.trim()) {
                          handleSendChatMessage(chatInputValue.trim());
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
                {showBranding && (
                <div className={`py-2 text-center`}>
                  <span className={`text-xs ${isLight ? "text-slate-500" : "text-white/50"}`}>
                     Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
                )}
              </div>) : showContactPage ? (/* Contact Page View */
          <div className={`flex flex-col h-[560px] max-h-[calc(100vh-12rem)] overflow-hidden rounded-2xl shadow-2xl ${widgetText}`} style={{ backgroundColor: isLight ? '#ffffff' : '#000000' }}>
                {/* Contact page header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => setShowContactPage(false)} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleCollapse()} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact page content */}
                <div className="flex-1 overflow-y-auto px-6">
                  <h3 className={`text-2xl font-bold mb-6 ${isLight ? "text-slate-900" : "text-white"}`}>{t.contact || "Contact us"}</h3>
                  
                  {(reportBugsEnabled || shareFeedbackEnabled) && (
                    <p className={`text-sm mb-4 ${isLight ? "text-slate-400" : "text-white/40"}`}>Email</p>
                  )}

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
                      onClick={() => { setShowShareFeedback(true); setShowContactPage(false); }}
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

                {showBranding && (
                <div className={`py-2 text-center shrink-0`}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                     Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
                )}
              </div>) : showShareFeedback ? (/* Share Feedback Form View */
          <div className={`flex flex-col h-[560px] max-h-[calc(100vh-12rem)] overflow-hidden rounded-2xl shadow-2xl ${widgetText} ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`} style={{ backgroundColor: isLight ? '#f8f8f8' : '#000' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  {feedbackStep !== 3 ? (
                    <button onClick={() => { 
                      if (feedbackStep === 2) { setFeedbackStep(1); } 
                      else { setShowShareFeedback(false); setShowContactPage(true); setFeedbackStep(1); }
                    }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : <div />}
                  <button onClick={() => { setShowShareFeedback(false); setFeedbackStep(1); handleCollapse(); }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {feedbackStep === 3 ? (
                  <div className="flex-1 flex flex-col items-center justify-center px-5">
                    <div className="flex items-center justify-center mb-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white z-10">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover -ml-3 border-2 border-white" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white -ml-3 border-2 border-white">
                          {contactName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                      Feedback sent!
                    </h3>

                    <p className={`text-sm text-center leading-relaxed mb-2 ${isLight ? "text-slate-600" : "text-white/70"}`}>
                      Thank you for your feedback!<br />
                      We will send you a response to:
                    </p>

                    <p className="text-sm font-medium text-blue-600">
                      {feedbackEmail || "your@email.com"}
                    </p>

                    <div className="mt-auto pb-6">
                      <button
                        onClick={() => {
                          setShowShareFeedback(false);
                          setShowContactPage(false);
                          setFeedbackStep(1);
                          setFeedbackRating(null);
                          setFeedbackDetails("");
                          setFeedbackName("");
                          setFeedbackEmail("");
                        }}
                        className={`rounded-xl px-10 py-3 text-sm font-medium text-white transition-colors ${useInlineStyles ? "" : "bg-blue-600 hover:bg-blue-700"}`}
                        style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                <>
                <div className="flex-1 overflow-y-auto px-5">
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-4">
...
                  </div>

                  {feedbackStep === 1 ? (
                    <>
                      <h3 className={`text-sm font-bold mb-3 leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        How would you rate us?
                      </h3>

                      <div className="mb-3">
                        <label className={`text-xs mb-2 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          Pick a rate <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center justify-between mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => { setFeedbackRating(star); setFeedbackRatingError(false); }}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <svg viewBox="0 0 24 24" className={`h-10 w-10 transition-colors ${
                                feedbackRating && star <= feedbackRating 
                                  ? "text-emerald-600 fill-emerald-600" 
                                  : feedbackRatingError
                                    ? "text-red-400"
                                    : isLight ? "text-emerald-700" : "text-emerald-600"
                              }`} fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-xs ${isLight ? "text-slate-400" : "text-white/40"}`}>Poor</span>
                          <span className={`text-xs ${isLight ? "text-slate-400" : "text-white/40"}`}>Excellent</span>
                        </div>
                        {feedbackRatingError && (
                          <p className="text-red-500 text-xs mt-1">Please select a rating.</p>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          Tell us more
                        </label>
                        <textarea
                          value={feedbackDetails}
                          onChange={(e) => setFeedbackDetails(e.target.value)}
                          className={`w-full min-h-[70px] rounded-xl border p-2.5 text-xs resize-none focus:outline-none ${
                            isLight 
                              ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400" 
                              : "border-slate-600 bg-slate-800 text-white placeholder:text-white/40 focus:border-slate-500"
                          }`}
                          placeholder=""
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className={`text-sm font-bold mb-4 leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        We will get back to you on provided email.
                      </h3>

                      <div className="mb-3">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          What's your name?
                        </label>
                        <input
                          type="text"
                          value={feedbackName}
                          onChange={(e) => setFeedbackName(e.target.value)}
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
                          value={feedbackEmail}
                          onChange={(e) => setFeedbackEmail(e.target.value)}
                          className={`w-full rounded-xl p-2.5 text-xs focus:outline-none ${
                            isLight 
                              ? "bg-white border border-slate-200 text-slate-900 focus:border-slate-400" 
                              : "bg-slate-800 border border-slate-600 text-white focus:border-slate-500"
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <button 
                          onClick={() => setFeedbackStep(1)}
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
                          onClick={() => setFeedbackStep(3)}
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

                {/* Fixed Next button for step 1 */}
                {feedbackStep === 1 && (
                  <div className="shrink-0 px-5 pb-2 pt-1">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => { 
                          if (!feedbackRating) { setFeedbackRatingError(true); return; } 
                          setFeedbackStep(2); 
                        }}
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
                  </div>
                )}
                </>
                )}
                {/* Footer nav */}
                <div className={`px-4 pb-1 pt-3 shrink-0`}>
                  <div className={`flex rounded-2xl backdrop-blur-md ${isLight ? "bg-white/70 shadow-sm" : "bg-slate-700/70"}`}>
                    <button 
                      className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-400 hover:text-slate-600" : `${widgetSubtext} hover:opacity-80`}`}
                      onClick={() => { setShowShareFeedback(false); setShowContactPage(false); }}
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-xs">{t.home}</span>
                    </button>
                    <button 
                      className={`flex flex-1 flex-col items-center gap-1 py-3 ${isLight ? "text-slate-900" : widgetText}`}
                      onClick={() => { setShowShareFeedback(false); setShowContactPage(true); }}
                    >
                      <MessageCircle className="h-5 w-5" fill={isLight ? "currentColor" : "none"} />
                      <span className="text-xs">{t.contact}</span>
                    </button>
                  </div>
                </div>

                {showBranding && (
                <div className={`py-2 text-center shrink-0`}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                     Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
                )}
              </div>) : showReportBug ? (/* Report Bug Form View */
          <div className={`flex flex-col h-[560px] max-h-[calc(100vh-12rem)] overflow-hidden rounded-2xl shadow-2xl ${widgetText} ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`} style={{ backgroundColor: isLight ? '#f8f8f8' : '#000' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  {reportBugStep !== 3 ? (
                    <button onClick={() => { 
                      if (reportBugStep === 2) { setReportBugStep(1); } 
                      else { setShowReportBug(false); setShowContactPage(true); setReportBugStep(1); }
                    }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : <div />}
                  <button onClick={() => { setShowReportBug(false); setReportBugStep(1); handleCollapse(); }} className={`flex h-8 w-8 items-center justify-center rounded-full ${widgetButtonBg}`}>
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {reportBugStep === 3 ? (
                  <div className="flex-1 flex flex-col items-center justify-center px-5">
                    <div className="flex items-center justify-center mb-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white z-10">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Avatar" className="h-12 w-12 rounded-full object-cover -ml-3 border-2 border-white" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white -ml-3 border-2 border-white">
                          {contactName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold mb-3 ${isLight ? "text-slate-900" : "text-white"}`}>
                      Message sent!
                    </h3>

                    <p className={`text-sm text-center leading-relaxed mb-2 ${isLight ? "text-slate-600" : "text-white/70"}`}>
                      We typically respond within a few <span className="font-bold">minutes</span>.<br />
                      Stay tuned, we will send you a response to:
                    </p>

                    <p className="text-sm font-medium text-blue-600">
                      {reportBugEmail || "your@email.com"}
                    </p>

                    <div className="mt-auto pb-6">
                      <button
                        onClick={() => {
                          setShowReportBug(false);
                          setShowContactPage(false);
                          setReportBugStep(1);
                          setReportBugDetails("");
                          setReportBugName("");
                          setReportBugEmail("");
                          setReportBugFiles([]);
                        }}
                        className={`rounded-xl px-10 py-3 text-sm font-medium text-white transition-colors ${useInlineStyles ? "" : "bg-blue-600 hover:bg-blue-700"}`}
                        style={useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
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
                      <h3 className={`text-sm font-bold mb-3 leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        Describe the problem you have encountered. Please be as specific as possible.
                      </h3>

                      <div className="mb-3">
                        <label className={`text-xs mb-1.5 block ${isLight ? "text-slate-700" : "text-white/70"}`}>
                          Share details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reportBugDetails}
                          onChange={(e) => { setReportBugDetails(e.target.value); setReportBugDetailsError(false); }}
                          className={`w-full min-h-[100px] rounded-xl border-2 border-dashed p-2.5 text-xs resize-none focus:outline-none ${
                            reportBugDetailsError
                              ? "border-red-500"
                              : isLight 
                                ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400" 
                                : "border-slate-600 bg-slate-800 text-white placeholder:text-white/40 focus:border-slate-500"
                          } ${!reportBugDetailsError && isLight ? "bg-white text-slate-900" : ""} ${!reportBugDetailsError && !isLight ? "bg-slate-800 text-white" : ""}`}
                          placeholder=""
                        />
                        {reportBugDetailsError && (
                          <p className="text-red-500 text-xs mt-1">This field cannot be empty.</p>
                        )}
                      </div>
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
                          onClick={() => { if (!reportBugDetails.trim()) { setReportBugDetailsError(true); return; } setReportBugStep(2); }}
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
                          onClick={handleSendBugReport}
                          disabled={isSendingBugReport}
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
                )}

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

                {showBranding && (
                <div className={`py-2 text-center shrink-0`}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                     Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
                )}
              </div>) : (/* Home View */
          <div id="wj-pop" className={`flex flex-col h-[560px] max-h-[calc(100vh-12rem)] overflow-hidden rounded-2xl shadow-2xl ${isSolidMode ? "bg-slate-800" : widgetBg} ${widgetText} ${isAnimatingCollapse ? 'animate-widget-collapse' : ''} ${isAnimatingExpand ? 'animate-widget-expand' : ''}`} style={!isSolidMode && backgroundType !== "image" ? customGradientStyle : {}}>
                {/* Scrollable content area */}
                <div className={`flex-1 overflow-y-auto relative ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                {/* Background image for image mode */}
                {backgroundType === "image" && backgroundImage && (
                  <div className="absolute inset-x-0 top-0 h-64 z-0">
                    <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0" style={{ background: isLight ? 'linear-gradient(180deg, transparent 40%, #f8f8f8 100%)' : 'linear-gradient(180deg, transparent 40%, black 100%)' }} />
                  </div>
                )}
                {/* Gradient overlay for the top area */}
                {!isSolidMode && backgroundType === "gradient" && (
                  <div 
                    className="pointer-events-none absolute inset-x-0 top-0 h-64 z-0"
                    style={{ 
                      background: isLight
                        ? `linear-gradient(180deg, ${actualHexColor}70 0%, ${actualHexColor}38 45%, transparent 100%)`
                        : `linear-gradient(180deg, ${actualHexColor}88 0%, ${actualHexColor}44 45%, transparent 100%)` 
                    }}
                  />
                )}
                {/* Main content area - colored for solid mode (header + contact + extra space) */}
                <div 
                  className={`relative z-[1] ${isSolidMode ? `${useInlineStyles ? "" : colors.solidHeader} ${headerText} pb-12` : ""}`}
                  style={isSolidMode && useInlineStyles ? { backgroundColor: actualHexColor } : {}}
                >
                {/* Widget header */}
                  <div id="wj-head" className="relative overflow-hidden px-6 py-5">
                    {!isSolidMode && backgroundType !== "image" && (
                      <div 
                        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
                        style={{ background: `radial-gradient(circle, ${actualHexColor}${isLight ? '45' : '50'}, ${actualHexColor}${isLight ? '18' : '10'})` }}
                      />
                    )}
                    <button onClick={() => handleCollapse()} className={`absolute right-4 top-4 ${isSolidMode ? "text-current opacity-70" : widgetSubtext} hover:opacity-80`}>
                      <Minus className="h-4 w-4" />
                    </button>
                    {logo && (
                      <img src={logo} alt="Logo" className="relative h-8 w-auto object-contain mb-3" />
                    )}
                    <h3 id="wj-hello" className="relative text-2xl font-bold whitespace-pre-line max-w-[70%] break-words">
                      {sayHello}
                    </h3>
                  </div>

                  {/* Contact section */}
                  <div id="wj-contact" className={`mx-4 rounded-xl p-4 ${isSolidMode ? "bg-slate-800/90" : widgetCardBg}`}>
                    <div className="flex items-center gap-3">
                      {selectedAvatar ? <img src={selectedAvatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                          {contactName?.charAt(0)?.toUpperCase() || "?"}
                        </div>}
                    <div className="flex-1">
                      <p id="wj-cname" className={`text-xs ${isSolidMode ? "text-white/60" : widgetSubtext}`}>{contactName}</p>
                      <p id="wj-chelp" className={`text-sm ${isSolidMode ? "text-white" : ""}`}>{offerHelp}</p>
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
                {faqEnabled && faqItems.length > 0 && <div id="wj-faq" className={`relative ${productCards.filter(c => !c.isLoading).length === 0 ? "mt-4" : ""}`}>
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
                              {expandedFaqId === faq.id && (
                                <div className={`px-3 pb-3 pt-1 text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
                                  {faq.answer?.trim()
                                    ? faq.answer
                                    : faqAiLoading === faq.id
                                      ? (
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: actualHexColor, animationDelay: '0ms' }} />
                                            <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: actualHexColor, animationDelay: '150ms' }} />
                                            <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: actualHexColor, animationDelay: '300ms' }} />
                                          </div>
                                        </div>
                                      )
                                      : faqAiAnswers[faq.id]
                                        ? <span className="italic">{faqAiAnswers[faq.id]}</span>
                                        : <span className="italic opacity-50">No answer set</span>
                                  }
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

                {/* Google Reviews inline section */}
                {googleBusiness && (
                  <div className={`px-4 pb-4 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                    <div
                      className={`rounded-2xl p-4 cursor-pointer transition-colors ${isLight ? "bg-white hover:bg-slate-50" : "bg-[#252525] hover:bg-[#2a2a2a]"}`}
                      onClick={() => {
                        const mapsUrl = googleBusiness.url || googleBusiness.website;
                        if (mapsUrl) window.open(mapsUrl, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{googleBusiness.rating ?? "–"}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = googleBusiness.rating ?? 0;
                            const full = star <= Math.floor(rating);
                            const half = !full && star === Math.ceil(rating) && rating % 1 >= 0.25;
                            return (
                              <div key={star} className="relative h-5 w-5">
                                <Star className={`absolute inset-0 h-5 w-5 ${isLight ? "text-slate-300" : "text-white/20"}`} />
                                {(full || half) && (
                                  <div className="absolute inset-0 overflow-hidden" style={{ width: full ? '100%' : '50%' }}>
                                    <Star className={`h-5 w-5 ${isLight ? "text-slate-900 fill-slate-900" : "text-white fill-white"}`} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className={`text-sm truncate ${isLight ? "text-slate-500" : "text-white/60"}`}>{googleBusiness.name}</p>
                      <p className={`text-sm ${isLight ? "text-slate-500" : "text-white/60"}`}>
                        Check <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{googleBusiness.user_ratings_total ?? 0}</span> reviews on{" "}
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                      </p>
                    </div>
                  </div>
                )}
                </div>

                {/* Footer nav - box with backdrop blur */}
                <div id="wj-footer" className={`px-4 pb-1 pt-3 shrink-0 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
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

                {showBranding && (
                <div className={`py-2 text-center shrink-0 ${isLight ? "" : "bg-black"}`} style={isLight ? { backgroundColor: '#f8f8f8' } : undefined}>
                  <span className={`text-xs ${isLight ? "text-slate-900" : widgetSubtext}`}>
                    Powered by <span className="font-medium">Widjet</span>
                  </span>
                </div>
                )}
              </div>)}
          </div>
          )}
        </div>
      </div>
    </div>;
};
export default WidgetPreviewPanel;