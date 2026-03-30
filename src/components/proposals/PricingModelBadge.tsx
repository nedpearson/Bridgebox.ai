import { PricingModel } from "../../lib/db/proposals";

interface PricingModelBadgeProps {
  model: PricingModel;
  size?: "sm" | "md";
}

const MODEL_CONFIG: Record<PricingModel, { label: string; className: string }> =
  {
    fixed_project: {
      label: "Fixed Project",
      className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    },
    milestone_based: {
      label: "Milestone-Based",
      className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
    },
    monthly_retainer: {
      label: "Monthly Retainer",
      className: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    custom_enterprise: {
      label: "Custom Enterprise",
      className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    },
  };

export default function PricingModelBadge({
  model,
  size = "md",
}: PricingModelBadgeProps) {
  const config = MODEL_CONFIG[model];
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
