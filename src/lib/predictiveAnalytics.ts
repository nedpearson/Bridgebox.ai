import { supabase } from './supabase';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConversionLikelihood = 'low' | 'medium' | 'high' | 'very_high';

export interface LeadPrediction {
  leadId: string;
  conversionLikelihood: ConversionLikelihood;
  estimatedDealValue: number;
  confidenceScore: number;
  factors: string[];
  daysToClose: number;
}

export interface ProjectRiskPrediction {
  projectId: string;
  riskLevel: RiskLevel;
  delayProbability: number;
  estimatedDelayDays: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface ClientChurnPrediction {
  clientId: string;
  churnRisk: RiskLevel;
  churnProbability: number;
  riskFactors: string[];
  retentionActions: string[];
  healthScore: number;
}

export interface RevenueForecast {
  month: string;
  predictedMRR: number;
  predictedProjectRevenue: number;
  totalPredicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

class PredictiveAnalyticsEngine {
  async predictLeadConversion(leadId: string, organizationId?: string): Promise<LeadPrediction> {
    let query_lead = supabase.from('bb_leads')
      .select('*, organization:organizations(*)')
      .eq('id', leadId);
    if (organizationId) query_lead = query_lead.eq('organization_id', organizationId);
    const { data: lead } = await query_lead.single();

    if (!lead) {
      throw new Error('Lead not found');
    }

    const factors: string[] = [];
    let score = 50;

    if (lead.status === 'qualified') {
      score += 20;
      factors.push('Lead is qualified');
    }

    if (lead.company_size && lead.company_size > 50) {
      score += 15;
      factors.push('Enterprise-size company');
    } else if (lead.company_size && lead.company_size > 10) {
      score += 10;
      factors.push('Mid-market company');
    }

    if (lead.estimated_budget && lead.estimated_budget > 50000) {
      score += 15;
      factors.push('High budget potential');
    } else if (lead.estimated_budget && lead.estimated_budget > 10000) {
      score += 10;
      factors.push('Good budget range');
    }

    if (lead.source === 'referral') {
      score += 15;
      factors.push('Referral source (high conversion)');
    } else if (lead.source === 'inbound') {
      score += 10;
      factors.push('Inbound lead (good intent)');
    }

    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreated < 7) {
      score += 10;
      factors.push('Fresh lead (active interest)');
    } else if (daysSinceCreated > 30) {
      score -= 10;
      factors.push('Aging lead (may need re-engagement)');
    }

    const { data: existingProposal } = await supabase
      .from('bb_proposals')
      .select('id')
      .eq('lead_id', leadId)
      .single();

    if (existingProposal) {
      score += 20;
      factors.push('Proposal already sent');
    }

    score = Math.max(0, Math.min(100, score));

    let likelihood: ConversionLikelihood = 'low';
    if (score >= 80) likelihood = 'very_high';
    else if (score >= 60) likelihood = 'high';
    else if (score >= 40) likelihood = 'medium';

    const baseCloseDays = 30;
    const daysToClose = likelihood === 'very_high' ? 14 :
                       likelihood === 'high' ? 21 :
                       likelihood === 'medium' ? 30 : 45;

    const estimatedDealValue = lead.estimated_budget ||
      (lead.company_size ? lead.company_size * 1000 : 25000);

    return {
      leadId,
      conversionLikelihood: likelihood,
      estimatedDealValue,
      confidenceScore: score,
      factors,
      daysToClose,
    };
  }

  async predictLeadConversionBatch(
    organizationId?: string
  ): Promise<LeadPrediction[]> {
    let query = supabase
      .from('bb_leads')
      .select('id')
      .in('status', ['new', 'contacted', 'qualified']);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: leads } = await query.limit(100);

    if (!leads) return [];

    const predictions = await Promise.all(
      leads.map(lead => this.predictLeadConversion(lead.id, organizationId))
    );

    return predictions;
  }

