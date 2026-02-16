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
      className={`flex w-full items-center justify-between rounded-xl -ml-2 pl-2 pr-3 py-1.5 text-left transition-all duration-200 hover:bg-[hsl(270_40%_93%)] hover:scale-[1.02] ${
        active ? "text-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-[18px] w-[18px] ${active ? "text-primary" : "text-foreground"}`} />
        <span className={`text-sm ${active ? "text-primary font-medium" : "text-foreground"}`}>{label}</span>
        {badge && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: 'rgba(217, 70, 239, 0.12)', color: '#D946EF' }}>
            {badge}
          </span>
        )}
      </div>
      {hasToggle && (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
        />
      )}
    </button>
  );
};

export default SidebarItem;
