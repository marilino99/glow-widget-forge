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
} from "lucide-react";
import SidebarItem from "./SidebarItem";

interface BuilderSidebarProps {
  onSelectWidget: (widgetType: string) => void;
  activeWidget: string | null;
}

const BuilderSidebar = ({ onSelectWidget, activeWidget }: BuilderSidebarProps) => {
  const [faqEnabled, setFaqEnabled] = useState(true);
  const [visitorCounterEnabled, setVisitorCounterEnabled] = useState(false);

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
            onClick={() => onSelectWidget("contact-card")}
            active={activeWidget === "contact-card"}
          />
          <SidebarItem
            icon={Phone}
            label="WhatsApp"
            onClick={() => onSelectWidget("whatsapp")}
            active={activeWidget === "whatsapp"}
          />
          <SidebarItem
            icon={MessageCircle}
            label="Messenger"
            onClick={() => onSelectWidget("messenger")}
            active={activeWidget === "messenger"}
          />
          <SidebarItem
            icon={HelpCircle}
            label="FAQ"
            hasToggle
            toggleValue={faqEnabled}
            onToggle={setFaqEnabled}
            onClick={() => onSelectWidget("faq")}
            active={activeWidget === "faq"}
          />
          <SidebarItem
            icon={Link2}
            label="Custom links"
            onClick={() => onSelectWidget("custom-links")}
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
            onClick={() => onSelectWidget("product-carousel")}
            active={activeWidget === "product-carousel"}
          />
          <SidebarItem
            icon={Gift}
            label="Product recommendations"
            onClick={() => onSelectWidget("product-recommendations")}
            active={activeWidget === "product-recommendations"}
          />
        </div>
      </div>

      {/* Build trust section */}
      <div>
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
            onClick={() => onSelectWidget("visitor-counter")}
            active={activeWidget === "visitor-counter"}
          />
          <SidebarItem
            icon={Star}
            label="Google reviews"
            onClick={() => onSelectWidget("google-reviews")}
            active={activeWidget === "google-reviews"}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderSidebar;
