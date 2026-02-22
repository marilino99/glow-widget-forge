import { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  badge?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  active?: boolean;
  collapsed?: boolean;
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
  collapsed,
}: SidebarItemProps) => {
  const content = (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl -ml-2 pl-2 pr-3 py-1.5 text-left transition-all duration-200 hover:bg-[#f0f0f0] hover:scale-[1.02] ${
        active ? "bg-[#f0f0f0]" : ""
      } ${collapsed ? "!ml-0 !pl-0 justify-center !pr-0" : ""}`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: active ? "#1c1c1d" : "#5b5b65" }} />
        {!collapsed && (
          <>
            <span className={`text-sm ${active ? "font-medium" : ""}`} style={{ color: active ? "#1c1c1d" : "#5b5b65" }}>{label}</span>
            {badge && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: 'rgba(217, 70, 239, 0.12)', color: '#D946EF' }}>
                {badge}
              </span>
            )}
          </>
        )}
      </div>
      {hasToggle && !collapsed && (
        <Switch
          checked={toggleValue}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
        />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export default SidebarItem;
