// @ts-nocheck
import { supabase } from './supabase';

export type TrendDirection = 'up' | 'down' | 'stable';
export type TrendStrength = 'weak' | 'moderate' | 'strong' | 'explosive';

export interface ServiceTrend {
  serviceType: string;
  currentPeriodCount: number;
  previousPeriodCount: number;
  growthRate: number;
  direction: TrendDirection;
  strength: TrendStrength;
  totalRevenue: number;
  averageDealSize: number;
}

export interface IndustryTrend {
  industry: string;
  currentPeriodCount: number;
  previousPeriodCount: number;
  growthRate: number;
  direction: TrendDirection;
  strength: TrendStrength;
  totalRevenue: number;
  conversionRate: number;
}

export interface DemandSpike {
  keyword: string;
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  sources: string[];
  relatedServices: string[];
  isEmergingTrend: boolean;
}

export interface FeatureUsageTrend {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  growthRate: number;
  adoptionRate: number;
  direction: TrendDirection;
}

export interface ClientRequestPattern {
  pattern: string;
  frequency: number;
  clients: number;
  averageValue: number;
  relatedServices: string[];
  isGrowing: boolean;
}

export interface TrendInsight {
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

class TrendDetectionEngine {
  private calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private determineTrendDirection(growthRate: number): TrendDirection {
    if (growthRate > 5) return 'up';
    if (growthRate < -5) return 'down';
    return 'stable';
  }

  private determineTrendStrength(growthRate: number): TrendStrength {
    const absGrowth = Math.abs(growthRate);
    if (absGrowth > 100) return 'explosive';
    if (absGrowth > 50) return 'strong';
    if (absGrowth > 20) return 'moderate';
    return 'weak';
  }

