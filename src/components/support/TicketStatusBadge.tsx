import { TicketStatus } from '../../lib/db/support';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  open: {
    label: 'Open',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  in_review: {
    label: 'In Review',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  waiting_on_client: {
    label: 'Waiting on Client',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  closed: {
    label: 'Closed',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
};

export default function TicketStatusBadge({ status, size = 'md' }: TicketStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
