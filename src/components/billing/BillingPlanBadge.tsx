import { getBillingPlanDisplay } from '../../lib/stripe/customerSync';

interface BillingPlanBadgeProps {
  plan: string | null;
  size?: 'sm' | 'md' | 'lg';
  isEnterprise?: boolean;
}

export default function BillingPlanBadge({
  plan,
  size = 'md',
  isEnterprise = false,
}: BillingPlanBadgeProps) {
  const displayName = getBillingPlanDisplay(plan);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorClasses = {
    free: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    starter: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    professional: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500',
    enterprise: 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]',
    custom: 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]',
  };

  const planKey = (plan || 'free').toLowerCase();
  const colorClass =
    colorClasses[planKey as keyof typeof colorClasses] || colorClasses.free;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${colorClass}`}
    >
      {isEnterprise && displayName === 'Free' ? 'Enterprise Client' : displayName}
    </span>
  );
}
