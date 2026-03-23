import { getSubscriptionStatusInfo } from '../../lib/stripe/customerSync';

interface SubscriptionStatusBadgeProps {
  status: string | null;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export default function SubscriptionStatusBadge({
  status,
  size = 'md',
  showDescription = false,
}: SubscriptionStatusBadgeProps) {
  const info = getSubscriptionStatusInfo(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorClasses = {
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    gray: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
  };

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center font-medium rounded-full border ${
          sizeClasses[size]
        } ${colorClasses[info.color as keyof typeof colorClasses]}`}
      >
        {info.label}
      </span>
      {showDescription && (
        <span className="text-xs text-slate-500 mt-1">{info.description}</span>
      )}
    </div>
  );
}
