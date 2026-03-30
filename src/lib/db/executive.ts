// @ts-nocheck
import { supabase } from "../supabase";

export interface ExecutiveKPIs {
  mrr: number;
  activeClients: number;
  openOpportunities: number;
  activeProjects: number;
  supportHealth: {
    open: number;
    urgent: number;
    avgResolutionHours: number;
  };
  onboardingCompletion: number;
}

export interface SalesSnapshot {
  pipelineValue: number;
  proposalsPending: number;
  winRate: number;
  topServiceTypes: Array<{ service_type: string; count: number }>;
  recentLeads: number;
  conversionRate: number;
}

export interface DeliverySnapshot {
  projectsByPhase: Array<{ phase: string; count: number }>;
  projectsAtRisk: number;
  upcomingMilestones: Array<{
    id: string;
    project_name: string;
    title: string;
    due_date: string;
    status: string;
  }>;
  deliveryWorkload: {
    discovery: number;
    development: number;
    testing: number;
    deployment: number;
  };
}

export interface ClientHealthSnapshot {
  onboardingIncomplete: number;
  supportEscalations: number;
  activeAccounts: number;
  retentionRate: number;
  clientsByStatus: Array<{ status: string; count: number }>;
  riskAccounts: number;
}

export interface BillingSnapshot {
  subscriptionMix: Array<{ plan: string; count: number }>;
  invoicesDue: number;
  outstandingIssues: number;
  customRevenue: number;
  recurringRevenue: number;
  totalRevenue: number;
}

export interface OperationalAlert {
  id: string;
  type: "milestone" | "ticket" | "onboarding" | "proposal";
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  link: string;
  created_at: string;
}

export interface RecentActivity {
  id: string;
  type: "lead" | "proposal" | "project" | "ticket" | "invoice";
  title: string;
  description: string;
  link: string;
  timestamp: string;
  icon: string;
}

