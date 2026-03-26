import { supabase } from '../supabase';
import { auditService } from './audit';

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
  website?: string;
  industry?: string;
  size?: string;
  created_at: string;
  projectCount?: number;
  activeProjectCount?: number;
}

export const organizationsService = {
  async getMyOrganizations() {
    const { data, error } = await supabase
      .from('bb_organizations')
      .select('*, bb_organization_memberships!inner(role)')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getAllClientOrganizations() {
    const { data, error } = await supabase
      .from('bb_organizations')
      .select('*, bb_organization_memberships(count)')
      .eq('type', 'client')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getOrganizationById(id: string) {
    const { data, error } = await supabase
      .from('bb_organizations')
      .select('*, bb_organization_memberships(user_id, role, bb_profiles(full_name, email))')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getOrganizationWithStats(id: string) {
    const org = await this.getOrganizationById(id);
    if (!org) return null;

    const { data: projects } = await supabase
      .from('bb_projects')
      .select('id, status')
      .eq('organization_id', id);

    const projectCount = projects?.length || 0;
    const activeProjectCount = projects?.filter(p =>
      ['planning', 'in_progress', 'testing'].includes(p.status)
    ).length || 0;

    return {
      ...org,
      projectCount,
      activeProjectCount,
    };
  },

  async getOrganizationMembers(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_organization_memberships')
      .select('*, bb_profiles(id, email, full_name, avatar_url, role)')
      .eq('organization_id', organizationId)
      .order('created_at');

    if (error) throw error;
    return data;
  },

  async searchOrganizations(query: string) {
    const { data, error } = await supabase
      .from('bb_organizations')
      .select('*')
      .eq('type', 'client')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;
    return data;
  },

  async createOrganization(orgData: {
    name: string;
    type?: 'internal' | 'client';
    website?: string;
    industry?: string;
    size?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: org, error: orgError } = await supabase
      .from('bb_organizations')
      .insert({
        name: orgData.name,
        type: orgData.type || 'client',
        website: orgData.website || null,
        industry: orgData.industry || null,
        size: orgData.size || null,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    const { error: membershipError } = await supabase
      .from('bb_organization_memberships')
      .insert({
        organization_id: org.id,
        user_id: user.user.id,
        role: 'client_admin',
      });

    if (membershipError) throw membershipError;

    try {
      await auditService.logEvent({
        organizationId: org.id,
        actionType: 'create',
        resourceType: 'organization',
        resourceId: org.id,
        deltaJson: orgData
      });

      // Phase 8: Super Admin Webhook Replacement (Internal Matrix)
      await supabase.from('bb_internal_dev_tasks').insert([{
        title: `[Activation] New Bare-Metal Client: ${org.name}`,
        description: `Organization ID: ${org.id}\nSource: Manual Bypass Generator`,
        status: 'todo',
        priority: 'medium',
        category: 'feature',
        labels: ['new_client_activation']
      }]);
    } catch (e) {
      console.warn('Audit trail or notification failed but mutation succeeded', e);
    }

    return org;
  },

  async updateOrganization(id: string, updates: {
    name?: string;
    website?: string;
    industry?: string;
    size?: string;
    logo_url?: string;
  }) {
    const { data, error } = await supabase
      .from('bb_organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    try {
      await auditService.logEvent({
        organizationId: id,
        actionType: 'update',
        resourceType: 'organization',
        resourceId: id,
        deltaJson: updates
      });
    } catch (e) {
      console.warn('Audit trail failed but mutation succeeded', e);
    }

    return data;
  },
};
