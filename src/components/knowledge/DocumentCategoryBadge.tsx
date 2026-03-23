import { CATEGORY_LABELS, CATEGORY_COLORS, type DocumentCategory } from '../../lib/db/knowledge';

interface DocumentCategoryBadgeProps {
  category: DocumentCategory;
}

export default function DocumentCategoryBadge({ category }: DocumentCategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  );
}
