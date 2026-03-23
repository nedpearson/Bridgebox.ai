import { supabase } from '../supabase';

export type InteractionType = 'call' | 'email' | 'meeting' | 'support' | 'review';
export type OpportunityType = 'upsell_dashboard' | 'upsell_mobile' | 'upsell_automation' | 'expansion' | 'renewal';
export type OpportunityStatus = 'identified' | 'proposed' | 'negotiating' | 'won' | 'lost';
export type RiskType = 'delayed_onboarding' | 'overdue_invoice' | 'high_support_volume' | 'low_engagement' | 'churn_risk';
export type RiskStatus = 'active' | 'monitoring' | 'resolved';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Priority = 'low' | 'medium' | 'high';

export interface ClientHealthScore {
  id: string;
  organization_id: string;
  overall_score: number;
  onboarding_score: number;
  project_score: number;
  support_score: number;
  engagement_score: number;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInteraction {
  id: string;
  organization_id: string;
  interaction_type: InteractionType;
  subject: string;
  notes: string | null;
  conducted_by: string | null;
  outcome: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  interaction_date: string;
  created_at: string;
  updated_at: string;
  conducted_by_profile?: {
    full_name: string;
    email: string;
  };
}

export interface AccountOwner {
  id: string;
  organization_id: string;
  owner_id: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  owner_profile?: {
    full_name: string;
    email: string;
  };
}

export interface SuccessOpportunity {
  id: string;
  organization_id: string;
  opportunity_type: OpportunityType;
  title: string;
  description: string | null;
  estimated_value: number | null;
  priority: Priority;
  status: OpportunityStatus;
  identified_by: string | null;
  identified_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiskFlag {
  id: string;
  organization_id: string;
  risk_type: RiskType;
  severity: Severity;
  description: string;
  status: RiskStatus;
  detected_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_profile?: {
    full_name: string;
    email: string;
  };
}

export interface ClientSuccessOverview {
  organization_id: string;
  organization_name: string;
  health_score: ClientHealthScore | null;
  account_owner: AccountOwner | null;
  active_projects: number;
  open_support_tickets: number;
  last_interaction: ClientInteraction | null;
  active_opportunities: number;
  active_risks: number;
  billing_status: string | null;
  subscription_status: string | null;
}

class ClientSuccessService {
  async getClientHealthScore(organizationId: string): Promise<ClientHealthScore | null> {
    const { data, error } = await supabase
      .from('client_health_scores')
      .select('*')
      .eq('organization_id', organizationId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async calculateAndSaveHealthScore(organizationId: string): Promise<ClientHealthScore> {
    const [onboardingScore, projectScore, supportScore, engagementScore] = await Promise.all([
      this.calculateOnboardingScore(organizationId),
      this.calculateProjectScore(organizationId),
      this.calculateSupportScore(organizationId),
      this.calculateEngagementScore(organizationId),
    ]);

    const overall_score = Math.round(
      (onboardingScore + projectScore + supportScore + engagementScore) / 4
    );

    const { data, error } = await supabase
      .from('client_health_scores')
      .insert({
        organization_id: organizationId,
        overall_score,
        onboarding_score: onboardingScore,
        project_score: projectScore,
        support_score: supportScore,
        engagement_score: engagementScore,
        calculated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async calculateOnboardingScore(organizationId: string): Promise<number> {
    const { data: org } = await supabase
      .from('organizations')
      .select('onboarding_completed, onboarding_completed_at')
      .eq('id', organizationId)
      .single();

    if (org?.onboarding_completed) return 100;
    return 50;
  }

  private async calculateProjectScore(organizationId: string): Promise<number> {
    const { data: projects } = await supabase
      .from('projects')
      .select('status, progress_percentage')
      .eq('organization_id', organizationId);

    if (!projects || projects.length === 0) return 70;

    const avgProgress = projects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / projects.length;
    const onTimeProjects = projects.filter(p =>
      ['completed', 'testing', 'deployed'].includes(p.status)
    ).length;

    return Math.round((avgProgress * 0.6) + ((onTimeProjects / projects.length) * 40));
  }

  private async calculateSupportScore(organizationId: string): Promise<number> {
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('priority, status')
      .eq('organization_id', organizationId)
      .in('status', ['open', 'in_progress']);

    if (!tickets || tickets.length === 0) return 100;

    const urgentCount = tickets.filter(t => t.priority === 'urgent').length;
    const highCount = tickets.filter(t => t.priority === 'high').length;

    if (urgentCount > 2 || highCount > 5) return 40;
    if (urgentCount > 0 || highCount > 2) return 70;
    return 85;
  }

  private async calculateEngagementScore(organizationId: string): Promise<number> {
    const { data: interactions } = await supabase
      .from('client_interactions')
      .select('interaction_date')
      .eq('organization_id', organizationId)
      .gte('interaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('interaction_date', { ascending: false });

    if (!interactions || interactions.length === 0) return 50;
    if (interactions.length >= 4) return 100;
    if (interactions.length >= 2) return 80;
    return 60;
  }

  async getClientInteractions(organizationId: string): Promise<ClientInteraction[]> {
    const { data, error } = await supabase
      .from('client_interactions')
      .select(`
        *,
        conducted_by_profile:profiles!client_interactions_conducted_by_fkey (
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createInteraction(interaction: Omit<ClientInteraction, 'id' | 'created_at' | 'updated_at'>): Promise<ClientInteraction> {
    const { data, error } = await supabase
      .from('client_interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAccountOwner(organizationId: string): Promise<AccountOwner | null> {
    const { data, error } = await supabase
      .from('account_owners')
      .select(`
        *,
        owner_profile:profiles!account_owners_owner_id_fkey (
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async assignAccountOwner(organizationId: string, ownerId: string): Promise<AccountOwner> {
    const { data: existing } = await supabase
      .from('account_owners')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('account_owners')
        .update({ owner_id: ownerId, assigned_at: new Date().toISOString() })
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('account_owners')
      .insert({ organization_id: organizationId, owner_id: ownerId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSuccessOpportunities(organizationId: string): Promise<SuccessOpportunity[]> {
    const { data, error } = await supabase
      .from('success_opportunities')
      .select('*')
      .eq('organization_id', organizationId)
      .order('priority', { ascending: false })
      .order('identified_at', { ascending: false});

    if (error) throw error;
    return data || [];
  }

  async createOpportunity(opportunity: Omit<SuccessOpportunity, 'id' | 'created_at' | 'updated_at'>): Promise<SuccessOpportunity> {
    const { data, error } = await supabase
      .from('success_opportunities')
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOpportunityStatus(opportunityId: string, status: OpportunityStatus): Promise<void> {
    const updates: any = { status };
    if (status === 'won' || status === 'lost') {
      updates.closed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('success_opportunities')
      .update(updates)
      .eq('id', opportunityId);

    if (error) throw error;
  }

  async getRiskFlags(organizationId: string): Promise<RiskFlag[]> {
    const { data, error } = await supabase
      .from('risk_flags')
      .select(`
        *,
        assigned_to_profile:profiles!risk_flags_assigned_to_fkey (
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId)
      .order('severity', { ascending: false })
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createRiskFlag(risk: Omit<RiskFlag, 'id' | 'created_at' | 'updated_at'>): Promise<RiskFlag> {
    const { data, error } = await supabase
      .from('risk_flags')
      .insert(risk)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRiskStatus(riskId: string, status: RiskStatus): Promise<void> {
    const updates: any = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('risk_flags')
      .update(updates)
      .eq('id', riskId);

    if (error) throw error;
  }

  async getClientSuccessOverview(organizationId: string): Promise<ClientSuccessOverview> {
    const [org, healthScore, accountOwner, projects, tickets, interactions, opportunities, risks] = await Promise.all([
      supabase.from('organizations').select('name, billing_plan, subscription_status').eq('id', organizationId).single(),
      this.getClientHealthScore(organizationId),
      this.getAccountOwner(organizationId),
      supabase.from('projects').select('id, status').eq('organization_id', organizationId).in('status', ['in_progress', 'planning', 'testing']),
      supabase.from('support_tickets').select('id').eq('organization_id', organizationId).in('status', ['open', 'in_progress']),
      supabase.from('client_interactions').select('*').eq('organization_id', organizationId).order('interaction_date', { ascending: false }).limit(1),
      supabase.from('success_opportunities').select('id').eq('organization_id', organizationId).not('status', 'in', '(won,lost)'),
      supabase.from('risk_flags').select('id').eq('organization_id', organizationId).not('status', 'eq', 'resolved'),
    ]);

    return {
      organization_id: organizationId,
      organization_name: org.data?.name || 'Unknown',
      health_score: healthScore,
      account_owner: accountOwner,
      active_projects: projects.data?.length || 0,
      open_support_tickets: tickets.data?.length || 0,
      last_interaction: interactions.data?.[0] || null,
      active_opportunities: opportunities.data?.length || 0,
      active_risks: risks.data?.length || 0,
      billing_status: org.data?.billing_plan || null,
      subscription_status: org.data?.subscription_status || null,
    };
  }

  async getAllClientsOverview(): Promise<ClientSuccessOverview[]> {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('type', 'client')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const overviews = await Promise.all(
      (orgs || []).map(org => this.getClientSuccessOverview(org.id))
    );

    return overviews;
  }
}

export const clientSuccessService = new ClientSuccessService();
