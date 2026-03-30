import { ProposalStatus } from "../../lib/db/proposals";

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  internal_review: {
    label: "Internal Review",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  viewed: {
    label: "Viewed",
    className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  declined: {
    label: "Declined",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  expired: {
    label: "Expired",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
};

export default function ProposalStatusBadge({
  status,
  size = "md",
}: ProposalStatusBadgeProps) {
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
