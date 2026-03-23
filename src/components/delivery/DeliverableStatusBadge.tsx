import { DeliverableStatus } from '../../lib/db/delivery';

interface DeliverableStatusBadgeProps {
  status: DeliverableStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<DeliverableStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  review: {
    label: 'In Review',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
  },
};

export default function DeliverableStatusBadge({ status, size = 'md' }: DeliverableStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
