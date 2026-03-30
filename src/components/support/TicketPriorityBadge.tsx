import { TicketPriority } from "../../lib/db/support";
import { AlertCircle, TrendingUp, ArrowUp, Zap } from "lucide-react";

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
  size?: "sm" | "md";
}

const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; className: string; icon: any }
> = {
  low: {
    label: "Low",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: TrendingUp,
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    icon: ArrowUp,
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: Zap,
  },
};

export default function TicketPriorityBadge({
  priority,
  size = "md",
}: TicketPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full border font-medium ${config.className} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
}
