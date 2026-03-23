import { TicketCategory } from '../../lib/db/support';

interface TicketCategoryBadgeProps {
  category: TicketCategory;
  size?: 'sm' | 'md';
}

const CATEGORY_CONFIG: Record<TicketCategory, { label: string }> = {
  bug: { label: 'Bug' },
  feature_request: { label: 'Feature Request' },
  dashboard_change: { label: 'Dashboard Change' },
  mobile_app_request: { label: 'Mobile App' },
  integration_issue: { label: 'Integration' },
  billing_issue: { label: 'Billing' },
  general_support: { label: 'General Support' },
};

export default function TicketCategoryBadge({ category, size = 'md' }: TicketCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-800/50 text-slate-300 border border-slate-700 font-medium ${sizeClasses}`}>
      {config.label}
    </span>
  );
}
