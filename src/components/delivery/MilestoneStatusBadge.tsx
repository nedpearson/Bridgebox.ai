import { MilestoneStatus } from '../../lib/db/delivery';

interface MilestoneStatusBadgeProps {
  status: MilestoneStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; className: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
};

export default function MilestoneStatusBadge({ status, size = 'md' }: MilestoneStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
