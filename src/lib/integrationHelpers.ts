// @ts-nocheck
import { supabase } from './supabase';

export class IntegrationHelpers {
  async getClientOverview(organizationId: string) {
    try {
      const [projects, tickets, health, billing] = await Promise.all([
        supabase
          .from('projects')
          .select('id, name, status, health_status')
          .eq('organization_id', organizationId),
        supabase
          .from('support_tickets')
          .select('id, priority, status')
          .eq('organization_id', organizationId)
          .in('status', ['open', 'in_progress']),
        supabase
          .from('client_health_scores')
          .select('*')
          .eq('organization_id', organizationId)
          .maybeSingle(),
        supabase
          .from('organizations')
          .select('subscription_status, subscription_plan')
          .eq('id', organizationId)
          .maybeSingle(),
      ]);

      const activeProjects = projects.data?.filter(p => p.status === 'active') || [];
      const atRiskProjects = projects.data?.filter(p => p.health_status === 'at_risk' || p.health_status === 'poor') || [];
      const urgentTickets = tickets.data?.filter(t => t.priority === 'urgent') || [];

      return {
        total_projects: projects.data?.length || 0,
        active_projects: activeProjects.length,
        at_risk_projects: atRiskProjects.length,
        open_tickets: tickets.data?.length || 0,
        urgent_tickets: urgentTickets.length,
        health_score: health.data?.health_score || 0,
        health_status: health.data?.health_status || 'good',
        subscription_status: billing.data?.subscription_status || 'active',
        subscription_plan: billing.data?.subscription_plan || 'starter',
      };
    } catch (error) {
      console.error('Failed to get client overview:', error);
      return null;
    }
  }

  async getProjectWithRelatedData(projectId: string) {
    try {
      const [project, milestones, deliverables, implementation, risks] = await Promise.all([
        supabase
          .from('projects')
          .select('*, organizations(*)')
          .eq('id', projectId)
          .maybeSingle(),
        supabase
          .from('project_milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true }),
        supabase
          .from('project_deliverables')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date', { ascending: true }),
        supabase
          .from('implementation_projects')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle(),
        supabase
          .from('client_risks')
          .select('*')
          .eq('organization_id', project.data?.organization_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
      ]);

      return {
        project: project.data,
        milestones: milestones.data || [],
        deliverables: deliverables.data || [],
        implementation: implementation.data,
        related_risks: risks.data || [],
      };
    } catch (error) {
      console.error('Failed to get project with related data:', error);
      return null;
    }
  }

  async getLeadWithContext(leadId: string) {
    try {
      const [lead, proposals, conversations] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .maybeSingle(),
        supabase
          .from('proposals')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
        supabase
          .from('copilot_conversations')
          .select('id, title, updated_at')
          .eq('context_type', 'crm')
          .order('updated_at', { ascending: false })
          .limit(5),
      ]);

      return {
        lead: lead.data,
        proposals: proposals.data || [],
        recent_conversations: conversations.data || [],
      };
    } catch (error) {
      console.error('Failed to get lead with context:', error);
      return null;
    }
  }

