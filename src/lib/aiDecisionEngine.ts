import { supabase } from './supabase';
import { trendDetection } from './trendDetection';
import { predictiveAnalytics } from './predictiveAnalytics';

export type InsightType = 'sales' | 'project' | 'client' | 'automation' | 'strategic';
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';
export type InsightCategory = 'opportunity' | 'risk' | 'optimization' | 'alert';

export interface AIInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  reasoning: string;
  recommendation: string;
  actionItems: string[];
  metadata: Record<string, any>;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface SalesRecommendation {
  leadId: string;
  leadName: string;
  score: number;
  reason: string;
  suggestedAction: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedValue: number;
  followUpDate?: string;
}

export interface ProjectRecommendation {
  projectId: string;
  projectName: string;
  issue: string;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedResources?: string[];
  timeline?: string;
}

export interface ClientRecommendation {
  clientId: string;
  clientName: string;
  type: 'upsell' | 'retention' | 'engagement';
  recommendation: string;
  value: number;
  confidence: number;
}

export interface AutomationRecommendation {
  workflow: string;
  frequency: number;
  timeSaved: number;
  complexity: 'low' | 'medium' | 'high';
  roi: number;
  priority: number;
}

export interface StrategicInsight {
  insight: string;
  evidence: string[];
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
}

