import { Eye, Lock, Globe } from 'lucide-react';
import { VISIBILITY_LABELS, VISIBILITY_COLORS, type DocumentVisibility } from '../../lib/db/knowledge';

interface DocumentVisibilityBadgeProps {
  visibility: DocumentVisibility;
  showIcon?: boolean;
}

export default function DocumentVisibilityBadge({ visibility, showIcon = true }: DocumentVisibilityBadgeProps) {
  const colors = VISIBILITY_COLORS[visibility];
  const label = VISIBILITY_LABELS[visibility];

  const Icon = visibility === 'internal' ? Lock : visibility === 'public' ? Globe : Eye;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
