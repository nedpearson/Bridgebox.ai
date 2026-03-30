import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "../../types/team";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${ROLE_COLORS[role]} ${sizeClasses}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
