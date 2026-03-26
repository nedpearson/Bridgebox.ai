// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, MoreVertical, Shield, Trash2, RefreshCw, XCircle } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import InviteMemberModal from '../../components/team/InviteMemberModal';
import UpgradeModal from '../../components/app/UpgradeModal';
import RoleBadge from '../../components/team/RoleBadge';
import InvitationStatusBadge from '../../components/team/InvitationStatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../lib/db/team';
import type { TeamMember, InvitationWithDetails } from '../../types/team';

export default function Team() {
  const { user, currentOrganization, profile, originalProfile, isImpersonating, impersonateUser } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const isInternalStaff = profile?.role === 'super_admin' || profile?.role === 'internal_staff';
  const canManageTeam = isInternalStaff || profile?.role === 'client_admin';

  useEffect(() => {
    loadData();
  }, [currentOrganization, isInternalStaff]);

  const loadData = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const [membersData, invitationsData] = await Promise.all([
        isInternalStaff
          ? teamService.getAllMembers()
          : teamService.getOrganizationMembers(currentOrganization.id),
        isInternalStaff
          ? teamService.getAllInvitations()
          : teamService.getOrganizationInvitations(currentOrganization.id),
      ]);

      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await teamService.resendInvitation(invitationId);
      loadData();
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await teamService.revokeInvitation(invitationId);
      loadData();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentOrganization?.id) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await teamService.removeMember(userId, currentOrganization.id);
      loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleInviteClick = () => {
    // Dynamic Upsell Trigger: Max 5 users on Starter
    const plan = currentOrganization?.billing_plan || 'Starter';
    if (plan === 'Starter' && members.length >= 5 && !isInternalStaff) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsInviteModalOpen(true);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Team Management" subtitle="Manage your team members and invitations" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader
        title="Team Management"
        subtitle="Manage your team members and invitations"
        action={
          canManageTeam ? (
            <Button
              variant="primary"
              onClick={handleInviteClick}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Member
            </Button>
          ) : undefined
        }
      />

      <div className="p-8 space-y-6">
        <div className="flex space-x-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'members'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Members ({members.length})
            {activeTab === 'members' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'invitations'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Invitations ({invitations.filter((i) => i.status === 'pending').length})
            {activeTab === 'invitations' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]"
              />
            )}
          </button>
        </div>

        {activeTab === 'members' && (
          <Card glass className="overflow-hidden">
            {members.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Users}
                  title="No Team Members"
                  description="Invite team members to collaborate on projects"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Member
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Role
                      </th>
                      {isInternalStaff && (
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                          Organization
                        </th>
                      )}
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Joined
                      </th>
                      {canManageTeam && (
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white font-semibold">
                              {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {member.full_name || 'Unnamed User'}
                              </div>
                              <div className="text-slate-400 text-sm">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <RoleBadge role={member.role} size="sm" />
                        </td>
                        {isInternalStaff && (
                          <td className="py-4 px-6">
                            <span className="text-slate-300">{member.organization_name}</span>
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <span className="text-slate-300">
                            {new Date(member.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        {canManageTeam && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {originalProfile?.role === 'super_admin' && member.id !== user?.id && !isImpersonating && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Impersonate ${member.full_name || member.email}?`)) {
                                      impersonateUser(
                                        {
                                          id: member.id,
                                          email: member.email,
                                          full_name: member.full_name,
                                          avatar_url: member.avatar_url,
                                          role: member.role
                                        },
                                        {
                                          id: member.organization_id,
                                          name: member.organization_name || 'Organization',
                                          type: 'client'
                                        }
                                      );
                                      window.location.reload();
                                    }
                                  }}
                                  className="text-[#3B82F6] hover:text-[#2563EB] transition-colors p-1"
                                  title="Impersonate User"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                              )}
                              {member.id !== user?.id && (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Remove Team Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'invitations' && (
          <Card glass className="overflow-hidden">
            {invitations.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Mail}
                  title="No Invitations"
                  description="You haven't sent any invitations yet"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Role
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Status
                      </th>
                      {isInternalStaff && (
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                          Organization
                        </th>
                      )}
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-400">
                        Sent
                      </th>
                      {canManageTeam && (
                        <th className="text-right py-4 px-6 text-sm font-semibold text-slate-400">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => (
                      <motion.tr
                        key={invitation.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="text-white font-medium">{invitation.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <RoleBadge role={invitation.role} size="sm" />
                        </td>
                        <td className="py-4 px-6">
                          <InvitationStatusBadge status={invitation.status} size="sm" />
                        </td>
                        {isInternalStaff && (
                          <td className="py-4 px-6">
                            <span className="text-slate-300">{invitation.organization_name}</span>
                          </td>
                        )}
                        <td className="py-4 px-6">
                          <span className="text-slate-300">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        {canManageTeam && (
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end space-x-2">
                              {invitation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleResendInvitation(invitation.id)}
                                    className="text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                                    title="Resend invitation"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRevokeInvitation(invitation.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Revoke invitation"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={currentOrganization?.id || ''}
        onSuccess={loadData}
        allowedRoles={
          isInternalStaff
            ? ['super_admin', 'internal_staff', 'client_admin', 'client_member']
            : ['client_admin', 'client_member']
        }
      />

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        featureName="Additional Team Seats"
        requiredPlan="Professional"
        modalType="limit"
        actionType="self-serve"
      />
    </>
  );
}
