import { supabase } from '../supabase';

export type ProposalStatus = 'draft' | 'internal_review' | 'sent' | 'viewed' | 'approved' | 'declined' | 'expired';
export type PricingModel = 'fixed_project' | 'milestone_based' | 'monthly_retainer' | 'custom_enterprise';

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  timeline?: string;
}

export interface Addon {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface Proposal {
  id: string;
  title: string;
  organization_id: string;
  lead_id?: string;
  client_name: string;
  client_email?: string;
  service_types: string[];
  scope_summary?: string;
  deliverables: Deliverable[];
  timeline_estimate?: string;
  pricing_model: PricingModel;
  pricing_amount?: number;
  optional_addons: Addon[];
  internal_notes?: string;
  status: ProposalStatus;
  created_by?: string;
  sent_at?: string;
  viewed_at?: string;
  approved_at?: string;
  declined_at?: string;
  expires_at?: string;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalWithDetails extends Proposal {
  organization?: { id: string; name: string };
  lead?: { id: string; company_name: string; contact_name: string; contact_email?: string };
  creator?: { full_name?: string; email: string };
}

export interface CreateProposalData {
  title: string;
  organization_id: string;
  lead_id?: string;
  client_name: string;
  client_email?: string;
  service_types: string[];
  scope_summary?: string;
  deliverables: Deliverable[];
  timeline_estimate?: string;
  pricing_model: PricingModel;
  pricing_amount?: number;
  optional_addons?: Addon[];
  internal_notes?: string;
  status?: ProposalStatus;
}

export const proposalsService = {
  async getAllProposals() {
    const { data, error } = await supabase
      .from('bb_proposals')
      .select(`
        *,
        organization:organizations!proposals_organization_id_fkey(id, name),
        lead:leads!proposals_lead_id_fkey(id, company_name, contact_name, contact_email),
        creator:profiles!proposals_created_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProposalWithDetails[];
  },

  async getProposalById(id: string) {
    const { data, error } = await supabase
      .from('bb_proposals')
      .select(`
        *,
        organization:organizations!proposals_organization_id_fkey(id, name),
        lead:leads!proposals_lead_id_fkey(id, company_name, contact_name, contact_email),
        creator:profiles!proposals_created_by_fkey(full_name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as ProposalWithDetails | null;
  },

  async getProposalsByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('bb_proposals')
      .select(`
        *,
        organization:organizations!proposals_organization_id_fkey(id, name),
        lead:leads!proposals_lead_id_fkey(id, company_name, contact_name, contact_email),
        creator:profiles!proposals_created_by_fkey(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProposalWithDetails[];
  },

  async createProposal(proposalData: CreateProposalData) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bb_proposals')
      .insert([
        {
          ...proposalData,
          created_by: user?.user?.id,
          status: proposalData.status || 'draft',
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Proposal;
  },

  async updateProposal(id: string, updates: Partial<CreateProposalData>) {
    const { data, error } = await supabase
      .from('bb_proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Proposal;
  },

  async updateProposalStatus(id: string, status: ProposalStatus) {
    const updates: any = { status };

    if (status === 'sent' && !updates.sent_at) {
      updates.sent_at = new Date().toISOString();
      updates.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    }

    if (status === 'declined') {
      updates.declined_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('bb_proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Proposal;
  },

  async duplicateProposal(id: string) {
    const original = await this.getProposalById(id);
    if (!original) throw new Error('Proposal not found');

    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('bb_proposals')
      .insert([
        {
          title: `${original.title} (Copy)`,
          organization_id: original.organization_id,
          lead_id: original.lead_id,
          client_name: original.client_name,
          client_email: original.client_email,
          service_types: original.service_types,
          scope_summary: original.scope_summary,
          deliverables: original.deliverables,
          timeline_estimate: original.timeline_estimate,
          pricing_model: original.pricing_model,
          pricing_amount: original.pricing_amount,
          optional_addons: original.optional_addons,
          internal_notes: original.internal_notes,
          status: 'draft',
          created_by: user?.user?.id,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Proposal;
  },

  async deleteProposal(id: string) {
    const { error } = await supabase
      .from('bb_proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getProposalsByLead(leadId: string) {
    const { data, error } = await supabase
      .from('bb_proposals')
      .select(`
        *,
        organization:organizations!proposals_organization_id_fkey(id, name)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProposalWithDetails[];
  },

  async getProposalByShareToken(token: string) {
    const { data, error } = await supabase
      .from('bb_proposals')
      .select(`
        *,
        organization:organizations!proposals_organization_id_fkey(id, name)
      `)
      .eq('share_token', token)
      .maybeSingle();

    if (error) throw error;

    if (data && !data.viewed_at) {
      await supabase
        .from('bb_proposals')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', data.id);
    }

    return data as ProposalWithDetails | null;
  },
};
