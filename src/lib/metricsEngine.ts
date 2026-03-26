import { supabase } from './supabase';
import { dataPipelineService, type TimePeriod } from './db/dataPipeline';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MetricsFilters {
  organizationId?: string;
  dateRange?: DateRange;
  serviceType?: string;
}

export interface ConversionMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  proposalsSent: number;
  proposalsAccepted: number;
  leadToProposalRate: number;
  proposalAcceptanceRate: number;
  overallConversionRate: number;
  projectedRevenue: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  mrr: number;
  projectRevenue: number;
  arr: number;
  averageDealSize: number;
  revenueByService: Record<string, number>;
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  healthyProjects: number;
  atRiskProjects: number;
  avgProjectDuration: number;
  completionRate: number;
  velocity: number;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  firstResponseTime: number;
  satisfactionScore: number;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
}

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  newClients: number;
  churnedClients: number;
  avgHealthScore: number;
  clientsAtRisk: number;
  retentionRate: number;
  expansionOpportunities: number;
}

export interface OnboardingMetrics {
  totalOnboardings: number;
  completedOnboardings: number;
  inProgressOnboardings: number;
  avgTimeToComplete: number;
  completionRate: number;
  dropOffRate: number;
}

export interface EngagementMetrics {
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  actionsPerUser: number;
  mostUsedFeatures: Array<{ feature: string; count: number }>;
}

export interface TemplateMetrics {
  totalInstalls: number;
  recentInstalls: number;
  mostPopularTemplates: Array<{ name: string; count: number }>;
  uniqueActiveTemplates: number;
}

class MetricsEngine {
  async calculateConversionRate(filters: MetricsFilters = {}): Promise<ConversionMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    let leadsQuery = supabase
      .from('bb_leads')
      .select('id, status, estimated_budget, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (organizationId) {
      leadsQuery = leadsQuery.eq('organization_id', organizationId);
    }

    const { data: leads } = await leadsQuery;

    let proposalsQuery = supabase
      .from('bb_proposals')
      .select('id, status, total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (organizationId) {
      proposalsQuery = proposalsQuery.eq('organization_id', organizationId);
    }

    const { data: proposals } = await proposalsQuery;

    const totalLeads = leads?.length || 0;
    const qualifiedLeads = leads?.filter(l => l.status === 'qualified').length || 0;
    const proposalsSent = proposals?.length || 0;
    const proposalsAccepted = proposals?.filter(p => p.status === 'accepted').length || 0;
    const projectedRevenue = proposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

    const leadToProposalRate = totalLeads > 0 ? (proposalsSent / totalLeads) * 100 : 0;
    const proposalAcceptanceRate = proposalsSent > 0 ? (proposalsAccepted / proposalsSent) * 100 : 0;
    const overallConversionRate = totalLeads > 0 ? (proposalsAccepted / totalLeads) * 100 : 0;

