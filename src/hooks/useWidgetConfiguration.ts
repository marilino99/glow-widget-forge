import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface WidgetConfiguration {
  selectedAvatar: string | null;
  faqEnabled: boolean;
  contactName: string;
  offerHelp: string;
  widgetTheme: "light" | "dark";
  widgetColor: string;
  buttonLogo: string | null;
  backgroundType: "solid" | "gradient" | "image";
  logo: string | null;
  language: string;
  sayHello: string;
  instagramEnabled: boolean;
}

const defaultConfig: WidgetConfiguration = {
  selectedAvatar: null,
  faqEnabled: true,
  contactName: "Support",
  offerHelp: "Write to us",
  widgetTheme: "dark",
  widgetColor: "blue",
  buttonLogo: null,
  backgroundType: "gradient",
  logo: null,
  language: "en",
  sayHello: "Hello, nice to see you here 👋",
  instagramEnabled: false,
};

export const useWidgetConfiguration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<WidgetConfiguration>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load configuration from database
  useEffect(() => {
    const loadConfig = async () => {
      if (!user) {
        setConfig(defaultConfig);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("widget_configurations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const dbData = data as typeof data & { logo?: string; language?: string; say_hello?: string; instagram_enabled?: boolean };
          setConfig({
            selectedAvatar: data.selected_avatar,
            faqEnabled: data.faq_enabled,
            contactName: data.contact_name,
            offerHelp: data.offer_help,
            widgetTheme: data.widget_theme as "light" | "dark",
            widgetColor: data.widget_color,
            buttonLogo: data.button_logo,
            backgroundType: (data as { background_type?: string }).background_type as "solid" | "gradient" | "image" || "gradient",
            logo: dbData.logo || null,
            language: dbData.language || "en",
            sayHello: dbData.say_hello || defaultConfig.sayHello,
            instagramEnabled: dbData.instagram_enabled ?? false,
          });
        }
      } catch (error) {
        console.error("Error loading widget configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [user]);

  // Save configuration to database
  const saveConfig = useCallback(async (newConfig: Partial<WidgetConfiguration>) => {
    if (!user) return;

    setIsSaving(true);
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from("widget_configurations") as any)
        .upsert({
          user_id: user.id,
          selected_avatar: updatedConfig.selectedAvatar,
          faq_enabled: updatedConfig.faqEnabled,
          contact_name: updatedConfig.contactName,
          offer_help: updatedConfig.offerHelp,
          widget_theme: updatedConfig.widgetTheme,
          widget_color: updatedConfig.widgetColor,
          button_logo: updatedConfig.buttonLogo,
          background_type: updatedConfig.backgroundType,
          logo: updatedConfig.logo,
          language: updatedConfig.language,
          say_hello: updatedConfig.sayHello,
          instagram_enabled: updatedConfig.instagramEnabled,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Error saving widget configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, config, toast]);

  // Update local state without saving (for live preview)
  const updateConfig = useCallback((newConfig: Partial<WidgetConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    config,
    isLoading,
    isSaving,
    saveConfig,
    updateConfig,
  };
};