  async predictProjectDelay(projectId: string, organizationId?: string): Promise<ProjectRiskPrediction> {
    let query_project = supabase.from('bb_projects')
      .select('*')
      .eq('id', projectId);
    if (organizationId) query_project = query_project.eq('organization_id', organizationId);
    const { data: project } = await query_project.single();

    if (!project) {
      throw new Error('Project not found');
    }

    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    if (project.health_status === 'poor') {
      riskScore += 40;
      riskFactors.push('Project health is poor');
      recommendations.push('Conduct immediate health assessment');
    } else if (project.health_status === 'at_risk') {
      riskScore += 25;
      riskFactors.push('Project marked at risk');
      recommendations.push('Review project constraints and resources');
    }

    const { data: milestones } = await supabase
      .from('bb_project_milestones')
      .select('*')
      .eq('project_id', projectId);

    if (milestones) {
      const overdueMilestones = milestones.filter(m => {
        if (!m.due_date || m.status === 'completed') return false;
        return new Date(m.due_date) < new Date();
      });

      if (overdueMilestones.length > 0) {
        riskScore += overdueMilestones.length * 10;
        riskFactors.push(`${overdueMilestones.length} overdue milestones`);
        recommendations.push('Reassess milestone timeline and dependencies');
      }

      const completionRate = milestones.length > 0
        ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100
        : 0;

      if (completionRate < 30) {
        riskScore += 15;
        riskFactors.push('Low milestone completion rate');
        recommendations.push('Accelerate milestone delivery');
      }
    }

    let query_openTickets = supabase.from('bb_support_tickets')
      .select('id')
      .eq('project_id', projectId)
      .in('status', ['open', 'in_progress']);
    if (organizationId) query_openTickets = query_openTickets.eq('organization_id', organizationId);
    const { data: openTickets } = await query_openTickets;

    if (openTickets && openTickets.length > 5) {
      riskScore += 15;
      riskFactors.push(`${openTickets.length} open support tickets`);
      recommendations.push('Address outstanding support issues');
    }

    if (project.end_date) {
      const daysUntilDeadline = Math.floor(
        (new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline < 7 && project.status !== 'completed') {
        riskScore += 30;
        riskFactors.push('Deadline approaching (less than 7 days)');
        recommendations.push('Consider timeline adjustment or scope reduction');
      } else if (daysUntilDeadline < 14 && project.status !== 'completed') {
        riskScore += 20;
        riskFactors.push('Deadline approaching (less than 2 weeks)');
      }
    }

    const completionPercentage = project.completion_percentage || 0;
    if (completionPercentage < 50 && project.status === 'in_progress') {
      const daysActive = Math.floor(
        (Date.now() - new Date(project.start_date || project.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      if (daysActive > 30) {
        riskScore += 20;
        riskFactors.push('Slow progress (less than 50% after 30 days)');
        recommendations.push('Review team capacity and blockers');
      }
    }

    riskScore = Math.min(100, riskScore);

    let riskLevel: RiskLevel = 'low';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    const estimatedDelayDays = riskLevel === 'critical' ? 30 :
                               riskLevel === 'high' ? 14 :
                               riskLevel === 'medium' ? 7 : 0;

    return {
      projectId,
      riskLevel,
      delayProbability: riskScore,
      estimatedDelayDays,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors detected'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring project health'],
    };
  }

  async predictProjectDelayBatch(
    organizationId?: string
  ): Promise<ProjectRiskPrediction[]> {
    let query = supabase
      .from('bb_projects')
      .select('id')
      .eq('status', 'in_progress');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: projects } = await query.limit(100);

    if (!projects) return [];

    const predictions = await Promise.all(
      projects.map(project => this.predictProjectDelay(project.id, organizationId))
    );

    return predictions;
  }

  async predictClientRisk(clientId: string, organizationId?: string): Promise<ClientChurnPrediction> {
    let query_client = supabase.from('bb_organizations')
      .select('*')
      .eq('id', clientId)
      .eq('type', 'client');
    if (organizationId) query_client = query_client.eq('organization_id', organizationId);
    const { data: client } = await query_client.single();

    if (!client) {
      throw new Error('Client not found');
    }

    const riskFactors: string[] = [];
    const retentionActions: string[] = [];
    let riskScore = 0;

    const { data: healthScore } = await supabase
      .from('bb_client_health_scores')
      .select('*')
      .eq('organization_id', clientId)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    let currentHealthScore = 70;

    if (healthScore) {
      currentHealthScore = healthScore.overall_score;

      if (healthScore.overall_score < 50) {
        riskScore += 40;
        riskFactors.push('Very low health score');
        retentionActions.push('Schedule executive check-in immediately');
      } else if (healthScore.overall_score < 70) {
        riskScore += 25;
        riskFactors.push('Below-average health score');
        retentionActions.push('Conduct health assessment meeting');
      }

      if (healthScore.engagement_score < 50) {
        riskScore += 20;
        riskFactors.push('Low engagement');
        retentionActions.push('Increase touchpoints and communication');
      }

      if (healthScore.satisfaction_score < 50) {
        riskScore += 25;
        riskFactors.push('Low satisfaction score');
        retentionActions.push('Address satisfaction concerns urgently');
      }
    }

    let query_openTickets = supabase.from('bb_support_tickets')
      .select('id, priority')
      .eq('organization_id', clientId)
      .in('status', ['open', 'in_progress']);
    if (organizationId) query_openTickets = query_openTickets.eq('organization_id', organizationId);
    const { data: openTickets } = await query_openTickets;

    if (openTickets) {
      const highPriorityTickets = openTickets.filter(t => t.priority === 'urgent' || t.priority === 'high');

      if (highPriorityTickets.length > 3) {
        riskScore += 30;
        riskFactors.push(`${highPriorityTickets.length} high-priority open tickets`);
        retentionActions.push('Resolve urgent support issues immediately');
      } else if (openTickets.length > 5) {
        riskScore += 20;
        riskFactors.push(`${openTickets.length} open support tickets`);
        retentionActions.push('Reduce ticket backlog');
      }
    }

    const { data: subscription } = await supabase
      .from('bb_subscriptions')
      .select('*')
      .eq('organization_id', clientId)
      .single();

    if (subscription) {
      if (subscription.status === 'past_due') {
        riskScore += 35;
        riskFactors.push('Payment past due');
        retentionActions.push('Contact regarding payment immediately');
      } else if (subscription.status === 'canceled') {
        riskScore += 100;
        riskFactors.push('Subscription already canceled');
        retentionActions.push('Win-back campaign');
      }
    }

    let query_recentActivity = supabase.from('bb_activity_logs')
      .select('id')
      .eq('organization_id', clientId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    if (organizationId) query_recentActivity = query_recentActivity.eq('organization_id', organizationId);
    const { data: recentActivity } = await query_recentActivity;

    if (!recentActivity || recentActivity.length < 5) {
      riskScore += 25;
      riskFactors.push('Low activity in last 30 days');
      retentionActions.push('Re-engage with value demonstration');
    }

    let query_activeProjects = supabase.from('bb_projects')
      .select('id')
      .eq('organization_id', clientId)
      .eq('status', 'in_progress');
    if (organizationId) query_activeProjects = query_activeProjects.eq('organization_id', organizationId);
    const { data: activeProjects } = await query_activeProjects;

    if (!activeProjects || activeProjects.length === 0) {
      riskScore += 15;
      riskFactors.push('No active projects');
      retentionActions.push('Explore new project opportunities');
    }

    riskScore = Math.min(100, riskScore);

    let churnRisk: RiskLevel = 'low';
    if (riskScore >= 70) churnRisk = 'critical';
    else if (riskScore >= 50) churnRisk = 'high';
    else if (riskScore >= 30) churnRisk = 'medium';

    return {
      clientId,
      churnRisk,
      churnProbability: riskScore,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant churn risk detected'],
      retentionActions: retentionActions.length > 0 ? retentionActions : ['Continue regular engagement'],
      healthScore: currentHealthScore,
    };
  }

  async predictClientRiskBatch(
    organizationId?: string
  ): Promise<ClientChurnPrediction[]> {
    const query = supabase
      .from('bb_organizations')
      .select('id')
      .eq('type', 'client')
      .eq('status', 'active');

    const { data: clients } = await query.limit(100);

    if (!clients) return [];

    const predictions = await Promise.all(
      clients.map(client => this.predictClientRisk(client.id, organizationId))
    );

    return predictions;
  }

  async forecastRevenue(organizationId?: string, months: number = 6): Promise<RevenueForecast[]> {
    const { data: historicalMRR } = await supabase
      .from('bb_subscriptions')
      .select('monthly_amount, created_at, status')
      .eq('status', 'active');

    const { data: historicalInvoices } = await supabase
      .from('bb_invoices')
      .select('amount, created_at, status')
      .eq('status', 'paid')
      .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

    const currentMRR = historicalMRR?.reduce((sum, sub) => sum + (sub.monthly_amount || 0), 0) || 0;

    const last90DaysRevenue = historicalInvoices
      ?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      })
      .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    const avgProjectRevenuePerMonth = last90DaysRevenue / 3;

    const mrrGrowthRate = historicalMRR && historicalMRR.length > 0 ? 0.05 : 0;

    const forecasts: RevenueForecast[] = [];

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const monthStr = forecastDate.toISOString().substring(0, 7);

      const projectedMRR = currentMRR * Math.pow(1 + mrrGrowthRate, i);
      const projectedProjectRevenue = avgProjectRevenuePerMonth * (1 + (i * 0.02));
      const totalPredicted = projectedMRR + projectedProjectRevenue;

      const confidence = Math.max(50, 90 - (i * 5));

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (i > 1 && forecasts[i - 2]) {
        const prevTotal = forecasts[i - 2].totalPredicted;
        if (totalPredicted > prevTotal * 1.05) trend = 'up';
        else if (totalPredicted < prevTotal * 0.95) trend = 'down';
      } else {
        trend = 'up';
      }

      forecasts.push({
        month: monthStr,
        predictedMRR: Math.round(projectedMRR),
        predictedProjectRevenue: Math.round(projectedProjectRevenue),
        totalPredicted: Math.round(totalPredicted),
        confidence,
        trend,
      });
    }

    return forecasts;
  }

