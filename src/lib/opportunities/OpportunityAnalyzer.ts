// @ts-nocheck
import { supabase } from '../supabase';
import type {
  ScoredOpportunity,
  IndustryOpportunity,
  ServiceOpportunity,
  OpportunityRankingInput,
  HotOpportunitiesSummary,
  OpportunityFilter,
} from './types';
import type { ScoreInputData } from './scoring';
import {
  calculateOpportunityScore,
  generateOpportunityReasons,
  determineOpportunityLevel,
  calculateConfidenceLevel,
  generateRecommendedAction,
} from './scoring';
import {
  rankOpportunities,
  getNextBestMarkets,
  getNextBestServiceFocus,
  generateHotOpportunitiesSummary,
} from './ranking';

export class OpportunityAnalyzer {
  async analyzeIndustryOpportunities(
    organizationId: string,
    timeframeDays: number = 90
  ): Promise<{ opportunities: IndustryOpportunity[]; error: Error | null }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const [leadsRes, projectsRes, proposalsRes, signalsRes] = await Promise.all([
        supabase
          .from('bb_leads')
          .select('industry, estimated_value, status')
          .eq('organization_id', organizationId)
          .gte('created_at', cutoffDate.toISOString()),
        supabase
          .from('bb_projects')
          .select('industry, budget')
          .eq('organization_id', organizationId),
        supabase
          .from('bb_proposals')
          .select('industry, total_amount, status')
          .eq('organization_id', organizationId),
        supabase
          .from('bb_market_signals')
          .select('industry, strength_score, confidence_score')
          .eq('organization_id', organizationId)
          .gte('signal_date', cutoffDate.toISOString()),
      ]);

      const industries = new Set<string>();
      [leadsRes.data, projectsRes.data, proposalsRes.data, signalsRes.data].forEach((data) => {
        data?.forEach((item: any) => {
          if (item.industry) industries.add(item.industry);
        });
      });

      const opportunities: IndustryOpportunity[] = [];

      for (const industry of industries) {
        const industryLeads = leadsRes.data?.filter((l) => l.industry === industry) || [];
        const industryProjects = projectsRes.data?.filter((p) => l.industry === industry) || [];
        const industryProposals = proposalsRes.data?.filter((p) => p.industry === industry) || [];
        const industrySignals = signalsRes.data?.filter((s) => s.industry === industry) || [];

        const currentRevenue = industryProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const potentialRevenue = industryLeads.reduce(
          (sum, l) => sum + (l.estimated_value || 0),
          0
        );

        const wonProposals = industryProposals.filter((p) => p.status === 'accepted').length;
        const totalProposals = industryProposals.length;
        const winRate = totalProposals > 0 ? wonProposals / totalProposals : 0;

        const avgSignalStrength =
          industrySignals.length > 0
            ? industrySignals.reduce((sum, s) => sum + s.strength_score, 0) / industrySignals.length
            : 0;

        const scoreInput: ScoreInputData = {
          revenue_current: currentRevenue,
          lead_count_current: industryLeads.length,
          project_count: industryProjects.length,
          avg_deal_size: currentRevenue / Math.max(1, industryProjects.length),
          win_rate: winRate,
          market_signal_count: industrySignals.length,
          market_signal_strength: avgSignalStrength,
        };

        const score = calculateOpportunityScore(scoreInput);
        const reasons = generateOpportunityReasons(score, scoreInput);
        const level = determineOpportunityLevel(score.total_score);
        const confidence = calculateConfidenceLevel(scoreInput, score);
        const action = generateRecommendedAction(score, level, reasons);

        const services = new Set<string>();
        industryProjects.forEach((p: any) => p.service_type && services.add(p.service_type));

        opportunities.push({
          id: `industry-${industry}`,
          type: 'industry',
          name: industry,
          industry,
          description: `${industry} industry opportunity`,
          score: score,
          overall_score: score.total_score,
          confidence_level: confidence,
          opportunity_level: level,
          reasons,
          recommended_action: action,
          top_services: Array.from(services).slice(0, 3),
          client_count: new Set(industryProjects.map((p: any) => p.client_id)).size,
          total_revenue: currentRevenue,
          metrics: {
            current_revenue: currentRevenue,
            potential_revenue: potentialRevenue,
            active_leads: industryLeads.length,
            active_projects: industryProjects.length,
            win_rate: winRate,
            market_signals: industrySignals.length,
          },
          calculated_at: new Date().toISOString(),
        });
      }

