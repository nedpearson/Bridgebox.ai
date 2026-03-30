import { TrendingUp, TrendingDown, Minus, Zap, Activity } from "lucide-react";
import type { GrowthDirection } from "../../lib/market/types";

interface GrowthDirectionBadgeProps {
  direction: GrowthDirection;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function GrowthDirectionBadge({
  direction,
  size = "md",
  showLabel = true,
}: GrowthDirectionBadgeProps) {
  const iconSize = size === "sm" ? 12 : 16;
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  const config = {
    rising: {
      label: "Rising",
      icon: TrendingUp,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    emerging: {
      label: "Emerging",
      icon: Zap,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    stable: {
      label: "Stable",
      icon: Minus,
      className: "bg-gray-50 text-gray-600 border-gray-200",
    },
    declining: {
      label: "Declining",
      icon: TrendingDown,
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    volatile: {
      label: "Volatile",
      icon: Activity,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
  }[direction];

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
