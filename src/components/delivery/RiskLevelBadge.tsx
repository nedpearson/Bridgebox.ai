import { RiskLevel } from '../../lib/db/delivery';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskLevelBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

const RISK_CONFIG: Record<RiskLevel, { label: string; className: string; icon?: any }> = {
  none: {
    label: 'No Risk',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  },
  low: {
    label: 'Low Risk',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  medium: {
    label: 'Medium Risk',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    icon: AlertTriangle,
  },
  high: {
    label: 'High Risk',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critical Risk',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
    icon: AlertOctagon,
  },
};

export default function RiskLevelBadge({ level, size = 'md' }: RiskLevelBadgeProps) {
  const config = RISK_CONFIG[level];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      {Icon && <Icon className={iconSize} />}
      <span>{config.label}</span>
    </span>
  );
}
