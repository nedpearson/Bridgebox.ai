import type { Severity } from "../../lib/db/clientSuccess";

interface RiskSeverityBadgeProps {
  severity: Severity;
}

export default function RiskSeverityBadge({
  severity,
}: RiskSeverityBadgeProps) {
  const config = {
    low: {
      label: "Low",
      className: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    },
    medium: {
      label: "Medium",
      className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    },
    high: {
      label: "High",
      className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    },
    critical: {
      label: "Critical",
      className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
  };

  const { label, className } = config[severity];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
