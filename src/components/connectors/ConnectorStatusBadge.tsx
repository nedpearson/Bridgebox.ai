import { CheckCircle2, Clock, XCircle, Pause, AlertCircle } from 'lucide-react';
import type { ConnectorStatus } from '../../lib/connectors/types';

interface ConnectorStatusBadgeProps {
  status: ConnectorStatus;
  className?: string;
}

export default function ConnectorStatusBadge({
  status,
  className = '',
}: ConnectorStatusBadgeProps) {
  const config = {
    not_connected: {
      icon: AlertCircle,
      label: 'Not Connected',
      className: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
    },
    connected: {
      icon: CheckCircle2,
      label: 'Connected',
      className: 'bg-green-500/20 border-green-500/30 text-green-300',
    },
    syncing: {
      icon: Clock,
      label: 'Syncing',
      className: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    },
    error: {
      icon: XCircle,
      label: 'Error',
      className: 'bg-red-500/20 border-red-500/30 text-red-300',
    },
    paused: {
      icon: Pause,
      label: 'Paused',
      className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    },
  };

  const { icon: Icon, label, className: statusClass } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full text-xs font-medium ${statusClass} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