class AIDecisionEngine {
  private generateId(): string {
    return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async analyzeSalesOpportunities(): Promise<SalesRecommendation[]> {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .in('status', ['new', 'contacted', 'qualified', 'proposal_sent'])
      .order('created_at', { ascending: false });

    if (!leads) return [];

    const recommendations: SalesRecommendation[] = [];

    for (const lead of leads) {
      let score = 50;
      const reasons: string[] = [];
      let urgency: 'low' | 'medium' | 'high' = 'low';
      let suggestedAction = 'Review and prioritize';

      const daysOld = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const lastContactDays = lead.last_contact_date
        ? (Date.now() - new Date(lead.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
        : daysOld;

      if (lead.estimated_budget > 50000) {
        score += 20;
        reasons.push('High-value opportunity');
      }

      if (lead.status === 'qualified') {
        score += 15;
        reasons.push('Already qualified');
        suggestedAction = 'Send proposal immediately';
        urgency = 'high';
      }

      if (lead.status === 'proposal_sent' && daysOld > 7) {
        score += 25;
        reasons.push('Proposal pending for over a week');
        suggestedAction = 'Follow up on proposal status';
        urgency = 'critical' as any;
      }

      if (lastContactDays > 5 && lead.status !== 'new') {
        score += 10;
        reasons.push('No recent contact');
        suggestedAction = 'Schedule follow-up call';
        urgency = urgency === 'low' ? 'medium' : urgency;
      }

      if (lead.urgency === 'urgent') {
        score += 20;
        reasons.push('Client indicated urgency');
        urgency = 'high';
      }

      if (['healthcare', 'finance', 'logistics'].includes(lead.industry)) {
        score += 5;
        reasons.push('High-converting industry');
      }

      if (daysOld < 2) {
        score += 10;
        reasons.push('Fresh lead');
        suggestedAction = 'Initial contact within 24 hours';
        urgency = urgency === 'low' ? 'medium' : urgency;
      }

      let followUpDate: string | undefined;
      if (urgency === 'high' || urgency === 'critical') {
        followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (urgency === 'medium') {
        followUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      }

      if (score >= 60) {
        recommendations.push({
          leadId: lead.id,
          leadName: lead.company_name || lead.name || 'Unknown',
          score: Math.min(score, 100),
          reason: reasons.join('; '),
          suggestedAction,
          urgency: urgency === 'critical' ? 'high' : urgency,
          estimatedValue: lead.estimated_budget || 0,
          followUpDate,
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  async analyzeProjectRisks(): Promise<ProjectRecommendation[]> {
    const { data: projects } = await supabase
      .from('projects')
      .select('*, project_deliveries(*)')
      .in('status', ['in_progress', 'planning']);

    if (!projects) return [];

    const recommendations: ProjectRecommendation[] = [];

    for (const project of projects) {
      const startDate = new Date(project.start_date);
      const endDate = new Date(project.target_end_date);
      const now = new Date();
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const percentComplete = (elapsedDays / totalDays) * 100;

      if (percentComplete > 75 && project.status === 'planning') {
        recommendations.push({
          projectId: project.id,
          projectName: project.name,
          issue: 'Project still in planning phase but nearing deadline',
          recommendation: 'Move to execution immediately or revise timeline',
          riskLevel: 'high',
          timeline: 'Immediate action required',
        });
      }

      const deliveries = project.project_deliveries || [];
      const overdueCount = deliveries.filter((d: any) => {
        return d.status !== 'completed' && new Date(d.due_date) < now;
      }).length;

      if (overdueCount > 0) {
        recommendations.push({
          projectId: project.id,
          projectName: project.name,
          issue: `${overdueCount} deliverable(s) overdue`,
          recommendation: 'Review resource allocation and reassign tasks',
          riskLevel: overdueCount > 2 ? 'high' : 'medium',
          suggestedResources: ['Project manager review', 'Additional developer support'],
        });
      }

      if (project.budget && project.budget < 10000 && totalDays > 90) {
        recommendations.push({
          projectId: project.id,
          projectName: project.name,
          issue: 'Low budget for extended timeline',
          recommendation: 'Reduce scope or negotiate budget increase',
          riskLevel: 'medium',
        });
      }

      if (elapsedDays > 30 && project.status === 'planning') {
        recommendations.push({
          projectId: project.id,
          projectName: project.name,
          issue: 'Extended planning phase',
          recommendation: 'Accelerate planning or break into phases',
          riskLevel: 'medium',
          timeline: 'Within 1 week',
        });
      }
    }

    return recommendations.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    });
  }

  async analyzeClientOpportunities(): Promise<ClientRecommendation[]> {
    const { data: organizations } = await supabase
      .from('organizations')
      .select('*, projects(*), subscriptions(*)');

    if (!organizations) return [];

    const recommendations: ClientRecommendation[] = [];

    for (const org of organizations) {
      const projects = org.projects || [];
      const completedProjects = projects.filter((p: any) => p.status === 'completed');
      const activeProjects = projects.filter((p: any) => p.status === 'in_progress');

      if (completedProjects.length > 0 && activeProjects.length === 0) {
        const lastProjectDate = Math.max(
          ...completedProjects.map((p: any) => new Date(p.updated_at).getTime())
        );
        const daysSinceLastProject = (Date.now() - lastProjectDate) / (1000 * 60 * 60 * 24);

        if (daysSinceLastProject > 60 && daysSinceLastProject < 180) {
          recommendations.push({
            clientId: org.id,
            clientName: org.name,
            type: 'engagement',
            recommendation: 'Re-engage client with new service offering',
            value: completedProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) * 0.5,
            confidence: 0.7,
          });
        }
      }

      if (activeProjects.length >= 2) {
        const totalValue = activeProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
        if (totalValue > 50000) {
          recommendations.push({
            clientId: org.id,
            clientName: org.name,
            type: 'upsell',
            recommendation: 'Client is highly engaged - offer premium support or additional services',
            value: totalValue * 0.3,
            confidence: 0.8,
          });
        }
      }

      const subscription = org.subscriptions?.[0];
      if (subscription && subscription.status === 'active') {
        if (subscription.plan === 'starter' && projects.length > 3) {
          recommendations.push({
            clientId: org.id,
            clientName: org.name,
            type: 'upsell',
            recommendation: 'Client activity suggests need for higher tier plan',
            value: 500 * 12,
            confidence: 0.75,
          });
        }
      }

      if (projects.length === 0 && org.subscription_tier === 'premium') {
        recommendations.push({
          clientId: org.id,
          clientName: org.name,
          type: 'retention',
          recommendation: 'Premium client with no active projects - risk of churn',
          value: 0,
          confidence: 0.6,
        });
      }
    }

    return recommendations.sort((a, b) => (b.confidence * b.value) - (a.confidence * a.value));
  }

  async analyzeAutomationOpportunities(): Promise<AutomationRecommendation[]> {
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('action, user_id, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!activityLogs) return [];

    const actionFrequency = new Map<string, number>();
    activityLogs.forEach(log => {
      actionFrequency.set(log.action, (actionFrequency.get(log.action) || 0) + 1);
    });

    const recommendations: AutomationRecommendation[] = [];

    const automationRules = [
      {
        pattern: /lead.*created/i,
        workflow: 'Auto-assign leads to sales team',
        timeSaved: 15,
        complexity: 'low' as const,
      },
      {
        pattern: /proposal.*sent/i,
        workflow: 'Auto-schedule follow-up reminders',
        timeSaved: 30,
        complexity: 'low' as const,
      },
      {
        pattern: /project.*completed/i,
        workflow: 'Auto-trigger satisfaction survey',
        timeSaved: 20,
        complexity: 'medium' as const,
      },
      {
        pattern: /invoice.*overdue/i,
        workflow: 'Auto-send payment reminders',
        timeSaved: 45,
        complexity: 'low' as const,
      },
      {
        pattern: /ticket.*created/i,
        workflow: 'Auto-categorize and route support tickets',
        timeSaved: 10,
        complexity: 'medium' as const,
      },
      {
        pattern: /milestone.*completed/i,
        workflow: 'Auto-notify stakeholders and update status',
        timeSaved: 25,
        complexity: 'low' as const,
      },
    ];

    actionFrequency.forEach((frequency, action) => {
      for (const rule of automationRules) {
        if (rule.pattern.test(action) && frequency > 10) {
          const monthlyTimeSaved = frequency * rule.timeSaved;
          const complexityFactor = rule.complexity === 'low' ? 1 : rule.complexity === 'medium' ? 0.7 : 0.4;
          const roi = (monthlyTimeSaved / 60) * 50 * complexityFactor;

          recommendations.push({
            workflow: rule.workflow,
            frequency,
            timeSaved: monthlyTimeSaved,
            complexity: rule.complexity,
            roi,
            priority: roi > 500 ? 100 : roi > 200 ? 75 : 50,
          });
        }
      }
    });

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  async generateStrategicInsights(): Promise<StrategicInsight[]> {
    const [trends, serviceDemand, industryGrowth] = await Promise.all([
      trendDetection.getHotOpportunities(),
      trendDetection.detectTrendingServices(90),
      trendDetection.detectIndustryGrowth(90),
    ]);

    const insights: StrategicInsight[] = [];

    if (trends.hotServices.length > 0) {
      const topService = trends.hotServices[0];
      if (topService.growthRate > 50) {
        insights.push({
          insight: `${topService.serviceType.replace('_', ' ')} demand surging by ${topService.growthRate.toFixed(0)}%`,
          evidence: [
            `${topService.currentPeriodCount} leads in last 90 days`,
            `$${(topService.totalRevenue / 1000).toFixed(0)}K in potential revenue`,
            `${topService.strength} growth momentum`,
          ],
          recommendation: 'Increase marketing spend and sales focus on this service line',
          impact: 'high',
          timeframe: 'Next 30-60 days',
        });
      }
    }

    if (trends.hotIndustries.length > 0) {
      const topIndustry = trends.hotIndustries[0];
      if (topIndustry.growthRate > 60 && topIndustry.conversionRate > 30) {
        insights.push({
          insight: `${topIndustry.industry} industry shows exceptional growth and conversion`,
          evidence: [
            `${topIndustry.growthRate.toFixed(0)}% growth rate`,
            `${topIndustry.conversionRate.toFixed(0)}% conversion rate`,
            `${topIndustry.currentPeriodCount} active leads`,
          ],
          recommendation: 'Develop industry-specific case studies and specialized service packages',
          impact: 'high',
          timeframe: 'Next 60-90 days',
        });
      }
    }

    const decliningServices = serviceDemand.filter(s => s.direction === 'down' && s.growthRate < -30);
    if (decliningServices.length > 0) {
      const declining = decliningServices[0];
      insights.push({
        insight: `${declining.serviceType.replace('_', ' ')} demand declining significantly`,
        evidence: [
          `${Math.abs(declining.growthRate).toFixed(0)}% decrease`,
          `Only ${declining.currentPeriodCount} leads vs ${declining.previousPeriodCount} prior`,
        ],
        recommendation: 'Re-evaluate pricing, positioning, or consider phasing out',
        impact: 'medium',
        timeframe: 'Next 30 days',
      });
    }

    if (trends.emergingKeywords.length > 3) {
      const keywords = trends.emergingKeywords.slice(0, 3).map((k: any) => k.keyword).join(', ');
      insights.push({
        insight: `Multiple emerging demand signals detected: ${keywords}`,
        evidence: trends.emergingKeywords.slice(0, 3).map((k: any) => `${k.keyword}: ${k.frequency} mentions`),
        recommendation: 'Research market viability and consider service expansion',
        impact: 'medium',
        timeframe: 'Next 90 days',
      });
    }

    const lowConversionIndustries = industryGrowth.filter(
      i => i.currentPeriodCount > 5 && i.conversionRate < 20
    );
    if (lowConversionIndustries.length > 0) {
      const industry = lowConversionIndustries[0];
      insights.push({
        insight: `${industry.industry} has low conversion despite lead volume`,
        evidence: [
          `${industry.currentPeriodCount} leads`,
          `Only ${industry.conversionRate.toFixed(0)}% conversion rate`,
        ],
        recommendation: 'Improve qualification process or adjust targeting for this industry',
        impact: 'medium',
        timeframe: 'Next 30 days',
      });
    }

    return insights;
  }

  async generateInsights(): Promise<AIInsight[]> {
    const [
      salesRecs,
      projectRecs,
      clientRecs,
      automationRecs,
      strategicInsights,
    ] = await Promise.all([
      this.analyzeSalesOpportunities(),
      this.analyzeProjectRisks(),
      this.analyzeClientOpportunities(),
      this.analyzeAutomationOpportunities(),
      this.generateStrategicInsights(),
    ]);

    const insights: AIInsight[] = [];

    salesRecs.slice(0, 3).forEach(rec => {
      insights.push({
        id: this.generateId(),
        type: 'sales',
        category: 'opportunity',
        priority: rec.urgency === 'high' ? 'high' : 'medium',
        title: `Prioritize lead: ${rec.leadName}`,
        description: `Lead scored ${rec.score}/100 and requires attention`,
        reasoning: rec.reason,
        recommendation: rec.suggestedAction,
        actionItems: [
          rec.suggestedAction,
          rec.followUpDate ? `Follow up by ${new Date(rec.followUpDate).toLocaleDateString()}` : 'Schedule follow-up',
        ],
        metadata: {
          leadId: rec.leadId,
          estimatedValue: rec.estimatedValue,
          score: rec.score,
        },
        confidence: rec.score / 100,
        impact: rec.estimatedValue > 50000 ? 'high' : rec.estimatedValue > 20000 ? 'medium' : 'low',
        createdAt: new Date().toISOString(),
      });
    });

    projectRecs.slice(0, 3).forEach(rec => {
      insights.push({
        id: this.generateId(),
        type: 'project',
        category: rec.riskLevel === 'high' ? 'risk' : 'optimization',
        priority: rec.riskLevel === 'high' ? 'high' : 'medium',
        title: `Project attention needed: ${rec.projectName}`,
        description: rec.issue,
        reasoning: `Risk level: ${rec.riskLevel}. ${rec.issue}`,
        recommendation: rec.recommendation,
        actionItems: [
          rec.recommendation,
          ...(rec.suggestedResources || []),
        ],
        metadata: {
          projectId: rec.projectId,
          riskLevel: rec.riskLevel,
        },
        confidence: rec.riskLevel === 'high' ? 0.9 : 0.7,
        impact: rec.riskLevel === 'high' ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
      });
    });

    clientRecs.slice(0, 3).forEach(rec => {
      insights.push({
        id: this.generateId(),
        type: 'client',
        category: rec.type === 'retention' ? 'risk' : 'opportunity',
        priority: rec.type === 'retention' ? 'high' : rec.confidence > 0.7 ? 'high' : 'medium',
        title: `Client ${rec.type}: ${rec.clientName}`,
        description: rec.recommendation,
        reasoning: `Confidence: ${(rec.confidence * 100).toFixed(0)}%. Potential value: $${(rec.value / 1000).toFixed(0)}K`,
        recommendation: rec.recommendation,
        actionItems: [
          rec.type === 'upsell' ? 'Schedule expansion discussion' : 'Review client engagement',
          'Prepare customized proposal',
        ],
        metadata: {
          clientId: rec.clientId,
          type: rec.type,
          value: rec.value,
        },
        confidence: rec.confidence,
        impact: rec.value > 50000 ? 'high' : rec.value > 20000 ? 'medium' : 'low',
        createdAt: new Date().toISOString(),
      });
    });

    automationRecs.slice(0, 2).forEach(rec => {
      insights.push({
        id: this.generateId(),
        type: 'automation',
        category: 'optimization',
        priority: rec.priority > 75 ? 'high' : 'medium',
        title: `Automate: ${rec.workflow}`,
        description: `Save ${rec.timeSaved} minutes/month by automating this workflow`,
        reasoning: `Occurs ${rec.frequency} times/month. ROI: $${rec.roi.toFixed(0)}/month`,
        recommendation: `Implement automation for ${rec.workflow}`,
        actionItems: [
          'Review automation requirements',
          'Configure automation rules',
          'Test and deploy',
        ],
        metadata: {
          workflow: rec.workflow,
          frequency: rec.frequency,
          timeSaved: rec.timeSaved,
          roi: rec.roi,
        },
        confidence: rec.complexity === 'low' ? 0.9 : 0.7,
        impact: rec.roi > 500 ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
      });
    });

    strategicInsights.forEach(insight => {
      insights.push({
        id: this.generateId(),
        type: 'strategic',
        category: insight.impact === 'high' ? 'opportunity' : 'optimization',
        priority: insight.impact === 'high' ? 'high' : 'medium',
        title: insight.insight,
        description: insight.recommendation,
        reasoning: insight.evidence.join(' | '),
        recommendation: insight.recommendation,
        actionItems: [
          insight.recommendation,
          `Timeframe: ${insight.timeframe}`,
        ],
        metadata: {
          evidence: insight.evidence,
          timeframe: insight.timeframe,
        },
        confidence: 0.8,
        impact: insight.impact,
        createdAt: new Date().toISOString(),
      });
    });

    return insights.sort((a, b) => {
      const priorityOrder: Record<InsightPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async getRecommendationsForContext(context: {
    type: 'lead' | 'project' | 'client';
    id: string;
  }): Promise<AIInsight[]> {
    const allInsights = await this.generateInsights();

    return allInsights.filter(insight => {
      if (context.type === 'lead' && insight.type === 'sales') {
        return insight.metadata.leadId === context.id;
      }
      if (context.type === 'project' && insight.type === 'project') {
        return insight.metadata.projectId === context.id;
      }
      if (context.type === 'client' && insight.type === 'client') {
        return insight.metadata.clientId === context.id;
      }
      return false;
    });
  }

  async getDashboardInsights(limit: number = 5): Promise<AIInsight[]> {
    const insights = await this.generateInsights();
    return insights.slice(0, limit);
  }
}

export const aiDecisionEngine = new AIDecisionEngine();