  async generateExecutivePredictions(organizationId?: string) {
    const [
      leadPredictions,
      projectRisks,
      clientRisks,
      revenueForecast,
    ] = await Promise.all([
      this.predictLeadConversionBatch(organizationId),
      this.predictProjectDelayBatch(organizationId),
      this.predictClientRiskBatch(organizationId),
      this.forecastRevenue(organizationId, 6),
    ]);

    const highValueLeads = leadPredictions
      .filter(p => p.conversionLikelihood === 'very_high' || p.conversionLikelihood === 'high')
      .sort((a, b) => b.estimatedDealValue - a.estimatedDealValue)
      .slice(0, 10);

    const criticalProjects = projectRisks
      .filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high')
      .sort((a, b) => b.delayProbability - a.delayProbability);

    const atRiskClients = clientRisks
      .filter(c => c.churnRisk === 'critical' || c.churnRisk === 'high')
      .sort((a, b) => b.churnProbability - a.churnProbability);

    const next90DaysRevenue = revenueForecast
      .slice(0, 3)
      .reduce((sum, f) => sum + f.totalPredicted, 0);

    return {
      highValueLeads,
      criticalProjects,
      atRiskClients,
      revenueForecast,
      summary: {
        totalHighValueLeads: highValueLeads.length,
        potentialRevenue: highValueLeads.reduce((sum, l) => sum + l.estimatedDealValue, 0),
        projectsAtRisk: criticalProjects.length,
        clientsAtRisk: atRiskClients.length,
        next90DaysRevenue,
      },
    };
  }
}

export const predictiveAnalytics = new PredictiveAnalyticsEngine();
