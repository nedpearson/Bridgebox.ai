import type { EnhancementStatus, EnhancementRequestType } from '../../types/enhancement';
import { ENHANCEMENT_STATUS_LABELS, REQUEST_TYPE_LABELS } from '../../types/enhancement';

const STATUS_STYLES: Record<EnhancementStatus, string> = {
  draft:            'bg-slate-700/60 text-slate-300 border-slate-600/50',
  submitted:        'bg-blue-500/15 text-blue-300 border-blue-500/30',
  analyzing:        'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 animate-pulse',
  ready_for_review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  approved:         'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected:         'bg-red-500/15 text-red-300 border-red-500/30',
  ready_to_apply:   'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  applied:          'bg-emerald-600/20 text-emerald-200 border-emerald-500/40',
  failed:           'bg-red-600/20 text-red-200 border-red-500/40',
};

const REQUEST_TYPE_STYLES: Record<EnhancementRequestType, string> = {
  new_feature:           'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  feature_modification:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ui_enhancement:        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  workflow_enhancement:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  integration_enhancement: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  reusable_transplant:   'bg-teal-500/10 text-teal-400 border-teal-500/20',
  workspace_merge:       'bg-violet-500/10 text-violet-400 border-violet-500/20',
  full_software_blueprint: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

interface StatusBadgeWESProps {
  status: EnhancementStatus;
  size?: 'xs' | 'sm';
}

export function StatusBadgeWES({ status, size = 'sm' }: StatusBadgeWESProps) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${STATUS_STYLES[status]}`}>
      {ENHANCEMENT_STATUS_LABELS[status]}
    </span>
  );
}

interface RequestTypeBadgeProps {
  type: EnhancementRequestType;
  size?: 'xs' | 'sm';
}

export function RequestTypeBadge({ type, size = 'sm' }: RequestTypeBadgeProps) {
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${REQUEST_TYPE_STYLES[type]}`}>
      {REQUEST_TYPE_LABELS[type]}
    </span>
  );
}
