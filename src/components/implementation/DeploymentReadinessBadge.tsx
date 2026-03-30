import { DeploymentReadiness } from "../../lib/db/implementation";

interface DeploymentReadinessBadgeProps {
  readiness: DeploymentReadiness;
  size?: "sm" | "md";
}

const READINESS_CONFIG: Record<
  DeploymentReadiness,
  { label: string; className: string }
> = {
  not_ready: {
    label: "Not Ready",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  ready: {
    label: "Ready",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  deployed: {
    label: "Deployed",
    className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30",
  },
};

export default function DeploymentReadinessBadge({
  readiness,
  size = "md",
}: DeploymentReadinessBadgeProps) {
  const config = READINESS_CONFIG[readiness];
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