      return { opportunities, error: null };
    } catch (error: any) {
      return { opportunities: [], error };
    }
  }

  async analyzeServiceOpportunities(
    organizationId: string,
    timeframeDays: number = 90
  ): Promise<{ opportunities: ServiceOpportunity[]; error: Error | null }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const [leadsRes, projectsRes, deliverablesRes] = await Promise.all([
        supabase
          .from('bb_leads')
          .select('services_interested, estimated_value')
          .eq('organization_id', organizationId)
          .gte('created_at', cutoffDate.toISOString()),
        supabase
          .from('bb_projects')
          .select('type, industry, budget')
          .eq('organization_id', organizationId),
        supabase
          .from('bb_deliverables')
          .select('type')
          .eq('organization_id', organizationId),
      ]);

      const serviceMap = new Map<string, any[]>();

      leadsRes.data?.forEach((lead) => {
        const services = lead.services_interested || [];
        services.forEach((service: string) => {
          if (!serviceMap.has(service)) serviceMap.set(service, []);
          serviceMap.get(service)!.push({ ...lead, source: 'lead' });
        });
      });

      projectsRes.data?.forEach((project) => {
        const service = project.type || 'other';
        if (!serviceMap.has(service)) serviceMap.set(service, []);
        serviceMap.get(service)!.push({ ...project, source: 'project' });
      });

      const opportunities: ServiceOpportunity[] = [];

      for (const [service, items] of serviceMap.entries()) {
        const projects = items.filter((i) => i.source === 'project');
        const leads = items.filter((i) => i.source === 'lead');

        const currentRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const avgProjectValue = currentRevenue / Math.max(1, projects.length);
        const potentialRevenue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

        const industries = new Set(projects.map((p) => p.industry).filter(Boolean));

        const scoreInput: ScoreInputData = {
          revenue_current: currentRevenue,
          lead_count_current: leads.length,
          project_count: projects.length,
          avg_deal_size: avgProjectValue,
          internal_capability_score: projects.length > 5 ? 85 : projects.length > 2 ? 70 : 55,
        };

        const score = calculateOpportunityScore(scoreInput);
        const reasons = generateOpportunityReasons(score, scoreInput);
        const level = determineOpportunityLevel(score.total_score);
        const confidence = calculateConfidenceLevel(scoreInput, score);
        const action = generateRecommendedAction(score, level, reasons);

        opportunities.push({
          id: `service-${service}`,
          type: 'service',
          name: service,
          service_type: service,
          description: `${service} service opportunity`,
          score: score,
          overall_score: score.total_score,
          confidence_level: confidence,
          opportunity_level: level,
          reasons,
          recommended_action: action,
          top_industries: Array.from(industries).slice(0, 3),
          delivery_count: projects.length,
          avg_project_value: avgProjectValue,
          metrics: {
            current_revenue: currentRevenue,
            potential_revenue: potentialRevenue,
            active_leads: leads.length,
            active_projects: projects.length,
            avg_deal_size: avgProjectValue,
          },
          calculated_at: new Date().toISOString(),
        });
      }

      return { opportunities, error: null };
    } catch (error: any) {
      return { opportunities: [], error };
    }
  }

  async generateHotOpportunitiesSummary(
    organizationId: string,
    input?: OpportunityRankingInput
  ): Promise<{ summary: HotOpportunitiesSummary | null; error: Error | null }> {
    try {
      const timeframe = input?.timeframe_days || 90;

      const [industryRes, serviceRes] = await Promise.all([
        input?.includeIndustries !== false
          ? this.analyzeIndustryOpportunities(organizationId, timeframe)
          : { opportunities: [], error: null },
        input?.includeServices !== false
          ? this.analyzeServiceOpportunities(organizationId, timeframe)
          : { opportunities: [], error: null },
      ]);

      if (industryRes.error || serviceRes.error) {
        return { summary: null, error: industryRes.error || serviceRes.error };
      }

      const allOpportunities: ScoredOpportunity[] = [
        ...industryRes.opportunities,
        ...serviceRes.opportunities,
      ];

      let filtered = allOpportunities;
      if (input?.min_confidence) {
        filtered = filtered.filter((o) => o.confidence_level >= input.min_confidence!);
      }

      const summary = generateHotOpportunitiesSummary(filtered);

      return { summary, error: null };
    } catch (error: any) {
      return { summary: null, error };
    }
  }

  async getRankedOpportunities(
    organizationId: string,
    filter?: OpportunityFilter
  ): Promise<{ opportunities: ScoredOpportunity[]; error: Error | null }> {
    try {
      const [industryRes, serviceRes] = await Promise.all([
        this.analyzeIndustryOpportunities(organizationId),
        this.analyzeServiceOpportunities(organizationId),
      ]);

      if (industryRes.error || serviceRes.error) {
        return { opportunities: [], error: industryRes.error || serviceRes.error };
      }

      const allOpportunities: ScoredOpportunity[] = [
        ...industryRes.opportunities,
        ...serviceRes.opportunities,
      ];

      const ranked = rankOpportunities(allOpportunities, filter);

      return { opportunities: ranked, error: null };
    } catch (error: any) {
      return { opportunities: [], error };
    }
  }
}

export const opportunityAnalyzer = new OpportunityAnalyzer();
