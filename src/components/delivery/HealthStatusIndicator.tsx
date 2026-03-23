import { HealthStatus } from '../../lib/db/delivery';
import { Circle } from 'lucide-react';

interface HealthStatusIndicatorProps {
  status: HealthStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<HealthStatus, { label: string; color: string; bgColor: string }> = {
  green: {
    label: 'Healthy',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
  },
  yellow: {
    label: 'At Risk',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
  },
  red: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500',
  },
};

export default function HealthStatusIndicator({ status, showLabel = true, size = 'md' }: HealthStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className="inline-flex items-center space-x-2">
      <div className="relative">
        <Circle className={`${iconSize} ${config.color} fill-current`} />
        <div className={`absolute inset-0 ${config.bgColor} rounded-full opacity-20 blur-sm`} />
      </div>
      {showLabel && <span className={`${textSize} ${config.color} font-medium`}>{config.label}</span>}
    </div>
  );
}
