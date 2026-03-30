import { DeliveryPhase } from "../../lib/db/delivery";

interface DeliveryPhaseBadgeProps {
  phase: DeliveryPhase;
  size?: "sm" | "md";
}

const PHASE_CONFIG: Record<
  DeliveryPhase,
  { label: string; className: string }
> = {
  discovery: {
    label: "Discovery",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  planning: {
    label: "Planning",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  design: {
    label: "Design",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  },
  build: {
    label: "Build",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  integration: {
    label: "Integration",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  qa: {
    label: "QA",
    className: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
  deployment: {
    label: "Deployment",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  support: {
    label: "Support",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
};

export default function DeliveryPhaseBadge({
  phase,
  size = "md",
}: DeliveryPhaseBadgeProps) {
  const config = PHASE_CONFIG[phase];
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
