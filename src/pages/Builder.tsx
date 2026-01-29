import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWidgetConfiguration } from "@/hooks/useWidgetConfiguration";
import { Button } from "@/components/ui/button";
import { Boxes, HelpCircle, LogOut, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BuilderSidebar from "@/components/builder/BuilderSidebar";
import WidgetPreviewPanel from "@/components/builder/WidgetPreviewPanel";
import AddToWebsiteDialog from "@/components/builder/AddToWebsiteDialog";
import { ProductCardData } from "@/types/productCard";

const Builder = () => {
  const { user, signOut } = useAuth();
  const { config, isLoading, isSaving, saveConfig, updateConfig } = useWidgetConfiguration();
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [productCards, setProductCards] = useState<ProductCardData[]>([]);

  const handleAddProductCard = (card: ProductCardData) => {
    setProductCards(prev => [...prev, card]);
  };

  const handleUpdateProductCard = (cardId: string, updates: Partial<ProductCardData>) => {
    setProductCards(prev => 
      prev.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      )
    );
  };

  const handleDeleteProductCard = (cardId: string) => {
    setProductCards(prev => prev.filter(card => card.id !== cardId));
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  // Show loading state while fetching configuration
  if (isLoading) {
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
    <div className="flex h-screen flex-col bg-background">
      {/* Top navbar - minimal */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-sidebar px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-5 w-5" />
            </div>
          </button>
          <AddToWebsiteDialog />
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - widget content */}
        <div className="w-96 shrink-0 border-r border-border">
          <BuilderSidebar
            onSelectWidget={setActiveWidget}
            activeWidget={activeWidget}
            selectedAvatar={config.selectedAvatar}
            onSelectAvatar={(avatar) => updateConfig({ selectedAvatar: avatar })}
            faqEnabled={config.faqEnabled}
            onFaqToggle={(enabled) => updateConfig({ faqEnabled: enabled })}
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
            onSaveConfig={saveConfig}
            productCards={productCards}
            onAddProductCard={handleAddProductCard}
            onUpdateProductCard={handleUpdateProductCard}
            onDeleteProductCard={handleDeleteProductCard}
            logo={config.logo}
            onLogoChange={(logo) => updateConfig({ logo })}
            language={config.language}
            onLanguageChange={(language) => updateConfig({ language })}
            sayHello={config.sayHello}
            onSayHelloChange={(sayHello) => updateConfig({ sayHello })}
          />
        </div>

        {/* Right panel - preview */}
        <div className="flex-1">
          <WidgetPreviewPanel 
            selectedAvatar={config.selectedAvatar} 
            faqEnabled={config.faqEnabled}
            contactName={config.contactName}
            offerHelp={config.offerHelp}
            widgetTheme={config.widgetTheme}
            widgetColor={config.widgetColor}
            buttonLogo={config.buttonLogo}
            backgroundType={config.backgroundType}
            productCards={productCards}
            sayHello={config.sayHello}
          />
        </div>
      </div>
    </div>
  );
};

export default Builder;
