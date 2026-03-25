import { dataPipelineService, type TimePeriod } from './db/dataPipeline';
import { supabase } from './supabase';

export class MetricsAggregator {
  async computeDailyMetrics(date: Date, organizationId?: string): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await dataPipelineService.aggregateMetrics(
      organizationId || null,
      'day',
      startOfDay,
      endOfDay
    );

    await this.computeCRMMetrics(startOfDay, endOfDay, organizationId);
    await this.computeProjectMetrics(startOfDay, endOfDay, organizationId);
    await this.computeSupportMetrics(startOfDay, endOfDay, organizationId);
    await this.computeEngagementMetrics(startOfDay, endOfDay, organizationId);
  }

  private async computeCRMMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<void> {
    try {
      let leadsQuery = supabase
        .from('leads')
        .select('id, status, estimated_budget, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (organizationId) {
        leadsQuery = leadsQuery.eq('organization_id', organizationId);
      }

      const { data: leads } = await leadsQuery;

      const newLeads = leads?.length || 0;
      const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0;
      const totalBudget = leads?.reduce((sum, l) => sum + (l.estimated_budget || 0), 0) || 0;

      await dataPipelineService.storeMetric(
        'lead_metrics',
        'crm',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        newLeads,
        {
          organizationId: organizationId || null,
          metricData: {
            new_leads: newLeads,
            qualified_leads: qualifiedLeads,
            total_budget: totalBudget,
            avg_budget: newLeads > 0 ? totalBudget / newLeads : 0,
          },
        }
      );

      let proposalsQuery = supabase
        .from('proposals')
        .select('id, status, total_amount, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (organizationId) {
        proposalsQuery = proposalsQuery.eq('organization_id', organizationId);
      }

      const { data: proposals } = await proposalsQuery;

      const newProposals = proposals?.length || 0;
      const acceptedProposals = proposals?.filter(p => p.status === 'accepted').length || 0;
      const proposalValue = proposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

      await dataPipelineService.storeMetric(
        'proposal_metrics',
        'crm',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        newProposals,
        {
          organizationId: organizationId || null,
          metricData: {
            new_proposals: newProposals,
            accepted_proposals: acceptedProposals,
            conversion_rate: newProposals > 0 ? (acceptedProposals / newProposals) * 100 : 0,
            total_value: proposalValue,
          },
        }
      );
    } catch (error) {
      console.error('Failed to compute CRM metrics:', error);
    }
  }

  private async computeProjectMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<void> {
    try {
      let projectsQuery = supabase
        .from('projects')
        .select('id, status, health_status, created_at');

      if (organizationId) {
        projectsQuery = projectsQuery.eq('organization_id', organizationId);
      }

      const { data: projects } = await projectsQuery;

      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const atRiskProjects = projects?.filter(p => p.health_status === 'at_risk' || p.health_status === 'poor').length || 0;

      await dataPipelineService.storeMetric(
        'project_health',
        'project',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        activeProjects,
        {
          organizationId: organizationId || null,
          metricData: {
            active_projects: activeProjects,
            completed_projects: completedProjects,
            at_risk_projects: atRiskProjects,
            health_percentage: activeProjects > 0 ? ((activeProjects - atRiskProjects) / activeProjects) * 100 : 100,
          },
        }
      );

      const milestonesQuery = supabase
        .from('project_milestones')
        .select('id, status, due_date')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString());

      const { data: milestones } = await milestonesQuery;

      const completedMilestones = milestones?.filter(m => m.status === 'completed').length || 0;
      const delayedMilestones = milestones?.filter(m => m.status === 'delayed').length || 0;

      await dataPipelineService.storeMetric(
        'milestone_completion',
        'project',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        completedMilestones,
        {
          organizationId: organizationId || null,
          metricData: {
            completed: completedMilestones,
            delayed: delayedMilestones,
            on_time_rate: (completedMilestones + delayedMilestones) > 0
              ? (completedMilestones / (completedMilestones + delayedMilestones)) * 100
              : 100,
          },
        }
      );
    } catch (error) {
      console.error('Failed to compute project metrics:', error);
    }
  }

  private async computeSupportMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<void> {
    try {
      let ticketsQuery = supabase
        .from('support_tickets')
        .select('id, status, priority, created_at, resolved_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (organizationId) {
        ticketsQuery = ticketsQuery.eq('organization_id', organizationId);
      }

      const { data: tickets } = await ticketsQuery;

      const newTickets = tickets?.length || 0;
      const resolvedTickets = tickets?.filter(t => t.status === 'resolved').length || 0;
      const urgentTickets = tickets?.filter(t => t.priority === 'urgent').length || 0;

      const resolutionTimes = tickets
        ?.filter(t => t.resolved_at)
        .map(t => {
          const created = new Date(t.created_at);
          const resolved = new Date(t.resolved_at!);
          return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        }) || [];

      const avgResolutionTime = resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
        : 0;

      await dataPipelineService.storeMetric(
        'support_metrics',
        'support',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        newTickets,
        {
          organizationId: organizationId || null,
          metricData: {
            new_tickets: newTickets,
            resolved_tickets: resolvedTickets,
            urgent_tickets: urgentTickets,
            resolution_rate: newTickets > 0 ? (resolvedTickets / newTickets) * 100 : 0,
            avg_resolution_hours: avgResolutionTime,
          },
        }
      );
    } catch (error) {
      console.error('Failed to compute support metrics:', error);
    }
  }

  private async computeEngagementMetrics(
    startDate: Date,
    endDate: Date,
    organizationId?: string
  ): Promise<void> {
    try {
      const activityLogs = await dataPipelineService.getActivityLogs({
        organizationId: organizationId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10000,
      });

      const uniqueUsers = new Set(activityLogs.map(log => log.user_id)).size;
      const totalActions = activityLogs.length;

      const actionTypes = activityLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const resourceTypes = activityLogs.reduce((acc, log) => {
        acc[log.resource_type] = (acc[log.resource_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      await dataPipelineService.storeMetric(
        'user_engagement',
        'engagement',
        'day',
        startDate.toISOString(),
        endDate.toISOString(),
        totalActions,
        {
          organizationId: organizationId || null,
          metricData: {
            unique_users: uniqueUsers,
            total_actions: totalActions,
            actions_per_user: uniqueUsers > 0 ? totalActions / uniqueUsers : 0,
            action_breakdown: actionTypes,
            resource_breakdown: resourceTypes,
          },
        }
      );
    } catch (error) {
      console.error('Failed to compute engagement metrics:', error);
    }
  }

  async detectAnomalies(organizationId?: string): Promise<void> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const todayMetrics = await dataPipelineService.getMetrics({
        organizationId: organizationId,
        timePeriod: 'day',
        startDate: today.toISOString(),
        limit: 100,
      });

      const lastWeekMetrics = await dataPipelineService.getMetrics({
        organizationId: organizationId,
        timePeriod: 'day',
        startDate: lastWeek.toISOString(),
        endDate: yesterday.toISOString(),
        limit: 700,
      });

      for (const todayMetric of todayMetrics) {
        const similarMetrics = lastWeekMetrics.filter(
          m => m.metric_type === todayMetric.metric_type &&
               m.metric_category === todayMetric.metric_category
        );

        if (similarMetrics.length === 0) continue;

        const avgValue = similarMetrics.reduce((sum, m) => sum + Number(m.metric_value), 0) / similarMetrics.length;
        const stdDev = Math.sqrt(
          similarMetrics.reduce((sum, m) => sum + Math.pow(Number(m.metric_value) - avgValue, 2), 0) /
          similarMetrics.length
        );

        const deviation = Math.abs(Number(todayMetric.metric_value) - avgValue);
        const zScore = stdDev > 0 ? deviation / stdDev : 0;

        if (zScore > 2) {
          let severity: 'info' | 'low' | 'medium' | 'high' | 'critical' = 'medium';
          if (zScore > 4) severity = 'critical';
          else if (zScore > 3) severity = 'high';

          await dataPipelineService.createSignal(
            'anomaly',
            todayMetric.metric_category,
            severity,
            `Unusual ${todayMetric.metric_type} detected`,
            {
              organizationId: organizationId || null,
              description: `Current value (${todayMetric.metric_value}) deviates significantly from the 7-day average (${avgValue.toFixed(2)})`,
              signalData: {
                current_value: todayMetric.metric_value,
                average_value: avgValue,
                standard_deviation: stdDev,
                z_score: zScore,
                metric_type: todayMetric.metric_type,
              },
              confidenceScore: Math.min(95, 70 + (zScore * 5)),
            }
          );
        }
      }
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
    }
  }
}

export const metricsAggregator = new MetricsAggregator();
