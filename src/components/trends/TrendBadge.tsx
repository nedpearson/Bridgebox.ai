import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Zap,
  Activity,
} from "lucide-react";
import type { TrendDirection, TrendStrength } from "../../lib/trendDetection";

interface TrendBadgeProps {
  direction: TrendDirection;
  strength?: TrendStrength;
  label?: string;
}

export function TrendBadge({ direction, strength, label }: TrendBadgeProps) {
  const directionConfig = {
    up: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
      icon: TrendingUp,
    },
    down: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      icon: TrendingDown,
    },
    stable: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
      icon: Minus,
    },
  };

  const style = directionConfig[direction];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="w-3 h-3" />
      {label || direction.toUpperCase()}
    </span>
  );
}

interface TrendStrengthBadgeProps {
  strength: TrendStrength;
}

export function TrendStrengthBadge({ strength }: TrendStrengthBadgeProps) {
  const config = {
    weak: {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
      icon: Activity,
      label: "Weak",
    },
    moderate: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      icon: Activity,
      label: "Moderate",
    },
    strong: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
      icon: Zap,
      label: "Strong",
    },
    explosive: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      icon: Flame,
      label: "Explosive",
    },
  };

  const style = config[strength];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="w-3 h-3" />
      {style.label}
    </span>
  );
}

interface HotIndicatorProps {
  isHot?: boolean;
  label?: string;
}

export function HotIndicator({
  isHot = true,
  label = "HOT",
}: HotIndicatorProps) {
  if (!isHot) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
      <Flame className="w-3 h-3" />
      {label}
    </span>
  );
}

interface EmergingBadgeProps {
  isEmerging?: boolean;
}

export function EmergingBadge({ isEmerging = true }: EmergingBadgeProps) {
  if (!isEmerging) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
      <Zap className="w-3 h-3" />
      Emerging
    </span>
  );
}

interface GrowthRateDisplayProps {
  rate: number;
  showSign?: boolean;
}

export function GrowthRateDisplay({
  rate,
  showSign = true,
}: GrowthRateDisplayProps) {
  const isPositive = rate > 0;
  const isNegative = rate < 0;

  const color = isPositive
    ? "text-green-400"
    : isNegative
      ? "text-red-400"
      : "text-slate-400";
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className={`inline-flex items-center gap-1.5 ${color}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {showSign && isPositive && "+"}
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}
