import { STATUS_LABELS, STATUS_COLORS, type InvitationStatus } from '../../types/team';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  size?: 'sm' | 'md';
}

export default function InvitationStatusBadge({ status, size = 'md' }: InvitationStatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${STATUS_COLORS[status]} ${sizeClasses}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
