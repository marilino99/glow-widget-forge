import { ChevronRight, LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  hasToggle,
  toggleValue,
  onToggle,
  onClick,
  active,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
        active ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {hasToggle && (
          <Switch
            checked={toggleValue}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
};

export default SidebarItem;
