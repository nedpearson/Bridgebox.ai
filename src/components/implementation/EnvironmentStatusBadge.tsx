import { EnvironmentStatus } from '../../lib/db/implementation';

interface EnvironmentStatusBadgeProps {
  status: EnvironmentStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<EnvironmentStatus, { label: string; className: string }> = {
  not_configured: {
    label: 'Not Configured',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  configuring: {
    label: 'Configuring',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  active: {
    label: 'Active',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  error: {
    label: 'Error',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
};

export default function EnvironmentStatusBadge({ status, size = 'md' }: EnvironmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