  async detectTrendingServices(organizationId?: string, daysBack: number = 90): Promise<ServiceTrend[]> {
    const currentPeriodStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(Date.now() - (daysBack * 2) * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = currentPeriodStart;

    let query_currentLeads = supabase.from('bb_leads')
      .select('lead_type, estimated_budget')
      .gte('created_at', currentPeriodStart.toISOString());
    if (organizationId) query_currentLeads = query_currentLeads.eq('organization_id', organizationId);
    const { data: currentLeads } = await query_currentLeads;

    let query_previousLeads = supabase.from('bb_leads')
      .select('lead_type, estimated_budget')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', previousPeriodEnd.toISOString());
    if (organizationId) query_previousLeads = query_previousLeads.eq('organization_id', organizationId);
    const { data: previousLeads } = await query_previousLeads;

    const currentCounts = new Map<string, { count: number; revenue: number }>();
    const previousCounts = new Map<string, { count: number; revenue: number }>();

    currentLeads?.forEach(lead => {
      const existing = currentCounts.get(lead.lead_type) || { count: 0, revenue: 0 };
      currentCounts.set(lead.lead_type, {
        count: existing.count + 1,
        revenue: existing.revenue + (lead.estimated_budget || 0),
      });
    });

    previousLeads?.forEach(lead => {
      const existing = previousCounts.get(lead.lead_type) || { count: 0, revenue: 0 };
      previousCounts.set(lead.lead_type, {
        count: existing.count + 1,
        revenue: existing.revenue + (lead.estimated_budget || 0),
      });
    });

    const allServiceTypes = new Set([
      ...Array.from(currentCounts.keys()),
      ...Array.from(previousCounts.keys()),
    ]);

    const trends: ServiceTrend[] = [];

    allServiceTypes.forEach(serviceType => {
      const current = currentCounts.get(serviceType) || { count: 0, revenue: 0 };
      const previous = previousCounts.get(serviceType) || { count: 0, revenue: 0 };

      const growthRate = this.calculateGrowthRate(current.count, previous.count);
      const direction = this.determineTrendDirection(growthRate);
      const strength = this.determineTrendStrength(growthRate);

      trends.push({
        serviceType,
        currentPeriodCount: current.count,
        previousPeriodCount: previous.count,
        growthRate,
        direction,
        strength,
        totalRevenue: current.revenue,
        averageDealSize: current.count > 0 ? current.revenue / current.count : 0,
      });
    });

    return trends.sort((a, b) => b.growthRate - a.growthRate);
  }

  async detectIndustryGrowth(organizationId?: string, daysBack: number = 90): Promise<IndustryTrend[]> {
    const currentPeriodStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(Date.now() - (daysBack * 2) * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = currentPeriodStart;

    let query_currentLeads = supabase.from('bb_leads')
      .select('industry, estimated_budget, status')
      .gte('created_at', currentPeriodStart.toISOString());
    if (organizationId) query_currentLeads = query_currentLeads.eq('organization_id', organizationId);
    const { data: currentLeads } = await query_currentLeads;

    let query_previousLeads = supabase.from('bb_leads')
      .select('industry, estimated_budget, status')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', previousPeriodEnd.toISOString());
    if (organizationId) query_previousLeads = query_previousLeads.eq('organization_id', organizationId);
    const { data: previousLeads } = await query_previousLeads;

    const currentCounts = new Map<string, { count: number; revenue: number; converted: number }>();
    const previousCounts = new Map<string, { count: number; revenue: number; converted: number }>();

    currentLeads?.forEach(lead => {
      if (!lead.industry) return;
      const existing = currentCounts.get(lead.industry) || { count: 0, revenue: 0, converted: 0 };
      currentCounts.set(lead.industry, {
        count: existing.count + 1,
        revenue: existing.revenue + (lead.estimated_budget || 0),
        converted: existing.converted + (lead.status === 'converted' ? 1 : 0),
      });
    });

    previousLeads?.forEach(lead => {
      if (!lead.industry) return;
      const existing = previousCounts.get(lead.industry) || { count: 0, revenue: 0, converted: 0 };
      previousCounts.set(lead.industry, {
        count: existing.count + 1,
        revenue: existing.revenue + (lead.estimated_budget || 0),
        converted: existing.converted + (lead.status === 'converted' ? 1 : 0),
      });
    });

    const allIndustries = new Set([
      ...Array.from(currentCounts.keys()),
      ...Array.from(previousCounts.keys()),
    ]);

    const trends: IndustryTrend[] = [];

    allIndustries.forEach(industry => {
      const current = currentCounts.get(industry) || { count: 0, revenue: 0, converted: 0 };
      const previous = previousCounts.get(industry) || { count: 0, revenue: 0, converted: 0 };

      const growthRate = this.calculateGrowthRate(current.count, previous.count);
      const direction = this.determineTrendDirection(growthRate);
      const strength = this.determineTrendStrength(growthRate);
      const conversionRate = current.count > 0 ? (current.converted / current.count) * 100 : 0;

      trends.push({
        industry,
        currentPeriodCount: current.count,
        previousPeriodCount: previous.count,
        growthRate,
        direction,
        strength,
        totalRevenue: current.revenue,
        conversionRate,
      });
    });

    return trends.sort((a, b) => b.growthRate - a.growthRate);
  }

  async detectDemandSpikes(organizationId?: string, daysBack: number = 90): Promise<DemandSpike[]> {
    const periodStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    let query_leads = supabase.from('bb_leads')
      .select('message, lead_type, source, created_at')
      .gte('created_at', periodStart.toISOString());
    if (organizationId) query_leads = query_leads.eq('organization_id', organizationId);
    const { data: leads } = await query_leads;

    let query_tickets = supabase.from('bb_support_tickets')
      .select('title, description, category, created_at')
      .gte('created_at', periodStart.toISOString());
    if (organizationId) query_tickets = query_tickets.eq('organization_id', organizationId);
    const { data: tickets } = await query_tickets;

    const keywordFrequency = new Map<string, {
      count: number;
      firstSeen: Date;
      lastSeen: Date;
      sources: Set<string>;
      services: Set<string>;
    }>();

    const keywords = [
      'ai', 'automation', 'integration', 'api', 'dashboard', 'analytics',
      'mobile', 'app', 'workflow', 'crm', 'erp', 'payment', 'stripe',
      'reporting', 'data', 'visualization', 'real-time', 'notification',
      'authentication', 'security', 'cloud', 'migration', 'optimization',
    ];

    leads?.forEach(lead => {
      const text = `${lead.message || ''}`.toLowerCase();
      const date = new Date(lead.created_at);

      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const existing = keywordFrequency.get(keyword) || {
            count: 0,
            firstSeen: date,
            lastSeen: date,
            sources: new Set<string>(),
            services: new Set<string>(),
          };

          existing.count++;
          if (date < existing.firstSeen) existing.firstSeen = date;
          if (date > existing.lastSeen) existing.lastSeen = date;
          existing.sources.add(lead.source || 'unknown');
          existing.services.add(lead.lead_type);

          keywordFrequency.set(keyword, existing);
        }
      });
    });