    return {
      totalLeads,
      qualifiedLeads,
      proposalsSent,
      proposalsAccepted,
      leadToProposalRate,
      proposalAcceptanceRate,
      overallConversionRate,
      projectedRevenue,
    };
  }

  async calculateMRR(filters: MetricsFilters = {}): Promise<RevenueMetrics> {
    const { organizationId } = filters;

    let subscriptionsQuery = supabase
      .from('bb_subscriptions')
      .select('monthly_amount, status, plan_name')
      .eq('status', 'active');

    if (organizationId) {
      subscriptionsQuery = subscriptionsQuery.eq('organization_id', organizationId);
    }

    const { data: subscriptions } = await subscriptionsQuery;

    let invoicesQuery = supabase
      .from('bb_invoices')
      .select('amount, status, created_at')
      .eq('status', 'paid')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    if (organizationId) {
      invoicesQuery = invoicesQuery.eq('organization_id', organizationId);
    }

    const { data: invoices } = await invoicesQuery;

    const mrr = subscriptions?.reduce((sum, s) => sum + (s.monthly_amount || 0), 0) || 0;
    const arr = mrr * 12;

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const projectRevenue = invoices
      ?.filter(i => new Date(i.created_at) >= last30Days)
      .reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

    const totalRevenue = mrr + projectRevenue;

    const revenueByService: Record<string, number> = {};
    subscriptions?.forEach(sub => {
      const serviceName = sub.plan_name || 'Unknown';
      revenueByService[serviceName] = (revenueByService[serviceName] || 0) + (sub.monthly_amount || 0);
    });

    const totalDeals = (subscriptions?.length || 0) + (invoices?.length || 0);
    const averageDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    return {
      totalRevenue,
      mrr,
      projectRevenue,
      arr,
      averageDealSize,
      revenueByService,
    };
  }

  async calculateProjectVelocity(filters: MetricsFilters = {}): Promise<ProjectMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    let projectsQuery = supabase
      .from('bb_projects')
      .select('id, status, health_status, created_at, start_date, end_date, completion_percentage');

    if (organizationId) {
      projectsQuery = projectsQuery.eq('organization_id', organizationId);
    }

    const { data: projects } = await projectsQuery;

    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const onHoldProjects = projects?.filter(p => p.status === 'on_hold').length || 0;

    const healthyProjects = projects?.filter(p =>
      p.health_status === 'excellent' || p.health_status === 'good'
    ).length || 0;

    const atRiskProjects = projects?.filter(p =>
      p.health_status === 'at_risk' || p.health_status === 'poor'
    ).length || 0;

    const completedWithDates = projects?.filter(p =>
      p.status === 'completed' && p.start_date && p.end_date
    ) || [];

    const durations = completedWithDates.map(p => {
      const start = new Date(p.start_date!);
      const end = new Date(p.end_date!);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    });

    const avgProjectDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const recentProjects = projects?.filter(p => {
      const created = new Date(p.created_at);
      return created >= startDate && created <= endDate;
    }).length || 0;

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const velocity = daysDiff > 0 ? recentProjects / daysDiff : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      healthyProjects,
      atRiskProjects,
      avgProjectDuration,
      completionRate,
      velocity,
    };
  }

  async calculateSupportMetrics(filters: MetricsFilters = {}): Promise<SupportMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    let ticketsQuery = supabase
      .from('bb_support_tickets')
      .select('id, status, priority, category, created_at, resolved_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (organizationId) {
      ticketsQuery = ticketsQuery.eq('organization_id', organizationId);
    }

    const { data: tickets } = await ticketsQuery;

    const totalTickets = tickets?.length || 0;
    const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0;
    const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

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

    const ticketsByPriority: Record<string, number> = {};
    tickets?.forEach(ticket => {
      const priority = ticket.priority || 'unknown';
      ticketsByPriority[priority] = (ticketsByPriority[priority] || 0) + 1;
    });

    const ticketsByCategory: Record<string, number> = {};
    tickets?.forEach(ticket => {
      const category = ticket.category || 'unknown';
      ticketsByCategory[category] = (ticketsByCategory[category] || 0) + 1;
    });

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime,
      firstResponseTime: 0,
      satisfactionScore: 0,
      ticketsByPriority,
      ticketsByCategory,
    };
  }

  async calculateClientHealthScore(filters: MetricsFilters = {}): Promise<ClientMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const orgsQuery = supabase
      .from('bb_organizations')
      .select('id, type, status, created_at')
      .eq('type', 'client');

    const { data: organizations } = await orgsQuery;

    let healthScoresQuery = supabase
      .from('bb_client_health_scores')
      .select('organization_id, overall_score, last_updated');

    if (organizationId) {
      healthScoresQuery = healthScoresQuery.eq('organization_id', organizationId);
    }

    const { data: healthScores } = await healthScoresQuery;

    let risksQuery = supabase
      .from('bb_client_risks')
      .select('organization_id, status')
      .eq('status', 'active');

    if (organizationId) {
      risksQuery = risksQuery.eq('organization_id', organizationId);
    }

    const { data: risks } = await risksQuery;

    let opportunitiesQuery = supabase
      .from('bb_client_opportunities')
      .select('organization_id, status')
      .eq('status', 'open');

    if (organizationId) {
      opportunitiesQuery = opportunitiesQuery.eq('organization_id', organizationId);
    }

    const { data: opportunities } = await opportunitiesQuery;

    const totalClients = organizations?.length || 0;
    const activeClients = organizations?.filter(o => o.status === 'active').length || 0;

    const newClients = organizations?.filter(o => {
      const created = new Date(o.created_at);
      return created >= startDate && created <= endDate;
    }).length || 0;

    const scores = healthScores?.map(h => h.overall_score || 0) || [];
    const avgHealthScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    const orgIdsWithRisks = new Set(risks?.map(r => r.organization_id) || []);
    const clientsAtRisk = orgIdsWithRisks.size;

    const retentionRate = totalClients > 0 ? ((totalClients - 0) / totalClients) * 100 : 100;
    const expansionOpportunities = opportunities?.length || 0;

    return {
      totalClients,
      activeClients,
      newClients,
      churnedClients: 0,
      avgHealthScore,
      clientsAtRisk,
      retentionRate,
      expansionOpportunities,
    };
  }

  async calculateOnboardingMetrics(filters: MetricsFilters = {}): Promise<OnboardingMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    let onboardingsQuery = supabase
      .from('bb_onboarding_progress')
      .select('id, organization_id, status, created_at, completed_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (organizationId) {
      onboardingsQuery = onboardingsQuery.eq('organization_id', organizationId);
    }

    const { data: onboardings } = await onboardingsQuery;

    const totalOnboardings = onboardings?.length || 0;
    const completedOnboardings = onboardings?.filter(o => o.status === 'completed').length || 0;
    const inProgressOnboardings = onboardings?.filter(o => o.status === 'in_progress').length || 0;

    const completionTimes = onboardings
      ?.filter(o => o.completed_at)
      .map(o => {
        const created = new Date(o.created_at);
        const completed = new Date(o.completed_at!);
        return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }) || [];

    const avgTimeToComplete = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    const completionRate = totalOnboardings > 0 ? (completedOnboardings / totalOnboardings) * 100 : 0;
    const dropOffRate = 100 - completionRate;

    return {
      totalOnboardings,
      completedOnboardings,
      inProgressOnboardings,
      avgTimeToComplete,
      completionRate,
      dropOffRate,
    };
  }

  async calculateEngagementMetrics(filters: MetricsFilters = {}): Promise<EngagementMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    const activityLogs = await dataPipelineService.getActivityLogs({
      organizationId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 50000,
    });

    const uniqueUsers = new Set(activityLogs.map(log => log.user_id)).size;
    const totalSessions = activityLogs.length;

    const featureCounts: Record<string, number> = {};
    activityLogs.forEach(log => {
      const feature = log.resource_type;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const mostUsedFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const actionsPerUser = uniqueUsers > 0 ? totalSessions / uniqueUsers : 0;

    return {
      activeUsers: uniqueUsers,
      totalSessions,
      avgSessionDuration: 0,
      actionsPerUser,
      mostUsedFeatures,
    };
  }

  async calculateTemplateMetrics(filters: MetricsFilters = {}): Promise<TemplateMetrics> {
    const { organizationId, dateRange } = filters;
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = dateRange?.endDate || new Date();

    let installsQuery = supabase
      .from('bb_template_installs')
      .select('id, template_id, created_at, bb_templates(name)', { count: 'exact' });

    if (organizationId) {
       installsQuery = installsQuery.eq('organization_id', organizationId);
    }

    const { data: installs } = await installsQuery;

    const totalInstalls = installs?.length || 0;
    const recentInstalls = installs?.filter(i => {
       const created = new Date(i.created_at);
       return created >= startDate && created <= endDate;
    }).length || 0;

    const templateCounts: Record<string, number> = {};
    const uniqueTemplates = new Set<string>();

    installs?.forEach((i: any) => {
       const name = i.bb_templates?.name || 'Unknown Template';
       templateCounts[name] = (templateCounts[name] || 0) + 1;
       uniqueTemplates.add(i.template_id);
    });

    const mostPopularTemplates = Object.entries(templateCounts)
       .map(([name, count]) => ({ name, count }))
       .sort((a, b) => b.count - a.count)
       .slice(0, 5);

    return {
       totalInstalls,
       recentInstalls,
       mostPopularTemplates,
       uniqueActiveTemplates: uniqueTemplates.size
    };
  }

  async aggregateAllMetrics(filters: MetricsFilters = {}) {
    const [
      conversion,
      revenue,
      projects,
      support,
      clients,
      onboarding,
      engagement,
      templates,
    ] = await Promise.all([
      this.calculateConversionRate(filters),
      this.calculateMRR(filters),
      this.calculateProjectVelocity(filters),
      this.calculateSupportMetrics(filters),
      this.calculateClientHealthScore(filters),
      this.calculateOnboardingMetrics(filters),
      this.calculateEngagementMetrics(filters),
      this.calculateTemplateMetrics(filters),
    ]);

    return {
      conversion,
      revenue,
      projects,
      support,
      clients,
      onboarding,
      engagement,
      templates,
      calculatedAt: new Date().toISOString(),
    };
  }

  async computeAndStoreMetrics(
    organizationId: string | null,
    timePeriod: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    const filters: MetricsFilters = {
      organizationId: organizationId || undefined,
      dateRange: { startDate, endDate },
    };

    const allMetrics = await this.aggregateAllMetrics(filters);

    await Promise.all([
      dataPipelineService.storeMetric(
        'conversion_rate',
        'crm',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        allMetrics.conversion.overallConversionRate,
        { organizationId, metricData: allMetrics.conversion }
      ),
      dataPipelineService.storeMetric(
        'mrr',
        'billing',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        allMetrics.revenue.mrr,
        { organizationId, metricData: allMetrics.revenue }
      ),
      dataPipelineService.storeMetric(
        'project_velocity',
        'project',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        allMetrics.projects.velocity,
        { organizationId, metricData: allMetrics.projects }
      ),
      dataPipelineService.storeMetric(
        'support_volume',
        'support',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        allMetrics.support.totalTickets,
        { organizationId, metricData: allMetrics.support }
      ),
      dataPipelineService.storeMetric(
        'client_health',
        'engagement',
        timePeriod,
        startDate.toISOString(),
        endDate.toISOString(),
        allMetrics.clients.avgHealthScore,
        { organizationId, metricData: allMetrics.clients }
      ),
    ]);
  }
}

export const metricsEngine = new MetricsEngine();
