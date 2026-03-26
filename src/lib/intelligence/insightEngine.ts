import { supabase } from '../supabase';

export interface Insight {
  id: string;
  organization_id: string;
  category: 'bottleneck' | 'revenue_opportunity' | 'health_warning' | 'optimization';
  title: string;
  description: string;
  impact_score: number;
  metrics: Record<string, any>;
  status: 'active' | 'resolved' | 'ignored';
  created_at: string;
}

export interface Recommendation {
  id: string;
  insight_id: string;
  recommendation_type: string;
  title: string;
  action_payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
}

export const insightEngine = {
  /**
   * Scans for Leads that have been hanging in 'Contacted' or 'Proposal Sent' for over 7 days
   */
  async analyzePipelineBottlenecks(organizationId: string) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: stalledLeads, error } = await supabase
        .from('bb_leads')
        .select('*')
        .eq('organization_id', organizationId)
        .in('status', ['contacted', 'proposal_sent'])
        .lt('updated_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      if (stalledLeads && stalledLeads.length > 0) {
        // Calculate total value at risk
        const valueAtRisk = stalledLeads.reduce((acc, lead) => acc + (lead.estimated_value || 0), 0);

        // Check if an insight already exists to avoid duplication
        const { data: existing } = await supabase
          .from('bb_tenant_insights')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('category', 'revenue_opportunity')
          .eq('status', 'active')
          .ilike('title', '%Pipeline Stagnation%')
          .single();

        if (!existing) {
          // Generate new insight
          const { data: newInsight, error: insightError } = await supabase
            .from('bb_tenant_insights')
            .insert({
              organization_id: organizationId,
              category: 'revenue_opportunity',
              title: 'Pipeline Stagnation Detected',
              description: `You have ${stalledLeads.length} leads sitting idle for over 7 days, putting $${valueAtRisk.toLocaleString()} of potential revenue at risk.`,
              impact_score: Math.min(100, stalledLeads.length * 10), // Arbitrary score calc
              metrics: { stalled_count: stalledLeads.length, value_at_risk: valueAtRisk },
            })
            .select()
            .single();

          if (insightError) throw insightError;

          // Generate actionable recommendation tied to the insight
          if (newInsight) {
            await supabase.from('bb_tenant_recommendations').insert({
              organization_id: organizationId,
              insight_id: newInsight.id,
              recommendation_type: 'bulk_email_followup',
              title: 'Draft Sequence for Stalled Leads',
              action_payload: {
                module: 'crm',
                action: 'draft_bulk_followup',
                target_ids: stalledLeads.map(l => l.id)
              }
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to analyze pipeline bottlenecks:', err);
    }
  },

  /**
   * Identifies automated workflows that have high failure rates
   */
  async analyzeWorkflowHealth(organizationId: string) {
    // Queries telemetry or workflow engine for 'workflow_failed' events
    try {
      const { data: failedEvents, error } = await supabase
        .rpc('get_workflow_failure_rates', { org_id: organizationId }); 
        // Note: assumes a helper RPC or view in production. For now we mock the logic.
      
      // MOCK LOGIC: If a workflow fails > 3 times, flag it.
      // This allows the system to be 'intelligent' about broken automations.
    } catch (err) {
       console.error('Failed to analyze workflow health:', err);
    }
  },

  /**
   * Main cron-like method to execute all analytical sweeps for a tenant.
   * Can be invoked on AppOverview mount, or a scheduled back-end trigger.
   */
  async runPeriodicSweep(organizationId: string) {
    await Promise.allSettled([
      this.analyzePipelineBottlenecks(organizationId),
      // this.analyzeWorkflowHealth(organizationId),
      // this.analyzeUnusedFeatureDropoff(organizationId)
    ]);
  }
};
