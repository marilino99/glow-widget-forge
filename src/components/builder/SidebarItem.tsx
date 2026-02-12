import { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  badge,
  hasToggle,
  toggleValue,
  onToggle,
  onClick,
  active,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50 ${
        active ? "text-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{label}</span>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {badge}
          </span>
        )}
      </div>
      {hasToggle && (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </button>
  );
};

export default SidebarItem;
