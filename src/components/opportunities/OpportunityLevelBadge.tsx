import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { OpportunityLevel } from "../../lib/opportunities/types";

interface OpportunityLevelBadgeProps {
  level: OpportunityLevel;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function OpportunityLevelBadge({
  level,
  size = "md",
  showLabel = true,
}: OpportunityLevelBadgeProps) {
  const iconSize = size === "sm" ? 12 : 16;
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  const config = {
    high: {
      label: "High Opportunity",
      icon: TrendingUp,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    medium: {
      label: "Medium Opportunity",
      icon: Minus,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    low: {
      label: "Low Opportunity",
      icon: TrendingDown,
      className: "bg-gray-50 text-gray-600 border-gray-200",
    },
  }[level];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${config.className} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      {showLabel && config.label}
    </span>
  );
}
