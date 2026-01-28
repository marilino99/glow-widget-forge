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

interface BuilderSidebarProps {
  onSelectWidget: (widgetType: string) => void;
  activeWidget: string | null;
  selectedAvatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
}

const BuilderSidebar = ({ onSelectWidget, activeWidget, selectedAvatar, onSelectAvatar }: BuilderSidebarProps) => {
  const [faqEnabled, setFaqEnabled] = useState(true);
  const [visitorCounterEnabled, setVisitorCounterEnabled] = useState(false);
  const [showContactCardPanel, setShowContactCardPanel] = useState(false);

  const handleSelectWidget = (widgetType: string) => {
    if (widgetType === "contact-card") {
      setShowContactCardPanel(true);
    }
    onSelectWidget(widgetType);
  };

  const handleBackFromContactCard = () => {
    setShowContactCardPanel(false);
    onSelectWidget(null as unknown as string);
  };

  // Show Contact Card detail panel
  if (showContactCardPanel) {
    return (
      <ContactCardPanel
        onBack={handleBackFromContactCard}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={onSelectAvatar}
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
            onToggle={setFaqEnabled}
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