  async getSupportTicketWithContext(ticketId: string) {
    try {
      const [ticket, knowledgeArticles, relatedTickets] = await Promise.all([
        supabase
          .from('support_tickets')
          .select('*, organizations(*)')
          .eq('id', ticketId)
          .maybeSingle(),
        supabase
          .from('knowledge_documents')
          .select('id, title, category, visibility')
          .eq('visibility', 'public')
          .limit(5),
        supabase
          .from('support_tickets')
          .select('id, title, status, priority')
          .eq('organization_id', ticket.data?.organization_id)
          .neq('id', ticketId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      return {
        ticket: ticket.data,
        suggested_articles: knowledgeArticles.data || [],
        related_tickets: relatedTickets.data || [],
      };
    } catch (error) {
      console.error('Failed to get support ticket with context:', error);
      return null;
    }
  }

  async checkSystemHealth(organizationId: string) {
    try {
      const overview = await this.getClientOverview(organizationId);
      if (!overview) return null;

      const issues: Array<{ type: string; severity: string; message: string }> = [];

      if (overview.at_risk_projects > 0) {
        issues.push({
          type: 'project_risk',
          severity: 'high',
          message: `${overview.at_risk_projects} project(s) are at risk`,
        });
      }

      if (overview.urgent_tickets > 3) {
        issues.push({
          type: 'support_overload',
          severity: 'high',
          message: `${overview.urgent_tickets} urgent support tickets need attention`,
        });
      }

      if (overview.health_score < 60) {
        issues.push({
          type: 'low_health_score',
          severity: 'critical',
          message: `Client health score is ${overview.health_score}/100`,
        });
      }

      if (overview.subscription_status !== 'active') {
        issues.push({
          type: 'billing_issue',
          severity: 'urgent',
          message: `Subscription status: ${overview.subscription_status}`,
        });
      }

      return {
        overview,
        issues,
        overall_status: issues.length === 0 ? 'healthy' : issues.some(i => i.severity === 'critical') ? 'critical' : 'needs_attention',
      };
    } catch (error) {
      console.error('Failed to check system health:', error);
      return null;
    }
  }

  async getAutomationOpportunities(organizationId: string) {
    try {
      const [leads, tickets, projects, existingRules] = await Promise.all([
        supabase
          .from('leads')
          .select('id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('support_tickets')
          .select('id, priority, category, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('projects')
          .select('id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('automation_rules')
          .select('trigger_type, action_type')
          .eq('is_active', true),
      ]);

      const opportunities: Array<{
        title: string;
        description: string;
        benefit: string;
        trigger_type: string;
        action_type: string;
      }> = [];

      const hasLeadAssignmentRule = existingRules.data?.some(
        r => r.trigger_type === 'lead_created' && r.action_type === 'assign_team_member'
      );

      if (!hasLeadAssignmentRule && (leads.data?.length || 0) > 10) {
        opportunities.push({
          title: 'Automate Lead Assignment',
          description: 'Automatically assign new leads to team members using round-robin or least-loaded distribution',
          benefit: 'Ensures fast response time and balanced workload',
          trigger_type: 'lead_created',
          action_type: 'assign_team_member',
        });
      }

      const hasProjectCreationRule = existingRules.data?.some(
        r => r.trigger_type === 'proposal_approved' && r.action_type === 'create_project'
      );

      if (!hasProjectCreationRule) {
        opportunities.push({
          title: 'Auto-Create Projects from Proposals',
          description: 'Automatically create project when proposal is approved, with pre-configured template',
          benefit: 'Eliminates manual setup and speeds up project kickoff',
          trigger_type: 'proposal_approved',
          action_type: 'create_project',
        });
      }

      const hasTicketRiskRule = existingRules.data?.some(
        r => r.trigger_type === 'support_ticket_created' && r.action_type === 'flag_risk'
      );

      if (!hasTicketRiskRule && (tickets.data?.filter(t => t.priority === 'urgent').length || 0) > 3) {
        opportunities.push({
          title: 'Flag Risks from Support Tickets',
          description: 'Automatically create risk alerts in Client Success when high-priority tickets are created',
          benefit: 'Proactively identifies clients at risk of churn',
          trigger_type: 'support_ticket_created',
          action_type: 'flag_risk',
        });
      }

      return opportunities;
    } catch (error) {
      console.error('Failed to get automation opportunities:', error);
      return [];
    }
  }

  async linkKnowledgeToOnboarding(documentId: string, onboardingStage: string) {
    try {
      await supabase
        .from('knowledge_documents')
        .update({
          metadata: {
            onboarding_stage: onboardingStage,
            show_in_onboarding: true,
          },
        })
        .eq('id', documentId);

      return true;
    } catch (error) {
      console.error('Failed to link knowledge to onboarding:', error);
      return false;
    }
  }

  async getOnboardingRecommendedDocs(stage: string) {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('id, title, summary, category')
        .eq('visibility', 'public')
        .or(`metadata->onboarding_stage.eq.${stage},metadata->show_in_onboarding.eq.true`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get onboarding docs:', error);
      return [];
    }
  }
}

export const integrationHelpers = new IntegrationHelpers();
