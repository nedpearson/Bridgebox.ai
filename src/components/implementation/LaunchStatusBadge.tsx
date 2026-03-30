import { LaunchStatus } from "../../lib/db/implementation";

interface LaunchStatusBadgeProps {
  status: LaunchStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  LaunchStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  ready: {
    label: "Ready",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  deployed: {
    label: "Deployed",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  rolled_back: {
    label: "Rolled Back",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

export default function LaunchStatusBadge({
  status,
  size = "md",
}: LaunchStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
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
