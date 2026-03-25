// @ts-nocheck
import { automationService, type TriggerType } from './db/automations';
import { clientSuccessService } from './db/clientSuccess';
import { copilotService, type SuggestionType, type Priority } from './db/copilot';
import { dataPipelineService } from './db/dataPipeline';

interface AutomationContext {
  entityType: string;
  entityId: string;
  data: Record<string, any>;
}

export class SystemIntegration {
  async triggerAutomations(triggerType: TriggerType, context: AutomationContext): Promise<void> {
    try {
      const rules = await automationService.getActiveRulesByTrigger(triggerType);

      for (const rule of rules) {
        const conditionsMet = this.evaluateConditions(rule.trigger_conditions, context.data);

        if (conditionsMet) {
          try {
            await this.executeAction(rule.action_type, rule.action_config, context);

            await automationService.logExecution({
              rule_id: rule.id,
              trigger_entity_type: context.entityType,
              trigger_entity_id: context.entityId,
              status: 'success',
              error_message: null,
              executed_at: new Date().toISOString(),
            });
          } catch (error) {
            await automationService.logExecution({
              rule_id: rule.id,
              trigger_entity_type: context.entityType,
              trigger_entity_id: context.entityId,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              executed_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to trigger automations:', error);
    }
  }

  private evaluateConditions(conditions: Record<string, any>, data: Record<string, any>): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    for (const [key, value] of Object.entries(conditions)) {
      if (value === 'any') continue;

      if (key === 'budget_min' && data.estimated_budget) {
        if (data.estimated_budget < value) return false;
      } else if (key === 'days_overdue' && data.days_overdue) {
        if (data.days_overdue < value) return false;
      } else if (data[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private async executeAction(
    actionType: string,
    config: Record<string, any>,
    context: AutomationContext
  ): Promise<void> {
    switch (actionType) {
      case 'create_project':
        console.log('Would create project with template:', config.project_template);
        break;

      case 'assign_team_member':
        console.log('Would assign team member using:', config.assignment_type);
        break;

      case 'send_notification':
        console.log('Would send notification:', config.notification_type);
        break;

      case 'update_status':
        console.log('Would update status to:', config.new_status);
        break;

      case 'create_task':
        console.log('Would create task:', config.task_title);
        break;

      case 'flag_risk':
        if (context.entityType === 'organization' || context.data.organization_id) {
          const orgId = context.entityType === 'organization' ? context.entityId : context.data.organization_id;
          await clientSuccessService.createRisk(orgId, {
            risk_type: config.risk_type,
            severity: config.severity,
            description: config.description,
            detected_at: new Date().toISOString(),
          });
        }
        break;

      default:
        console.log('Unknown action type:', actionType);
    }
  }

  async generateAISuggestions(
    userId: string,
    organizationId: string | null,
    context: {
      leads?: number;
      activeProjects?: number;
      openTickets?: number;
      overdueInvoices?: number;
      completionRate?: number;
    }
  ): Promise<void> {
    const suggestions: Array<{
      type: SuggestionType;
      title: string;
      description: string;
      priority: Priority;
      context: Record<string, any>;
    }> = [];

    if (context.leads && context.leads > 10) {
      suggestions.push({
        type: 'automation',
        title: 'Automate Lead Assignment',
        description: `You have ${context.leads} leads. Consider setting up automatic assignment to distribute them evenly across your team.`,
        priority: 'medium',
        context: { lead_count: context.leads },
      });
    }

    if (context.openTickets && context.openTickets > 5) {
      suggestions.push({
        type: 'risk_alert',
        title: 'High Support Volume Detected',
        description: `There are ${context.openTickets} open support tickets. This may indicate a product issue or need for additional resources.`,
        priority: 'high',
        context: { ticket_count: context.openTickets },
      });
    }

    if (context.overdueInvoices && context.overdueInvoices > 0) {
      suggestions.push({
        type: 'risk_alert',
        title: 'Overdue Invoices Require Action',
        description: `${context.overdueInvoices} invoice(s) are overdue. Set up automated payment reminders to improve cash flow.`,
        priority: 'urgent',
        context: { overdue_count: context.overdueInvoices },
      });
    }

    if (context.activeProjects && context.activeProjects > 5) {
      suggestions.push({
        type: 'workflow',
        title: 'Optimize Project Management',
        description: `With ${context.activeProjects} active projects, consider implementing milestone-based automation and status updates.`,
        priority: 'medium',
        context: { project_count: context.activeProjects },
      });
    }

    if (context.completionRate && context.completionRate < 70) {
      suggestions.push({
        type: 'opportunity',
        title: 'Improve Completion Rate',
        description: `Current completion rate is ${context.completionRate}%. Review resource allocation and timeline estimates.`,
        priority: 'high',
        context: { completion_rate: context.completionRate },
      });
    }

    for (const suggestion of suggestions) {
      try {
        await copilotService.createSuggestion(
          userId,
          organizationId,
          suggestion.type,
          suggestion.title,
          suggestion.description,
          suggestion.context,
          suggestion.priority
        );
      } catch (error) {
        console.error('Failed to create AI suggestion:', error);
      }
    }
  }

  async syncClientHealthScore(organizationId: string): Promise<void> {
    try {
      const metrics = await clientSuccessService.getHealthMetrics(organizationId);

      let score = 100;

      if (metrics.active_risks > 0) {
        score -= metrics.active_risks * 10;
      }

      if (metrics.overdue_deliverables > 0) {
        score -= metrics.overdue_deliverables * 5;
      }

      if (metrics.support_satisfaction) {
        score = score * (metrics.support_satisfaction / 100);
      }

      score = Math.max(0, Math.min(100, score));

      let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'at_risk';
      if (score >= 90) healthStatus = 'excellent';
      else if (score >= 75) healthStatus = 'good';
      else if (score >= 60) healthStatus = 'fair';
      else if (score >= 40) healthStatus = 'poor';
      else healthStatus = 'at_risk';

      await clientSuccessService.updateHealthScore(organizationId, score, healthStatus);
    } catch (error) {
      console.error('Failed to sync client health score:', error);
    }
  }

  async onLeadCreated(leadId: string, leadData: any, userId: string, orgId: string | null): Promise<void> {
    await dataPipelineService.logEvent('lead_created', 'crm', {
      organizationId: orgId,
      userId,
      entityType: 'lead',
      entityId: leadId,
      eventData: leadData,
    });

    await this.triggerAutomations('lead_created', {
      entityType: 'lead',
      entityId: leadId,
      data: leadData,
    });

    if (leadData.estimated_budget && leadData.estimated_budget > 50000) {
      await copilotService.createSuggestion(
        userId,
        orgId,
        'next_step',
        'High-Value Lead Detected',
        `New lead "${leadData.company_name}" with $${leadData.estimated_budget} budget. Consider prioritizing for immediate follow-up.`,
        { lead_id: leadId, budget: leadData.estimated_budget },
        'high'
      );
    }
  }

  async onProposalApproved(proposalId: string, proposalData: any, userId: string, orgId: string): Promise<void> {
    await dataPipelineService.logEvent('proposal_approved', 'crm', {
      organizationId: orgId,
      userId,
      entityType: 'proposal',
      entityId: proposalId,
      eventData: proposalData,
    });

    await this.triggerAutomations('proposal_approved', {
      entityType: 'proposal',
      entityId: proposalId,
      data: proposalData,
    });

    await clientSuccessService.createOpportunity(orgId, {
      opportunity_type: 'upsell',
      title: 'Project Kickoff Planning',
      description: `Proposal approved. Schedule kickoff meeting and review project timeline.`,
      potential_value: proposalData.total_amount || 0,
      probability: 90,
    });
  }

  async onOnboardingCompleted(orgId: string, userId: string): Promise<void> {
    await dataPipelineService.logEvent('onboarding_completed', 'system', {
      organizationId: orgId,
      userId,
      entityType: 'organization',
      entityId: orgId,
    });

    await this.triggerAutomations('onboarding_completed', {
      entityType: 'organization',
      entityId: orgId,
      data: { organization_id: orgId },
    });

    await copilotService.createSuggestion(
      userId,
      orgId,
      'next_step',
      'Onboarding Complete - Schedule Check-in',
      'Client has completed onboarding. Schedule a 30-day check-in to ensure satisfaction and identify early wins.',
      { organization_id: orgId },
      'medium'
    );
  }

  async onProjectCreated(projectId: string, projectData: any, userId: string, orgId: string): Promise<void> {
    await dataPipelineService.logEvent('project_created', 'project', {
      organizationId: orgId,
      userId,
      entityType: 'project',
      entityId: projectId,
      eventData: projectData,
    });

    await this.triggerAutomations('project_created', {
      entityType: 'project',
      entityId: projectId,
      data: projectData,
    });
  }

  async onSupportTicketCreated(ticketId: string, ticketData: any, userId: string, orgId: string | null): Promise<void> {
    await dataPipelineService.logEvent('support_ticket_created', 'support', {
      organizationId: orgId,
      userId,
      entityType: 'support_ticket',
      entityId: ticketId,
      eventData: ticketData,
    });

    await this.triggerAutomations('support_ticket_created', {
      entityType: 'support_ticket',
      entityId: ticketId,
      data: ticketData,
    });

    if (ticketData.priority === 'urgent' || ticketData.priority === 'high') {
      if (orgId) {
        await clientSuccessService.createRisk(orgId, {
          risk_type: 'high_support_volume',
          severity: ticketData.priority === 'urgent' ? 'high' : 'medium',
          description: `High priority support ticket created: ${ticketData.title}`,
          detected_at: new Date().toISOString(),
        });
      }
    }
  }

  async checkInvoiceStatus(invoiceId: string, daysOverdue: number, userId: string, orgId: string): Promise<void> {
    await dataPipelineService.logEvent('invoice_overdue', 'billing', {
      organizationId: orgId,
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      eventData: { days_overdue: daysOverdue },
    });

    await this.triggerAutomations('invoice_overdue', {
      entityType: 'invoice',
      entityId: invoiceId,
      data: { days_overdue: daysOverdue, organization_id: orgId },
    });

    if (daysOverdue >= 30) {
      await clientSuccessService.createRisk(orgId, {
        risk_type: 'overdue_invoice',
        severity: daysOverdue >= 60 ? 'critical' : 'high',
        description: `Invoice ${invoiceId} is ${daysOverdue} days overdue`,
        detected_at: new Date().toISOString(),
      });
    }
  }
}

export const systemIntegration = new SystemIntegration();