export const executiveService = {
  async getExecutiveKPIs(organizationId?: string): Promise<ExecutiveKPIs> {
    try {
      const [
        subscriptionsResult,
        clientsResult,
        leadsResult,
        projectsResult,
        ticketsResult,
        orgsResult,
      ] = await Promise.all([
        organizationId
          ? supabase
              .from("bb_subscriptions")
              .select("mrr")
              .eq("organization_id", organizationId)
          : supabase.from("bb_subscriptions").select("mrr"),
        supabase
          .from("bb_organizations")
          .select("*", { count: "exact", head: true })
          .eq("type", "client"),
        supabase
          .from("bb_leads")
          .select("*", { count: "exact", head: true })
          .in("status", ["new", "contacted", "qualified"]),
        (organizationId
          ? supabase
              .from("bb_projects")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", organizationId)
          : supabase
              .from("bb_projects")
              .select("*", { count: "exact", head: true })
        ).in("status", ["planning", "in_progress", "testing"]),
        organizationId
          ? supabase
              .from("bb_support_tickets")
              .select("*")
              .eq("organization_id", organizationId)
          : supabase.from("bb_support_tickets").select("*"),
        supabase
          .from("bb_organizations")
          .select("onboarding_completed")
          .eq("type", "client"),
      ]);

      const mrr = (subscriptionsResult.data || []).reduce(
        (sum, s) => sum + (Number(s.mrr) || 0),
        0,
      );
      const activeClients = clientsResult.count || 0;
      const openOpportunities = leadsResult.count || 0;
      const activeProjects = projectsResult.count || 0;

      const tickets = ticketsResult.data || [];
      const openTickets = tickets.filter((t) =>
        ["open", "in_progress", "waiting_on_client"].includes(t.status),
      ).length;
      const urgentTickets = tickets.filter(
        (t) =>
          t.priority === "urgent" && ["open", "in_progress"].includes(t.status),
      ).length;

      const resolvedWithTimes = tickets.filter(
        (t) => t.resolved_at && t.created_at,
      );
      const avgResolutionHours =
        resolvedWithTimes.length > 0
          ? resolvedWithTimes.reduce((sum, t) => {
              const created = new Date(t.created_at).getTime();
              const resolved = new Date(t.resolved_at).getTime();
              return sum + (resolved - created);
            }, 0) /
            resolvedWithTimes.length /
            (1000 * 60 * 60)
          : 0;

      const orgs = orgsResult.data || [];
      const completedOnboarding = orgs.filter(
        (o) => o.onboarding_completed,
      ).length;
      const onboardingCompletion =
        orgs.length > 0 ? (completedOnboarding / orgs.length) * 100 : 0;

      return {
        mrr,
        activeClients,
        openOpportunities,
        activeProjects,
        supportHealth: {
          open: openTickets,
          urgent: urgentTickets,
          avgResolutionHours,
        },
        onboardingCompletion,
      };
    } catch (error) {
      console.error("Failed to fetch executive KPIs:", error);
      throw error;
    }
  },

  async getSalesSnapshot(organizationId?: string): Promise<SalesSnapshot> {
    try {
      const [proposalsResult, leadsResult, serviceTypesResult] =
        await Promise.all([
          organizationId
            ? supabase
                .from("bb_proposals")
                .select("status, pricing_amount")
                .eq("organization_id", organizationId)
            : supabase.from("bb_proposals").select("status, pricing_amount"),
          supabase.from("bb_leads").select("*"),
          supabase.from("bb_leads").select("service_type_category"),
        ]);

      const proposals = proposalsResult.data || [];
      const pipelineValue = proposals
        .filter((p) => ["sent", "viewed"].includes(p.status))
        .reduce((sum, p) => sum + (Number(p.pricing_amount) || 0), 0);

      const proposalsPending = proposals.filter((p) =>
        ["sent", "viewed"].includes(p.status),
      ).length;

      const proposalsSent = proposals.filter((p) =>
        ["sent", "viewed", "approved", "declined"].includes(p.status),
      ).length;
      const proposalsApproved = proposals.filter(
        (p) => p.status === "approved",
      ).length;
      const winRate =
        proposalsSent > 0 ? (proposalsApproved / proposalsSent) * 100 : 0;

      const serviceTypes = (serviceTypesResult.data || []).reduce(
        (acc: any, lead) => {
          const type = lead.service_type_category || "unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {},
      );

      const topServiceTypes = Object.entries(serviceTypes)
        .map(([service_type, count]) => ({
          service_type,
          count: count as number,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const leads = leadsResult.data || [];
      const recentLeads = leads.filter(
        (l) => new Date(l.created_at) >= thirtyDaysAgo,
      ).length;

      const convertedLeads = leads.filter(
        (l) => l.status === "converted",
      ).length;
      const conversionRate =
        leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

      return {
        pipelineValue,
        proposalsPending,
        winRate,
        topServiceTypes,
        recentLeads,
        conversionRate,
      };
    } catch (error) {
      console.error("Failed to fetch sales snapshot:", error);
      throw error;
    }
  },

  async getDeliverySnapshot(
    organizationId?: string,
  ): Promise<DeliverySnapshot> {
    try {
      const [deliveryResult, milestonesResult, projectsResult] =
        await Promise.all([
          supabase.from("bb_project_delivery").select("*"),
          supabase
            .from("bb_milestones")
            .select(
              "id, title, due_date, status, project_id, bb_projects(name)",
            )
            .in("status", ["not_started", "in_progress"])
            .order("due_date", { ascending: true })
            .limit(10),
          organizationId
            ? supabase
                .from("bb_projects")
                .select("*")
                .eq("organization_id", organizationId)
            : supabase.from("bb_projects").select("*"),
        ]);

      const deliveryData = deliveryResult.data || [];

      const projectsByPhase = Object.entries(
        deliveryData.reduce((acc: any, d) => {
          const phase = d.delivery_phase || "discovery";
          acc[phase] = (acc[phase] || 0) + 1;
          return acc;
        }, {}),
      ).map(([phase, count]) => ({ phase, count: count as number }));

      const projectsAtRisk = deliveryData.filter(
        (d) =>
          d.health_status === "red" ||
          d.risk_level === "high" ||
          d.risk_level === "critical",
      ).length;

      const upcomingMilestones = (milestonesResult.data || []).map((m) => ({
        id: m.id,
        project_name: (m.projects as any)?.name || "Unknown Project",
        title: m.title,
        due_date: m.due_date,
        status: m.status,
      }));

      const deliveryWorkload = {
        discovery: deliveryData.filter((d) => d.delivery_phase === "discovery")
          .length,
        development: deliveryData.filter(
          (d) => d.delivery_phase === "development",
        ).length,
        testing: deliveryData.filter((d) => d.delivery_phase === "testing")
          .length,
        deployment: deliveryData.filter(
          (d) => d.delivery_phase === "deployment",
        ).length,
      };

      return {
        projectsByPhase,
        projectsAtRisk,
        upcomingMilestones,
        deliveryWorkload,
      };
    } catch (error) {
      console.error("Failed to fetch delivery snapshot:", error);
      throw error;
    }
  },

  async getClientHealthSnapshot(
    organizationId?: string,
  ): Promise<ClientHealthSnapshot> {
    try {
      const [orgsResult, ticketsResult, projectsResult] = await Promise.all([
        supabase.from("bb_organizations").select("*").eq("type", "client"),
        (organizationId
          ? supabase
              .from("bb_support_tickets")
              .select("*")
              .eq("organization_id", organizationId)
          : supabase.from("bb_support_tickets").select("*")
        )
          .eq("priority", "urgent")
          .in("status", ["open", "in_progress"]),
        organizationId
          ? supabase
              .from("bb_projects")
              .select("organization_id")
              .eq("organization_id", organizationId)
          : supabase.from("bb_projects").select("organization_id"),
      ]);

      const clients = orgsResult.data || [];

      const onboardingIncomplete = clients.filter(
        (c) => !c.onboarding_completed,
      ).length;

      const supportEscalations = ticketsResult.count || 0;

      const activeClients = clients.filter(
        (c) => c.subscription_status === "active" || c.is_enterprise_client,
      ).length;

      const retentionRate =
        clients.length > 0 ? (activeClients / clients.length) * 100 : 0;

      const clientsByStatus = [
        { status: "Active", count: activeClients },
        { status: "Onboarding", count: onboardingIncomplete },
        { status: "Inactive", count: clients.length - activeClients },
      ];

      const riskAccounts = clients.filter(
        (c) => !c.onboarding_completed || c.subscription_status === "past_due",
      ).length;

      return {
        onboardingIncomplete,
        supportEscalations,
        activeAccounts: activeClients,
        retentionRate,
        clientsByStatus,
        riskAccounts,
      };
    } catch (error) {
      console.error("Failed to fetch client health snapshot:", error);
      throw error;
    }
  },

  async getBillingSnapshot(organizationId?: string): Promise<BillingSnapshot> {
    try {
      const [
        stripeSubscriptionsResult,
        invoicesResult,
        projectsResult,
        subscriptionsResult,
      ] = await Promise.all([
        organizationId
          ? supabase
              .from("stripe_subscriptions")
              .select("*")
              .eq("organization_id", organizationId)
          : supabase.from("stripe_subscriptions").select("*"),
        organizationId
          ? supabase
              .from("bb_invoices")
              .select("*")
              .eq("organization_id", organizationId)
          : supabase.from("bb_invoices").select("*"),
        organizationId
          ? supabase
              .from("bb_projects")
              .select("contract_value")
              .eq("organization_id", organizationId)
          : supabase.from("bb_projects").select("contract_value"),
        organizationId
          ? supabase
              .from("bb_subscriptions")
              .select("mrr")
              .eq("organization_id", organizationId)
          : supabase.from("bb_subscriptions").select("mrr"),
      ]);

      const stripeSubscriptions = stripeSubscriptionsResult.data || [];

      const subscriptionMix = Object.entries(
        stripeSubscriptions.reduce((acc: any, sub) => {
          const plan = sub.plan || "unknown";
          acc[plan] = (acc[plan] || 0) + 1;
          return acc;
        }, {}),
      ).map(([plan, count]) => ({ plan, count: count as number }));

      const invoices = invoicesResult.data || [];
      const now = new Date();
      const invoicesDue = invoices.filter(
        (i) => i.status === "sent" && i.due_date && new Date(i.due_date) <= now,
      ).length;

      const outstandingIssues = invoices.filter(
        (i) => i.status === "overdue",
      ).length;

      const projects = projectsResult.data || [];
      const customRevenue = projects.reduce(
        (sum, p) => sum + (Number(p.contract_value) || 0),
        0,
      );

      const mrr = (subscriptionsResult.data || []).reduce(
        (sum, s) => sum + (Number(s.mrr) || 0),
        0,
      );
      const recurringRevenue = mrr * 12;

      const totalRevenue = customRevenue + recurringRevenue;

      return {
        subscriptionMix,
        invoicesDue,
        outstandingIssues,
        customRevenue,
        recurringRevenue,
        totalRevenue,
      };
    } catch (error) {
      console.error("Failed to fetch billing snapshot:", error);
      throw error;
    }
  },

  async getOperationalAlerts(
    organizationId?: string,
  ): Promise<OperationalAlert[]> {
    try {
      const alerts: OperationalAlert[] = [];

      const [milestonesResult, ticketsResult, orgsResult, proposalsResult] =
        await Promise.all([
          supabase
            .from("bb_milestones")
            .select("id, title, due_date, project_id, bb_projects(name)")
            .eq("status", "in_progress")
            .lt("due_date", new Date().toISOString()),
          (organizationId
            ? supabase
                .from("bb_support_tickets")
                .select("id, title, priority")
                .eq("organization_id", organizationId)
            : supabase.from("bb_support_tickets").select("id, title, priority")
          )
            .eq("priority", "urgent")
            .in("status", ["open", "in_progress"]),
          supabase
            .from("bb_organizations")
            .select("id, name, onboarding_status")
            .eq("type", "client")
            .eq("onboarding_completed", false),
          (organizationId
            ? supabase
                .from("bb_proposals")
                .select("id, title, sent_at")
                .eq("organization_id", organizationId)
            : supabase.from("bb_proposals").select("id, title, sent_at")
          )
            .eq("status", "sent")
            .lt(
              "sent_at",
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            ),
        ]);

      (milestonesResult.data || []).forEach((m) => {
        alerts.push({
          id: `milestone-${m.id}`,
          type: "milestone",
          severity: "high",
          title: "Overdue Milestone",
          description: `${(m.projects as any)?.name || "Project"}: ${m.title}`,
          link: `/app/delivery/${m.project_id}`,
          created_at: m.due_date,
        });
      });

      (ticketsResult.data || []).forEach((t) => {
        alerts.push({
          id: `ticket-${t.id}`,
          type: "ticket",
          severity: "critical",
          title: "Urgent Support Ticket",
          description: t.title,
          link: `/app/support/${t.id}`,
          created_at: new Date().toISOString(),
        });
      });

      (orgsResult.data || []).slice(0, 5).forEach((o) => {
        if (o.onboarding_status === "in_progress") {
          alerts.push({
            id: `onboarding-${o.id}`,
            type: "onboarding",
            severity: "medium",
            title: "Incomplete Onboarding",
            description: `${o.name} has not completed setup`,
            link: `/app/clients/${o.id}`,
            created_at: new Date().toISOString(),
          });
        }
      });

      (proposalsResult.data || []).forEach((p) => {
        alerts.push({
          id: `proposal-${p.id}`,
          type: "proposal",
          severity: "medium",
          title: "Proposal Awaiting Response",
          description: `${p.title} sent over 7 days ago`,
          link: `/app/proposals/${p.id}`,
          created_at: p.sent_at,
        });
      });

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    } catch (error) {
      console.error("Failed to fetch operational alerts:", error);
      throw error;
    }
  },

  async getRecentActivity(organizationId?: string): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [
        leadsResult,
        proposalsResult,
        projectsResult,
        ticketsResult,
        invoicesResult,
      ] = await Promise.all([
        supabase
          .from("bb_leads")
          .select("id, company_name, created_at")
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5),
        (organizationId
          ? supabase
              .from("bb_proposals")
              .select("id, title, approved_at")
              .eq("organization_id", organizationId)
          : supabase.from("bb_proposals").select("id, title, approved_at")
        )
          .eq("status", "approved")
          .gte("approved_at", sevenDaysAgo.toISOString())
          .order("approved_at", { ascending: false })
          .limit(5),
        (organizationId
          ? supabase
              .from("bb_projects")
              .select("id, name, created_at")
              .eq("organization_id", organizationId)
          : supabase.from("bb_projects").select("id, name, created_at")
        )
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5),
        (organizationId
          ? supabase
              .from("bb_support_tickets")
              .select("id, title, created_at")
              .eq("organization_id", organizationId)
          : supabase.from("bb_support_tickets").select("id, title, created_at")
        )
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5),
        (organizationId
          ? supabase
              .from("bb_invoices")
              .select("id, invoice_number, paid_at")
              .eq("organization_id", organizationId)
          : supabase.from("bb_invoices").select("id, invoice_number, paid_at")
        )
          .eq("status", "paid")
          .gte("paid_at", sevenDaysAgo.toISOString())
          .order("paid_at", { ascending: false })
          .limit(5),
      ]);

      (leadsResult.data || []).forEach((l) => {
        activities.push({
          id: `lead-${l.id}`,
          type: "lead",
          title: "New Lead",
          description: l.company_name || "Unnamed Company",
          link: `/app/leads/${l.id}`,
          timestamp: l.created_at,
          icon: "Users",
        });
      });

      (proposalsResult.data || []).forEach((p) => {
        activities.push({
          id: `proposal-${p.id}`,
          type: "proposal",
          title: "Proposal Approved",
          description: p.title,
          link: `/app/proposals/${p.id}`,
          timestamp: p.approved_at,
          icon: "CheckCircle2",
        });
      });

      (projectsResult.data || []).forEach((p) => {
        activities.push({
          id: `project-${p.id}`,
          type: "project",
          title: "New Project Created",
          description: p.name,
          link: `/app/projects/${p.id}`,
          timestamp: p.created_at,
          icon: "Package",
        });
      });

      (ticketsResult.data || []).forEach((t) => {
        activities.push({
          id: `ticket-${t.id}`,
          type: "ticket",
          title: "Support Ticket Opened",
          description: t.title,
          link: `/app/support/${t.id}`,
          timestamp: t.created_at,
          icon: "MessageSquare",
        });
      });

      (invoicesResult.data || []).forEach((i) => {
        activities.push({
          id: `invoice-${i.id}`,
          type: "invoice",
          title: "Invoice Paid",
          description: i.invoice_number,
          link: `/app/billing`,
          timestamp: i.paid_at,
          icon: "DollarSign",
        });
      });

      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 15);
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      throw error;
    }
  },

  async getExecutiveDashboard(organizationId?: string) {
    const [kpis, sales, delivery, clientHealth, billing, alerts, activity] =
      await Promise.all([
        this.getExecutiveKPIs(organizationId),
        this.getSalesSnapshot(organizationId),
        this.getDeliverySnapshot(organizationId),
        this.getClientHealthSnapshot(organizationId),
        this.getBillingSnapshot(organizationId),
        this.getOperationalAlerts(organizationId),
        this.getRecentActivity(organizationId),
      ]);

    return {
      kpis,
      sales,
      delivery,
      clientHealth,
      billing,
      alerts,
      activity,
    };
  },
};
