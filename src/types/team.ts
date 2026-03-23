export type UserRole = 'super_admin' | 'internal_staff' | 'client_admin' | 'client_member';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  email: string;
  organization_id: string;
  role: UserRole;
  status: InvitationStatus;
  invited_by: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  organization_id: string;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationWithDetails extends Invitation {
  organization_name?: string;
  invited_by_name?: string;
  invited_by_email?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  internal_staff: 'Internal Staff',
  client_admin: 'Client Admin',
  client_member: 'Client Member',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system access and management',
  internal_staff: 'Bridgebox team member with broad access',
  client_admin: 'Organization administrator',
  client_member: 'Standard organization member',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  internal_staff: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  client_admin: 'bg-green-500/10 text-green-400 border-green-500/30',
  client_member: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export const STATUS_LABELS: Record<InvitationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  expired: 'Expired',
  revoked: 'Revoked',
};

export const STATUS_COLORS: Record<InvitationStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/30',
  expired: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  revoked: 'bg-red-500/10 text-red-400 border-red-500/30',
};
