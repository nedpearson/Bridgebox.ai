import { supabase } from '../../supabase';
import type {
  ActionRecommendation,
  AgentAction,
  ActionCategory,
  ActionType,
  ActionContext,
  ActionReasoning,
  ActionPayload,
  ActionPriority,
} from '../types';

export class ActionRecommender {
  async recommendLeadActions(
    organizationId: string,
    leadId: string
  ): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    const { data: lead } = await supabase
      .from('bb_leads')
      .select('*')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();

    if (!lead) return recommendations;

    if (lead.estimated_value > 50000 && lead.status === 'new') {
      recommendations.push(
        this.createRecommendation({
          organization_id: organizationId,
          category: 'crm',
          action_type: 'flag_high_value_lead',
          title: `High-value lead: ${lead.company_name}`,
          description: `Lead with ${this.formatCurrency(lead.estimated_value)} potential requires priority attention`,
          context: {
            entity_type: 'lead',
            entity_id: leadId,
            entity_name: lead.company_name,
            related_data: { estimated_value: lead.estimated_value },
          },
          reasoning: {
            primary_reason: 'High estimated value exceeds priority threshold',
            supporting_factors: [
              `Estimated value: ${this.formatCurrency(lead.estimated_value)}`,
              'Lead is new and uncontacted',
            ],
            data_points: [`Value: $${lead.estimated_value}`, `Status: ${lead.status}`],
            potential_impact: 'Early engagement could secure high-value project',
          },
          payload: {
            action_type: 'flag_high_value_lead',
            parameters: { lead_id: leadId, flag_type: 'high_value' },
          },
          confidence_score: 90,
          priority: 'high',
          requires_approval: false,
          is_destructive: false,
          status: 'suggested',
          suggested_at: new Date().toISOString(),
        })
      );
    }

    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated >= 3 && lead.status === 'new') {
      recommendations.push(
        this.createRecommendation({
          organization_id: organizationId,
          category: 'crm',
          action_type: 'follow_up_lead',
          title: `Follow up on ${lead.company_name}`,
          description: `Lead received ${daysSinceCreated} days ago needs outreach`,
          context: {
            entity_type: 'lead',
            entity_id: leadId,
            entity_name: lead.company_name,
            related_data: { days_since_created: daysSinceCreated },
          },
          reasoning: {
            primary_reason: 'Lead has not been contacted within response window',
            supporting_factors: [
              `${daysSinceCreated} days since lead creation`,
              'Status still shows as new',
            ],
            data_points: [`Created: ${lead.created_at}`, `Status: ${lead.status}`],
            potential_impact: 'Timely outreach improves conversion probability',
          },
          payload: {
            action_type: 'follow_up_lead',
            parameters: { lead_id: leadId },
            suggested_values: {
              priority: daysSinceCreated > 7 ? 'high' : 'medium',
            },
          },
          confidence_score: 85,
          priority: daysSinceCreated > 7 ? 'high' : 'medium',
          requires_approval: false,
          is_destructive: false,
          status: 'suggested',
          suggested_at: new Date().toISOString(),
        })
      );
    }

    if (lead.services_interested && lead.services_interested.length > 0 && !lead.notes) {
      recommendations.push(
        this.createRecommendation({
          organization_id: organizationId,
          category: 'crm',
          action_type: 'draft_lead_summary',
          title: `Prepare summary for ${lead.company_name}`,
          description: 'Generate initial discovery notes based on lead information',
          context: {
            entity_type: 'lead',
            entity_id: leadId,
            entity_name: lead.company_name,
          },
          reasoning: {
            primary_reason: 'Lead has service interests but no notes',
            supporting_factors: [
              `Interested in: ${lead.services_interested.join(', ')}`,
              'No discovery notes recorded',
            ],
            data_points: [
              `Services: ${lead.services_interested.join(', ')}`,
              'Notes: None',
            ],
            potential_impact: 'Structured notes improve team coordination',
          },
          payload: {
            action_type: 'draft_lead_summary',
            parameters: { lead_id: leadId },
            preview_data: {
              company: lead.company_name,
              services: lead.services_interested,
              value: lead.estimated_value,
            },
          },
          confidence_score: 75,
          priority: 'low',
          requires_approval: true,
          is_destructive: false,
          status: 'suggested',
          suggested_at: new Date().toISOString(),
        })
      );
    }

    return recommendations;
  }

  async recommendProjectActions(
    organizationId: string,
    projectId: string
  ): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    const { data: project } = await supabase
      .from('bb_projects')
      .select('*, deliverables(*)')
      .eq('id', projectId)
      .eq('organization_id', organizationId)
      .single();

    if (!project) return recommendations;

    const overdueMilestones =
      project.deliverables?.filter(
        (d: any) => d.due_date && new Date(d.due_date) < new Date() && d.status !== 'completed'
      ) || [];

    if (overdueMilestones.length > 0) {
      recommendations.push(
        this.createRecommendation({
          organization_id: organizationId,
          category: 'project',
          action_type: 'flag_delivery_risk',
          title: `Delivery risk: ${project.name}`,
          description: `${overdueMilestones.length} overdue ${overdueMilestones.length === 1 ? 'milestone' : 'milestones'} detected`,
          context: {
            entity_type: 'project',
            entity_id: projectId,
            entity_name: project.name,
            related_data: { overdue_count: overdueMilestones.length },
          },
          reasoning: {
            primary_reason: 'Multiple overdue deliverables indicate schedule risk',
            supporting_factors: [
              `${overdueMilestones.length} overdue items`,
              'Client expectations may be at risk',
            ],
            data_points: overdueMilestones.map((m: any) => `${m.name}: ${m.due_date}`),
            potential_impact: 'Early intervention prevents client dissatisfaction',
          },
          payload: {
            action_type: 'flag_delivery_risk',
            parameters: {
              project_id: projectId,
              risk_type: 'schedule',
              severity: overdueMilestones.length > 2 ? 'high' : 'medium',
            },
          },
          confidence_score: 95,
          priority: 'high',
          requires_approval: false,
          is_destructive: false,
          status: 'suggested',
          suggested_at: new Date().toISOString(),
        })
      );
    }

    return recommendations;
  }

  async recommendSupportActions(
    organizationId: string,
    ticketId: string
  ): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    const { data: ticket } = await supabase
      .from('bb_support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('organization_id', organizationId)
      .single();

    if (!ticket) return recommendations;

    const hoursSinceCreated =
      (Date.now() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);

    if (ticket.priority === 'urgent' && hoursSinceCreated > 2 && ticket.status === 'open') {
      recommendations.push(
        this.createRecommendation({
          organization_id: organizationId,
          category: 'support',
          action_type: 'escalate_urgent_issue',
          title: `Escalate urgent ticket: ${ticket.title}`,
          description: `Urgent ticket open for ${Math.floor(hoursSinceCreated)} hours without resolution`,
          context: {
            entity_type: 'ticket',
            entity_id: ticketId,
            entity_name: ticket.title,
            related_data: { hours_open: hoursSinceCreated },
          },
          reasoning: {
            primary_reason: 'Urgent ticket exceeds response SLA',
            supporting_factors: [
              `Open for ${Math.floor(hoursSinceCreated)} hours`,
              'Priority marked as urgent',
              'Status still open',
            ],
            data_points: [
              `Priority: ${ticket.priority}`,
              `Status: ${ticket.status}`,
              `Created: ${ticket.created_at}`,
            ],
            potential_impact: 'Immediate escalation prevents client frustration',
          },
          payload: {
            action_type: 'escalate_urgent_issue',
            parameters: { ticket_id: ticketId, escalation_level: 'manager' },
          },
          confidence_score: 95,
          priority: 'high',
          requires_approval: false,
          is_destructive: false,
          status: 'suggested',
          suggested_at: new Date().toISOString(),
        })
      );
    }

    return recommendations;
  }

  async recommendStrategyActions(
    organizationId: string
  ): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    const { data: opportunities } = await supabase
      .from('bb_scored_opportunities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('opportunity_level', 'high')
      .gte('overall_score', 80)
      .order('overall_score', { ascending: false })
      .limit(3);

    if (opportunities && opportunities.length > 0) {
      const topOpp = opportunities[0];

      if (topOpp.type === 'industry') {
        recommendations.push(
          this.createRecommendation({
            organization_id: organizationId,
            category: 'strategy',
            action_type: 'recommend_focus_industry',
            title: `Focus on ${topOpp.industry} industry`,
            description: `High opportunity score (${topOpp.overall_score}) with strong momentum`,
            context: {
              entity_type: 'opportunity',
              entity_id: topOpp.id,
              entity_name: topOpp.name,
            },
            reasoning: {
              primary_reason: 'Industry shows highest growth potential',
              supporting_factors: [
                `Overall score: ${topOpp.overall_score}`,
                `Demand momentum: ${topOpp.demand_momentum}`,
                `Revenue potential: ${topOpp.revenue_potential}`,
              ],
              data_points: [
                `Score: ${topOpp.overall_score}`,
                `Confidence: ${topOpp.confidence_level}%`,
              ],
              potential_impact: topOpp.recommended_action,
            },
            payload: {
              action_type: 'recommend_focus_industry',
              parameters: { industry: topOpp.industry, opportunity_id: topOpp.id },
            },
            confidence_score: topOpp.confidence_level,
            priority: 'high',
            requires_approval: false,
            is_destructive: false,
            status: 'suggested',
            suggested_at: new Date().toISOString(),
          })
        );
      }
    }

    return recommendations;
  }

  private createRecommendation(
    action: Omit<AgentAction, 'id' | 'created_at' | 'updated_at'>
  ): ActionRecommendation {
    return {
      action,
      relevance_score: action.confidence_score,
      time_sensitivity:
        action.priority === 'high' ? 'urgent' : action.priority === 'medium' ? 'soon' : 'normal',
    };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  }
}

export const actionRecommender = new ActionRecommender();
