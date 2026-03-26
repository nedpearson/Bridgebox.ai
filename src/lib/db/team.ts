import { supabase } from '../supabase';
import type { Invitation, TeamMember, UserRole, InvitationWithDetails } from '../../types/team';

export const teamService = {
  async getOrganizationMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_organization_memberships')
      .select(`
        id,
        role,
        created_at,
        updated_at,
        organization_id,
        user_id,
        user:bb_profiles!organization_memberships_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        organization:bb_organizations!organization_memberships_organization_id_fkey (
          name
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((membership: any) => ({
      id: membership.user.id,
      email: membership.user.email,
      full_name: membership.user.full_name,
      avatar_url: membership.user.avatar_url,
      role: membership.role,
      organization_id: membership.organization_id,
      organization_name: membership.organization?.name,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
    })) as TeamMember[];
  },

  async getAllMembers() {
    const { data, error } = await supabase
      .from('bb_organization_memberships')
      .select(`
        id,
        role,
        created_at,
        updated_at,
        organization_id,
        user_id,
        user:bb_profiles!organization_memberships_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        organization:bb_organizations!organization_memberships_organization_id_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((membership: any) => ({
      id: membership.user.id,
      email: membership.user.email,
      full_name: membership.user.full_name,
      avatar_url: membership.user.avatar_url,
      role: membership.role,
      organization_id: membership.organization_id,
      organization_name: membership.organization?.name,
      created_at: membership.created_at,
      updated_at: membership.updated_at,
    })) as TeamMember[];
  },

  async updateMemberRole(userId: string, organizationId: string, newRole: UserRole) {
    const { data, error } = await supabase
      .from('bb_organization_memberships')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .select()
      .maybeSingle();

    if (error) throw error;

    await supabase
      .from('bb_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return data;
  },

  async removeMember(userId: string, organizationId: string) {
    const { error } = await supabase
      .from('bb_organization_memberships')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  },

  async createInvitation(email: string, organizationId: string, role: UserRole) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bb_invitations')
      .insert([
        {
          email,
          organization_id: organizationId,
          role,
          invited_by: user?.user?.id,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Invitation;
  },

  async getOrganizationInvitations(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_invitations')
      .select(`
        *,
        organization:bb_organizations!invitations_organization_id_fkey (
          name
        ),
        inviter:bb_profiles!invitations_invited_by_fkey (
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((inv: any) => ({
      ...inv,
      organization_name: inv.organization?.name,
      invited_by_name: inv.inviter?.full_name,
      invited_by_email: inv.inviter?.email,
    })) as InvitationWithDetails[];
  },

  async getAllInvitations() {
    const { data, error } = await supabase
      .from('bb_invitations')
      .select(`
        *,
        organization:bb_organizations!invitations_organization_id_fkey (
          name
        ),
        inviter:bb_profiles!invitations_invited_by_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((inv: any) => ({
      ...inv,
      organization_name: inv.organization?.name,
      invited_by_name: inv.inviter?.full_name,
      invited_by_email: inv.inviter?.email,
    })) as InvitationWithDetails[];
  },

  async resendInvitation(invitationId: string) {
    const { data, error } = await supabase
      .from('bb_invitations')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .eq('status', 'pending')
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Invitation;
  },

  async revokeInvitation(invitationId: string) {
    const { data, error } = await supabase
      .from('bb_invitations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Invitation;
  },

  async getInvitationByToken(token: string) {
    const { data, error } = await supabase
      .from('bb_invitations')
      .select(`
        *,
        organization:bb_organizations!invitations_organization_id_fkey (
          name
        )
      `)
      .eq('token', token)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        organization_name: data.organization?.name,
      } as InvitationWithDetails;
    }

    return null;
  },

  async acceptInvitation(invitationId: string, userId: string) {
    const { data: invitation, error: invError } = await supabase
      .from('bb_invitations')
      .select('*')
      .eq('id', invitationId)
      .maybeSingle();

    if (invError) throw invError;
    if (!invitation) throw new Error('Invitation not found');

    const { error: membershipError } = await supabase
      .from('bb_organization_memberships')
      .insert([
        {
          user_id: userId,
          organization_id: invitation.organization_id,
          role: invitation.role,
        },
      ]);

    if (membershipError) throw membershipError;

    await supabase
      .from('bb_profiles')
      .update({ role: invitation.role })
      .eq('id', userId);

    const { data, error } = await supabase
      .from('bb_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Invitation;
  },

  async getUserPendingInvitations(email: string) {
    const { data, error } = await supabase
      .from('bb_invitations')
      .select(`
        *,
        organization:bb_organizations!invitations_organization_id_fkey (
          name
        )
      `)
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((inv: any) => ({
      ...inv,
      organization_name: inv.organization?.name,
    })) as InvitationWithDetails[];
  },
};
