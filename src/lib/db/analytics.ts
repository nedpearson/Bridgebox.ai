import { supabase } from '../supabase';

export interface SalesAnalytics {
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByServiceType: Array<{ service_type: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  proposalsSent: number;
  proposalsApproved: number;
  pipelineValue: number;
  winRate: number;
  recentLeads: number;
}

export interface DeliveryAnalytics {
  activeProjects: number;
  projectsByStatus: Array<{ status: string; count: number }>;
  projectsByServiceType: Array<{ service_type: string; count: number }>;
  projectsByPhase: Array<{ phase: string; count: number }>;
  projectsByHealthStatus: Array<{ health_status: string; count: number }>;
  completedProjects: number;
  projectsAtRisk: number;
  averageCompletion: number;
  milestoneCompletionRate: number;
}

export interface BillingAnalytics {
  activeSubscriptions: number;
  subscriptionsByPlan: Array<{ plan: string; count: number }>;
  subscriptionsByStatus: Array<{ status: string; count: number }>;
  totalMRR: number;
  invoicesPaid: number;
  invoicesOutstanding: number;
  totalRevenue: number;
  projectRevenue: number;
  platformRevenue: number;
  averageProjectValue: number;
}

export interface SupportAnalytics {
  openTickets: number;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  ticketsByStatus: Array<{ status: string; count: number }>;
  resolvedTickets: number;
  averageResolutionTime: number;
  ticketsThisWeek: number;
  ticketsThisMonth: number;
}

export interface ClientHealthAnalytics {
  totalClients: number;
  activeClients: number;
  onboardingCompleted: number;
  onboardingInProgress: number;
  clientsByIndustry: Array<{ industry: string; count: number }>;
  clientsByType: Array<{ type: string; count: number }>;
  enterpriseClients: number;
  retentionRate: number;
  averageClientValue: number;
}

export const analyticsService = {
  async getSalesAnalytics(organizationId?: string): Promise<SalesAnalytics> {
    try {
      const [
        leadsResult,
        leadsCountResult,
        leadsBySourceResult,
        leadsByServiceResult,
        leadsByStatusResult,
        proposalsResult,
      ] = await Promise.all([
        supabase.from('bb_leads').select('*', { count: 'exact', head: true }),
        supabase.from('bb_leads').select('status', { count: 'exact', head: true }).eq('status', 'qualified'),
        supabase.from('bb_leads').select('source'),
        supabase.from('bb_leads').select('service_type_category'),
        supabase.from('bb_leads').select('status'),
        (organizationId ? supabase.from('bb_proposals').select('status, pricing_amount').eq('organization_id', organizationId) : supabase.from('bb_proposals').select('status, pricing_amount')),
      ]);

      const totalLeads = leadsResult.count || 0;
      const qualifiedLeads = leadsCountResult.count || 0;

      const { count: convertedCount } = await supabase
        .from('bb_leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted');

      const convertedLeads = convertedCount || 0;

      const leadsBySource = Object.entries(
        (leadsBySourceResult.data || []).reduce((acc: any, lead) => {
          const source = lead.source || 'unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {})
      ).map(([source, count]) => ({ source, count: count as number }));

      const leadsByServiceType = Object.entries(
        (leadsByServiceResult.data || []).reduce((acc: any, lead) => {
          const type = lead.service_type_category || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([service_type, count]) => ({ service_type, count: count as number }));

      const leadsByStatus = Object.entries(
        (leadsByStatusResult.data || []).reduce((acc: any, lead) => {
          const status = lead.status || 'new';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count: count as number }));

      const proposals = proposalsResult.data || [];
      const proposalsSent = proposals.filter(p => ['sent', 'viewed', 'approved', 'declined'].includes(p.status)).length;
      const proposalsApproved = proposals.filter(p => p.status === 'approved').length;

      const pipelineValue = proposals
        .filter(p => ['sent', 'viewed'].includes(p.status))
        .reduce((sum, p) => sum + (Number(p.pricing_amount) || 0), 0);

      const winRate = proposalsSent > 0 ? (proposalsApproved / proposalsSent) * 100 : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentCount } = await supabase
        .from('bb_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        leadsBySource,
        leadsByServiceType,
        leadsByStatus,
        proposalsSent,
        proposalsApproved,
        pipelineValue,
        winRate,
        recentLeads: recentCount || 0,
      };
    } catch (error) {
      console.error('Failed to fetch sales analytics:', error);
      throw error;
    }
  },

  async getDeliveryAnalytics(organizationId?: string): Promise<DeliveryAnalytics> {
    try {
      const [
        projectsResult,
        projectsByStatusResult,
        projectsByServiceResult,
        deliveryResult,
        milestonesResult,
      ] = await Promise.all([
        (organizationId ? supabase.from('bb_projects').select('*').eq('organization_id', organizationId) : supabase.from('bb_projects').select('*')),
        (organizationId ? supabase.from('bb_projects').select('status').eq('organization_id', organizationId) : supabase.from('bb_projects').select('status')),
        (organizationId ? supabase.from('bb_projects').select('service_type_category').eq('organization_id', organizationId) : supabase.from('bb_projects').select('service_type_category')),
        supabase.from('bb_project_delivery').select('*'),
        supabase.from('bb_milestones').select('status'),
      ]);

      const projects = projectsResult.data || [];
      const activeProjects = projects.filter(p =>
        ['planning', 'in_progress', 'testing'].includes(p.status)
      ).length;

      const projectsByStatus = Object.entries(
        projects.reduce((acc: any, project) => {
          const status = project.status || 'planning';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count: count as number }));

      const projectsByServiceType = Object.entries(
        (projectsByServiceResult.data || []).reduce((acc: any, project) => {
          const type = project.service_type_category || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      ).map(([service_type, count]) => ({ service_type, count: count as number }));

      const deliveryData = deliveryResult.data || [];
      const projectsByPhase = Object.entries(
        deliveryData.reduce((acc: any, delivery) => {
          const phase = delivery.delivery_phase || 'discovery';
          acc[phase] = (acc[phase] || 0) + 1;
          return acc;
        }, {})
      ).map(([phase, count]) => ({ phase, count: count as number }));

      const projectsByHealthStatus = Object.entries(
        deliveryData.reduce((acc: any, delivery) => {
          const health = delivery.health_status || 'green';
          acc[health] = (acc[health] || 0) + 1;
          return acc;
        }, {})
      ).map(([health_status, count]) => ({ health_status, count: count as number }));

      const completedProjects = projects.filter(p => p.status === 'completed').length;

      const projectsAtRisk = deliveryData.filter(d =>
        d.health_status === 'red' || d.risk_level === 'high' || d.risk_level === 'critical'
      ).length;

      const milestones = milestonesResult.data || [];
      const completedMilestones = milestones.filter(m => m.status === 'completed').length;
      const milestoneCompletionRate = milestones.length > 0
        ? (completedMilestones / milestones.length) * 100
        : 0;

      const projectsWithDates = projects.filter(p => p.start_date && p.actual_launch_date);
      const averageCompletion = projectsWithDates.length > 0
        ? projectsWithDates.reduce((sum, p) => {
            const start = new Date(p.start_date).getTime();
            const end = new Date(p.actual_launch_date).getTime();
            return sum + (end - start);
          }, 0) / projectsWithDates.length / (1000 * 60 * 60 * 24)
        : 0;

      return {
        activeProjects,
        projectsByStatus,
        projectsByServiceType,
        projectsByPhase,
        projectsByHealthStatus,
        completedProjects,
        projectsAtRisk,
        averageCompletion,
        milestoneCompletionRate,
      };
    } catch (error) {
      console.error('Failed to fetch delivery analytics:', error);
      throw error;
    }
  },

  async getBillingAnalytics(organizationId?: string): Promise<BillingAnalytics> {
    try {
      const [
        subscriptionsResult,
        stripeSubscriptionsResult,
        invoicesResult,
        projectsResult,
      ] = await Promise.all([
        (organizationId ? supabase.from('bb_subscriptions').select('*').eq('organization_id', organizationId) : supabase.from('bb_subscriptions').select('*')),
        (organizationId ? supabase.from('stripe_subscriptions').select('*').eq('organization_id', organizationId) : supabase.from('stripe_subscriptions').select('*')),
        (organizationId ? supabase.from('bb_invoices').select('*').eq('organization_id', organizationId) : supabase.from('bb_invoices').select('*')),
        (organizationId ? supabase.from('bb_projects').select('contract_value').eq('organization_id', organizationId) : supabase.from('bb_projects').select('contract_value')),
      ]);

      const subscriptions = subscriptionsResult.data || [];
      const stripeSubscriptions = stripeSubscriptionsResult.data || [];

      const activeSubscriptions = stripeSubscriptions.filter(s =>
        s.status === 'active' || s.status === 'trialing'
      ).length;

      const subscriptionsByPlan = Object.entries(
        stripeSubscriptions.reduce((acc: any, sub) => {
          const plan = sub.plan || 'unknown';
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        }, {})
      ).map(([plan, count]) => ({ plan, count: count as number }));

      const subscriptionsByStatus = Object.entries(
        stripeSubscriptions.reduce((acc: any, sub) => {
          const status = sub.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count: count as number }));

      const totalMRR = subscriptions.reduce((sum, s) => sum + (Number(s.mrr) || 0), 0);

      const invoices = invoicesResult.data || [];
      const invoicesPaid = invoices.filter(i => i.status === 'paid').length;
      const invoicesOutstanding = invoices.filter(i =>
        ['draft', 'sent', 'overdue'].includes(i.status)
      ).length;

      const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

      const projects = projectsResult.data || [];
      const projectRevenue = projects.reduce((sum, p) => sum + (Number(p.contract_value) || 0), 0);

      const platformRevenue = totalMRR * 12;

      const averageProjectValue = projects.length > 0
        ? projects.reduce((sum, p) => sum + (Number(p.contract_value) || 0), 0) / projects.length
        : 0;

      return {
        activeSubscriptions,
        subscriptionsByPlan,
        subscriptionsByStatus,
        totalMRR,
        invoicesPaid,
        invoicesOutstanding,
        totalRevenue,
        projectRevenue,
        platformRevenue,
        averageProjectValue,
      };
    } catch (error) {
      console.error('Failed to fetch billing analytics:', error);
      throw error;
    }
  },

  async getSupportAnalytics(organizationId?: string): Promise<SupportAnalytics> {
    try {
      const [
        ticketsResult,
        ticketsByPriorityResult,
        ticketsByCategoryResult,
        ticketsByStatusResult,
      ] = await Promise.all([
        (organizationId ? supabase.from('bb_support_tickets').select('*').eq('organization_id', organizationId) : supabase.from('bb_support_tickets').select('*')),
        (organizationId ? supabase.from('bb_support_tickets').select('priority').eq('organization_id', organizationId) : supabase.from('bb_support_tickets').select('priority')),
        (organizationId ? supabase.from('bb_support_tickets').select('category').eq('organization_id', organizationId) : supabase.from('bb_support_tickets').select('category')),
        (organizationId ? supabase.from('bb_support_tickets').select('status').eq('organization_id', organizationId) : supabase.from('bb_support_tickets').select('status')),
      ]);

      const tickets = ticketsResult.data || [];

      const openTickets = tickets.filter(t =>
        ['open', 'in_progress', 'waiting_on_client'].includes(t.status)
      ).length;

      const ticketsByPriority = Object.entries(
        (ticketsByPriorityResult.data || []).reduce((acc: any, ticket) => {
          const priority = ticket.priority || 'medium';
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {})
      ).map(([priority, count]) => ({ priority, count: count as number }));

      const ticketsByCategory = Object.entries(
        (ticketsByCategoryResult.data || []).reduce((acc: any, ticket) => {
          const category = ticket.category || 'general_support';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {})
      ).map(([category, count]) => ({ category, count: count as number }));

      const ticketsByStatus = Object.entries(
        (ticketsByStatusResult.data || []).reduce((acc: any, ticket) => {
          const status = ticket.status || 'open';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count: count as number }));

      const resolvedTickets = tickets.filter(t =>
        ['resolved', 'closed'].includes(t.status)
      ).length;

      const resolvedWithTimes = tickets.filter(t => t.resolved_at && t.created_at);
      const averageResolutionTime = resolvedWithTimes.length > 0
        ? resolvedWithTimes.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const resolved = new Date(t.resolved_at).getTime();
            return sum + (resolved - created);
          }, 0) / resolvedWithTimes.length / (1000 * 60 * 60)
        : 0;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const ticketsThisWeek = tickets.filter(t =>
        new Date(t.created_at) >= oneWeekAgo
      ).length;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const ticketsThisMonth = tickets.filter(t =>
        new Date(t.created_at) >= oneMonthAgo
      ).length;

      return {
        openTickets,
        ticketsByPriority,
        ticketsByCategory,
        ticketsByStatus,
        resolvedTickets,
        averageResolutionTime,
        ticketsThisWeek,
        ticketsThisMonth,
      };
    } catch (error) {
      console.error('Failed to fetch support analytics:', error);
      throw error;
    }
  },

  async getClientHealthAnalytics(organizationId?: string): Promise<ClientHealthAnalytics> {
    try {
      const [
        organizationsResult,
        clientOrgsResult,
        projectsResult,
      ] = await Promise.all([
        supabase.from('bb_organizations').select('*'),
        supabase.from('bb_organizations').select('*').eq('type', 'client'),
        (organizationId ? supabase.from('bb_projects').select('organization_id, contract_value').eq('organization_id', organizationId) : supabase.from('bb_projects').select('organization_id, contract_value')),
      ]);

      const allOrgs = organizationsResult.data || [];
      const clients = clientOrgsResult.data || [];

      const totalClients = clients.length;

      const activeClients = clients.filter(c => {
        return c.subscription_status === 'active' || c.is_enterprise_client;
      }).length;

      const onboardingCompleted = clients.filter(c => c.onboarding_completed).length;
      const onboardingInProgress = clients.filter(c =>
        !c.onboarding_completed && c.onboarding_status === 'in_progress'
      ).length;

      const clientsByIndustry = Object.entries(
        clients.reduce((acc: any, client) => {
          const industry = client.industry || 'unknown';
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
        }, {})
      ).map(([industry, count]) => ({ industry, count: count as number }));

      const clientsByType = [
        { type: 'Platform Subscriber', count: clients.filter(c => !c.is_enterprise_client && c.subscription_status).length },
        { type: 'Enterprise Client', count: clients.filter(c => c.is_enterprise_client).length },
        { type: 'Free/Trial', count: clients.filter(c => !c.is_enterprise_client && !c.subscription_status).length },
      ];

      const enterpriseClients = clients.filter(c => c.is_enterprise_client).length;

      const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;

      const projects = projectsResult.data || [];
      const clientValues = new Map<string, number>();

      projects.forEach(p => {
        const current = clientValues.get(p.organization_id) || 0;
        clientValues.set(p.organization_id, current + (Number(p.contract_value) || 0));
      });

      const averageClientValue = clientValues.size > 0
        ? Array.from(clientValues.values()).reduce((sum, v) => sum + v, 0) / clientValues.size
        : 0;

      return {
        totalClients,
        activeClients,
        onboardingCompleted,
        onboardingInProgress,
        clientsByIndustry,
        clientsByType,
        enterpriseClients,
        retentionRate,
        averageClientValue,
      };
    } catch (error) {
      console.error('Failed to fetch client health analytics:', error);
      throw error;
    }
  },

  async getConversionMetrics(organizationId?: string) {
    const [leads, proposals, projects, orgs] = await Promise.all([
      supabase.from('bb_leads').select('id, converted_to_client'),
      (organizationId ? supabase.from('bb_proposals').select('id, status, converted_to_project').eq('organization_id', organizationId) : supabase.from('bb_proposals').select('id, status, converted_to_project')),
      (organizationId ? supabase.from('bb_projects').select('id, source').eq('organization_id', organizationId) : supabase.from('bb_projects').select('id, source')),
      supabase.from('bb_organizations').select('id, onboarding_status'),
    ]);

    return {
      totalLeads: leads.data?.length || 0,
      convertedLeads: leads.data?.filter(l => l.converted_to_client).length || 0,
      totalProposals: proposals.data?.length || 0,
      approvedProposals: proposals.data?.filter(p => p.status === 'approved').length || 0,
      convertedProposals: proposals.data?.filter(p => p.converted_to_project).length || 0,
      totalProjects: projects.data?.length || 0,
      pendingOnboarding: orgs.data?.filter(o => o.onboarding_status === 'in_progress').length || 0,
    };
  },

  async getConversionTracking(limit = 50, organizationId?: string) {
    const { data, error } = await supabase
      .from('bb_conversion_tracking')
      .select('*')
      .order('lead_converted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getAllAnalytics(organizationId?: string) {
    const [sales, delivery, billing, support, clientHealth] = await Promise.all([
      this.getSalesAnalytics(organizationId),
      this.getDeliveryAnalytics(organizationId),
      this.getBillingAnalytics(organizationId),
      this.getSupportAnalytics(organizationId),
      this.getClientHealthAnalytics(organizationId),
    ]);

    return {
      sales,
      delivery,
      billing,
      support,
      clientHealth,
    };
  },
};
