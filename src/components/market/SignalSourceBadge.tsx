import type { SignalSource } from '../../lib/market/types';

interface SignalSourceBadgeProps {
  source: SignalSource;
  size?: 'sm' | 'md';
}

export function SignalSourceBadge({ source, size = 'md' }: SignalSourceBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  const sourceConfig: Record<SignalSource, { label: string; className: string }> = {
    search_trends: { label: 'Search Trends', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    industry_reports: { label: 'Industry Report', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    internal_data: { label: 'Internal Data', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    market_research: { label: 'Market Research', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    competitor_analysis: { label: 'Competitor', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    customer_feedback: { label: 'Customer', className: 'bg-pink-50 text-pink-700 border-pink-200' },
    business_intelligence: { label: 'Business Intel', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    manual_entry: { label: 'Manual', className: 'bg-slate-50 text-slate-700 border-slate-200' },
  };

  const config = sourceConfig[source];

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${config.className} ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
