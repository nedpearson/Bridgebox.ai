import type { OpportunityType } from "../../lib/db/clientSuccess";

interface OpportunityTypeBadgeProps {
  type: OpportunityType;
}

export default function OpportunityTypeBadge({
  type,
}: OpportunityTypeBadgeProps) {
  const config = {
    upsell_dashboard: {
      label: "Dashboard",
      className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    upsell_mobile: {
      label: "Mobile App",
      className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    },
    upsell_automation: {
      label: "Automation",
      className: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    expansion: {
      label: "Expansion",
      className: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
    renewal: {
      label: "Renewal",
      className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
  };

  const { label, className } = config[type];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
