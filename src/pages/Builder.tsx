import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Boxes, HelpCircle, LogOut } from "lucide-react";
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

const Builder = () => {
  const { user, signOut } = useAuth();
  const [activeWidget, setActiveWidget] = useState<string | null>("product-recommendations");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [faqEnabled, setFaqEnabled] = useState(true);
  const [contactName, setContactName] = useState("ciao");
  const [offerHelp, setOfferHelp] = useState("Write to us");
  const [widgetTheme, setWidgetTheme] = useState<"light" | "dark">("dark");
  const [widgetColor, setWidgetColor] = useState("blue");

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

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
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setSelectedAvatar}
            faqEnabled={faqEnabled}
            onFaqToggle={setFaqEnabled}
            contactName={contactName}
            onContactNameChange={setContactName}
            offerHelp={offerHelp}
            onOfferHelpChange={setOfferHelp}
            widgetTheme={widgetTheme}
            onWidgetThemeChange={setWidgetTheme}
            widgetColor={widgetColor}
            onWidgetColorChange={setWidgetColor}
          />
        </div>

        {/* Right panel - preview */}
        <div className="flex-1">
          <WidgetPreviewPanel 
            selectedAvatar={selectedAvatar} 
            faqEnabled={faqEnabled}
            contactName={contactName}
            offerHelp={offerHelp}
            widgetTheme={widgetTheme}
            widgetColor={widgetColor}
          />
        </div>
      </div>
    </div>
  );
};

export default Builder;
