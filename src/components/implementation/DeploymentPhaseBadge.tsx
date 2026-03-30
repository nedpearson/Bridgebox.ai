import { DeploymentPhase } from "../../lib/db/implementation";

interface DeploymentPhaseBadgeProps {
  phase: DeploymentPhase;
  size?: "sm" | "md";
}

const PHASE_CONFIG: Record<
  DeploymentPhase,
  { label: string; className: string }
> = {
  setup: {
    label: "Setup",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  integration: {
    label: "Integration",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  testing: {
    label: "Testing",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  staging: {
    label: "Staging",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  production: {
    label: "Production",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  post_launch_support: {
    label: "Post-Launch",
    className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
  },
};

export default function DeploymentPhaseBadge({
  phase,
  size = "md",
}: DeploymentPhaseBadgeProps) {
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