    tickets?.forEach(ticket => {
      const text = `${ticket.title || ''} ${ticket.description || ''}`.toLowerCase();
      const date = new Date(ticket.created_at);

      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          const existing = keywordFrequency.get(keyword) || {
            count: 0,
            firstSeen: date,
            lastSeen: date,
            sources: new Set<string>(),
            services: new Set<string>(),
          };

          existing.count++;
          if (date < existing.firstSeen) existing.firstSeen = date;
          if (date > existing.lastSeen) existing.lastSeen = date;
          existing.sources.add('support');
          if (ticket.category) existing.services.add(ticket.category);

          keywordFrequency.set(keyword, existing);
        }
      });
    });

    const spikes: DemandSpike[] = [];
    const avgFrequency = Array.from(keywordFrequency.values())
      .reduce((sum, v) => sum + v.count, 0) / keywordFrequency.size || 1;

    keywordFrequency.forEach((data, keyword) => {
      const daysSinceFirst = (Date.now() - data.firstSeen.getTime()) / (1000 * 60 * 60 * 24);
      const isEmergingTrend = daysSinceFirst < 30 && data.count > avgFrequency * 1.5;

      if (data.count >= 3) {
        spikes.push({
          keyword,
          frequency: data.count,
          firstSeen: data.firstSeen.toISOString(),
          lastSeen: data.lastSeen.toISOString(),
          sources: Array.from(data.sources),
          relatedServices: Array.from(data.services),
          isEmergingTrend,
        });
      }
    });

    return spikes.sort((a, b) => b.frequency - a.frequency);
  }

  async detectFeatureUsageTrends(organizationId?: string, daysBack: number = 90): Promise<FeatureUsageTrend[]> {
    const currentPeriodStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(Date.now() - (daysBack * 2) * 24 * 60 * 60 * 1000);

    let query_currentActivity = supabase.from('bb_activity_logs')
      .select('action, user_id')
      .gte('created_at', currentPeriodStart.toISOString());
    if (organizationId) query_currentActivity = query_currentActivity.eq('organization_id', organizationId);
    const { data: currentActivity } = await query_currentActivity;

    let query_previousActivity = supabase.from('bb_activity_logs')
      .select('action')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', currentPeriodStart.toISOString());
    if (organizationId) query_previousActivity = query_previousActivity.eq('organization_id', organizationId);
    const { data: previousActivity } = await query_previousActivity;

    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const totalUserCount = totalUsers?.length || 1;

    const currentCounts = new Map<string, { count: number; users: Set<string> }>();
    const previousCounts = new Map<string, number>();

    currentActivity?.forEach(log => {
      const feature = log.action;
      const existing = currentCounts.get(feature) || { count: 0, users: new Set<string>() };
      existing.count++;
      if (log.user_id) existing.users.add(log.user_id);
      currentCounts.set(feature, existing);
    });

    previousActivity?.forEach(log => {
      const feature = log.action;
      previousCounts.set(feature, (previousCounts.get(feature) || 0) + 1);
    });

    const allFeatures = new Set([
      ...Array.from(currentCounts.keys()),
      ...Array.from(previousCounts.keys()),
    ]);

    const trends: FeatureUsageTrend[] = [];

    allFeatures.forEach(feature => {
      const current = currentCounts.get(feature) || { count: 0, users: new Set() };
      const previous = previousCounts.get(feature) || 0;

      const growthRate = this.calculateGrowthRate(current.count, previous);
      const direction = this.determineTrendDirection(growthRate);
      const adoptionRate = (current.users.size / totalUserCount) * 100;

      trends.push({
        feature,
        usageCount: current.count,
        uniqueUsers: current.users.size,
        growthRate,
        adoptionRate,
        direction,
      });
    });

    return trends.sort((a, b) => b.usageCount - a.usageCount);
  }

  async detectClientRequestPatterns(organizationId?: string, daysBack: number = 90): Promise<ClientRequestPattern[]> {
    const periodStart = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    let query_tickets = supabase.from('bb_support_tickets')
      .select('title, description, category, organization_id')
      .gte('created_at', periodStart.toISOString());
    if (organizationId) query_tickets = query_tickets.eq('organization_id', organizationId);
    const { data: tickets } = await query_tickets;

    let query_projects = supabase.from('bb_projects')
      .select('name, description, service_type, budget, organization_id')
      .gte('created_at', periodStart.toISOString());
    if (organizationId) query_projects = query_projects.eq('organization_id', organizationId);
    const { data: projects } = await query_projects;

    const patterns = new Map<string, {
      count: number;
      clients: Set<string>;
      services: Set<string>;
      totalValue: number;
      recentCount: number;
    }>();

    const commonPatterns = [
      { pattern: 'Custom Reporting', keywords: ['report', 'reporting', 'analytics', 'dashboard'] },
      { pattern: 'Third-Party Integration', keywords: ['integration', 'api', 'connect', 'sync'] },
      { pattern: 'Mobile Access', keywords: ['mobile', 'app', 'ios', 'android'] },
      { pattern: 'Automation Request', keywords: ['automate', 'automation', 'workflow', 'trigger'] },
      { pattern: 'Performance Optimization', keywords: ['slow', 'performance', 'optimize', 'speed'] },
      { pattern: 'Data Migration', keywords: ['migrate', 'migration', 'import', 'transfer'] },
      { pattern: 'User Management', keywords: ['user', 'permission', 'role', 'access'] },
      { pattern: 'Notification System', keywords: ['notification', 'alert', 'email', 'notify'] },
      { pattern: 'Export Functionality', keywords: ['export', 'download', 'csv', 'excel'] },
      { pattern: 'Real-Time Updates', keywords: ['real-time', 'live', 'instant', 'websocket'] },
    ];

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    tickets?.forEach(ticket => {
      const text = `${ticket.title || ''} ${ticket.description || ''}`.toLowerCase();
      const isRecent = new Date(ticket.created_at) >= last30Days;

      commonPatterns.forEach(({ pattern, keywords }) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          const existing = patterns.get(pattern) || {
            count: 0,
            clients: new Set<string>(),
            services: new Set<string>(),
            totalValue: 0,
            recentCount: 0,
          };

          existing.count++;
          if (isRecent) existing.recentCount++;
          if (ticket.organization_id) existing.clients.add(ticket.organization_id);
          if (ticket.category) existing.services.add(ticket.category);

          patterns.set(pattern, existing);
        }
      });
    });

    projects?.forEach(project => {
      const text = `${project.name || ''} ${project.description || ''}`.toLowerCase();
      const isRecent = new Date(project.created_at) >= last30Days;

      commonPatterns.forEach(({ pattern, keywords }) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          const existing = patterns.get(pattern) || {
            count: 0,
            clients: new Set<string>(),
            services: new Set<string>(),
            totalValue: 0,
            recentCount: 0,
          };

          existing.count++;
          if (isRecent) existing.recentCount++;
          if (project.organization_id) existing.clients.add(project.organization_id);
          if (project.service_type) existing.services.add(project.service_type);
          existing.totalValue += project.budget || 0;

          patterns.set(pattern, existing);
        }
      });
    });

    const results: ClientRequestPattern[] = [];

    patterns.forEach((data, pattern) => {
      const isGrowing = data.recentCount > data.count * 0.4;

      results.push({
        pattern,
        frequency: data.count,
        clients: data.clients.size,
        averageValue: data.clients.size > 0 ? data.totalValue / data.clients.size : 0,
        relatedServices: Array.from(data.services),
        isGrowing,
      });
    });

    return results.sort((a, b) => b.frequency - a.frequency);
  }

  async generateTrendInsights(organizationId?: string): Promise<TrendInsight[]> {
    const [serviceTrends, industryTrends, demandSpikes, requestPatterns] = await Promise.all([
      this.detectTrendingServices(organizationId),
      this.detectIndustryGrowth(organizationId),
      this.detectDemandSpikes(organizationId),
      this.detectClientRequestPatterns(organizationId),
    ]);

    const insights: TrendInsight[] = [];

    const topServiceTrend = serviceTrends[0];
    if (topServiceTrend && topServiceTrend.direction === 'up' && topServiceTrend.growthRate > 30) {
      insights.push({
        type: 'opportunity',
        title: `${topServiceTrend.serviceType.replace('_', ' ')} demand surging`,
        description: `${topServiceTrend.growthRate.toFixed(0)}% increase in demand over last 90 days`,
        metric: `${topServiceTrend.currentPeriodCount} new leads`,
        action: 'Consider expanding marketing efforts in this area',
      });
    }

    const topIndustryTrend = industryTrends[0];
    if (topIndustryTrend && topIndustryTrend.direction === 'up' && topIndustryTrend.growthRate > 40) {
      insights.push({
        type: 'opportunity',
        title: `${topIndustryTrend.industry} industry accelerating`,
        description: `${topIndustryTrend.growthRate.toFixed(0)}% growth with ${topIndustryTrend.conversionRate.toFixed(0)}% conversion rate`,
        metric: `$${(topIndustryTrend.totalRevenue / 1000).toFixed(0)}K revenue potential`,
        action: 'Develop industry-specific case studies and marketing materials',
      });
    }

    const emergingTrends = demandSpikes.filter(s => s.isEmergingTrend);
    if (emergingTrends.length > 0) {
      const trend = emergingTrends[0];
      insights.push({
        type: 'info',
        title: `Emerging demand: ${trend.keyword}`,
        description: `${trend.frequency} mentions across ${trend.sources.length} channels in last 30 days`,
        metric: `Related to: ${trend.relatedServices.slice(0, 2).join(', ')}`,
        action: 'Monitor this trend for service expansion opportunities',
      });
    }

    const growingPattern = requestPatterns.find(p => p.isGrowing && p.frequency > 5);
    if (growingPattern) {
      insights.push({
        type: 'opportunity',
        title: `Growing client need: ${growingPattern.pattern}`,
        description: `${growingPattern.clients} clients requesting, trending upward`,
        metric: `$${(growingPattern.averageValue / 1000).toFixed(0)}K avg value`,
        action: 'Consider building a standardized solution or package',
      });
    }

    const decliningServices = serviceTrends.filter(s => s.direction === 'down' && s.growthRate < -20);
    if (decliningServices.length > 0) {
      const declining = decliningServices[0];
      insights.push({
        type: 'warning',
        title: `${declining.serviceType.replace('_', ' ')} demand declining`,
        description: `${Math.abs(declining.growthRate).toFixed(0)}% decrease in demand`,
        metric: `${declining.currentPeriodCount} leads (down from ${declining.previousPeriodCount})`,
        action: 'Review pricing, positioning, or service offering',
      });
    }

    return insights;
  }

  async getHotOpportunities(organizationId?: string) {
    const [serviceTrends, industryTrends, demandSpikes, insights] = await Promise.all([
      this.detectTrendingServices(organizationId),
      this.detectIndustryGrowth(organizationId),
      this.detectDemandSpikes(organizationId),
      this.generateTrendInsights(organizationId),
    ]);

    const hotServices = serviceTrends
      .filter(s => s.direction === 'up' && s.growthRate > 25)
      .slice(0, 5);

    const hotIndustries = industryTrends
      .filter(i => i.direction === 'up' && i.growthRate > 30)
      .slice(0, 5);

    const emergingKeywords = demandSpikes
      .filter(s => s.isEmergingTrend)
      .slice(0, 10);

    return {
      hotServices,
      hotIndustries,
      emergingKeywords,
      insights,
      summary: {
        totalTrendingServices: hotServices.length,
        totalGrowingIndustries: hotIndustries.length,
        totalEmergingTrends: emergingKeywords.length,
        opportunityScore: insights.filter(i => i.type === 'opportunity').length * 20,
      },
    };
  }
}

export const trendDetection = new TrendDetectionEngine();
