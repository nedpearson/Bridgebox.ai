import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import type { OpportunityReason } from "../../lib/opportunities/types";

interface OpportunityReasonTagProps {
  reason: OpportunityReason;
  size?: "sm" | "md";
}

export function OpportunityReasonTag({
  reason,
  size = "md",
}: OpportunityReasonTagProps) {
  const iconSize = size === "sm" ? 12 : 14;
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  const config = {
    strength: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    risk: {
      icon: AlertCircle,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    insight: {
      icon: Lightbulb,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  }[reason.category];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${config.className} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      {reason.message}
    </span>
  );
}
