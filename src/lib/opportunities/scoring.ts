import type { OpportunityScore, OpportunityReason, OpportunityLevel } from './types';

export interface ScoreInputData {
  revenue_current?: number;
  revenue_previous?: number;
  lead_count_current?: number;
  lead_count_previous?: number;
  project_count?: number;
  avg_deal_size?: number;
  win_rate?: number;
  market_signal_count?: number;
  market_signal_strength?: number;
  client_demand_frequency?: number;
  internal_capability_score?: number;
  strategic_priority?: number;
}

export function calculateDemandMomentum(input: ScoreInputData): number {
  let score = 50;

  if (input.lead_count_current && input.lead_count_previous) {
    const growth = ((input.lead_count_current - input.lead_count_previous) / input.lead_count_previous) * 100;

    if (growth > 50) score = 95;
    else if (growth > 25) score = 85;
    else if (growth > 10) score = 75;
    else if (growth > 0) score = 65;
    else if (growth > -10) score = 55;
    else score = 40;
  } else if (input.lead_count_current) {
    score = Math.min(90, 50 + (input.lead_count_current * 5));
  }

  if (input.market_signal_count && input.market_signal_count > 0) {
    score = Math.min(100, score + (input.market_signal_count * 2));
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateRevenuePotential(input: ScoreInputData): number {
  let score = 50;

  if (input.revenue_current) {
    if (input.revenue_current > 500000) score = 95;
    else if (input.revenue_current > 250000) score = 85;
    else if (input.revenue_current > 100000) score = 75;
    else if (input.revenue_current > 50000) score = 65;
    else score = 55;
  }

  if (input.avg_deal_size) {
    const dealBonus = Math.min(20, (input.avg_deal_size / 10000) * 5);
    score += dealBonus;
  }

  if (input.lead_count_current && input.avg_deal_size) {
    const pipeline_value = input.lead_count_current * input.avg_deal_size * (input.win_rate || 0.3);
    const potential_bonus = Math.min(15, (pipeline_value / 100000) * 5);
    score += potential_bonus;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateImplementationFit(input: ScoreInputData): number {
  let score = 50;

  if (input.project_count !== undefined) {
    if (input.project_count > 10) score = 90;
    else if (input.project_count > 5) score = 80;
    else if (input.project_count > 2) score = 70;
    else if (input.project_count > 0) score = 60;
    else score = 40;
  }

  if (input.win_rate !== undefined) {
    const win_bonus = input.win_rate * 30;
    score = score * 0.7 + win_bonus;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateCapabilityFit(input: ScoreInputData): number {
  if (input.internal_capability_score !== undefined) {
    return Math.round(Math.max(0, Math.min(100, input.internal_capability_score)));
  }

  let score = 60;

  if (input.project_count !== undefined && input.project_count > 0) {
    score = 70 + Math.min(25, input.project_count * 3);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateDemandFrequency(input: ScoreInputData): number {
  if (input.client_demand_frequency !== undefined) {
    return Math.round(Math.max(0, Math.min(100, input.client_demand_frequency)));
  }

  let score = 50;

  if (input.lead_count_current) {
    score = 40 + Math.min(50, input.lead_count_current * 5);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateMarketSignalConfidence(input: ScoreInputData): number {
  let score = 50;

  if (input.market_signal_count && input.market_signal_strength) {
    const signal_score = (input.market_signal_count * 5) + (input.market_signal_strength * 0.5);
    score = Math.min(100, signal_score);
  } else if (input.market_signal_count) {
    score = Math.min(90, 50 + (input.market_signal_count * 8));
  } else if (input.market_signal_strength) {
    score = input.market_signal_strength;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateStrategicAlignment(input: ScoreInputData): number {
  if (input.strategic_priority !== undefined) {
    return Math.round(Math.max(0, Math.min(100, input.strategic_priority)));
  }

  let score = 60;

  const has_revenue = (input.revenue_current || 0) > 0;
  const has_projects = (input.project_count || 0) > 0;
  const has_momentum = input.lead_count_current && input.lead_count_previous
    && input.lead_count_current > input.lead_count_previous;

  if (has_revenue && has_projects && has_momentum) score = 90;
  else if ((has_revenue && has_projects) || (has_revenue && has_momentum)) score = 80;
  else if (has_revenue || has_projects) score = 70;

  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateOpportunityScore(input: ScoreInputData): OpportunityScore {
  const weights = {
    demand_momentum: 0.20,
    revenue_potential: 0.20,
    implementation_fit: 0.15,
    capability_fit: 0.15,
    demand_frequency: 0.10,
    market_signal_confidence: 0.10,
    strategic_alignment: 0.10,
  };

  const score: OpportunityScore = {
    demand_momentum: calculateDemandMomentum(input),
    revenue_potential: calculateRevenuePotential(input),
    implementation_fit: calculateImplementationFit(input),
    capability_fit: calculateCapabilityFit(input),
    demand_frequency: calculateDemandFrequency(input),
    market_signal_confidence: calculateMarketSignalConfidence(input),
    strategic_alignment: calculateStrategicAlignment(input),
    total_score: 0,
  };

  score.total_score = Math.round(
    score.demand_momentum * weights.demand_momentum +
    score.revenue_potential * weights.revenue_potential +
    score.implementation_fit * weights.implementation_fit +
    score.capability_fit * weights.capability_fit +
    score.demand_frequency * weights.demand_frequency +
    score.market_signal_confidence * weights.market_signal_confidence +
    score.strategic_alignment * weights.strategic_alignment
  );

  return score;
}

export function generateOpportunityReasons(
  score: OpportunityScore,
  input: ScoreInputData
): OpportunityReason[] {
  const reasons: OpportunityReason[] = [];

  if (score.demand_momentum >= 80) {
    reasons.push({
      category: 'strength',
      message: 'Strong demand momentum',
      impact: 'high',
    });
  } else if (score.demand_momentum < 40) {
    reasons.push({
      category: 'risk',
      message: 'Limited demand momentum',
      impact: 'medium',
    });
  }

  if (score.revenue_potential >= 80) {
    reasons.push({
      category: 'strength',
      message: 'High revenue potential',
      impact: 'high',
    });
  }

  if (score.implementation_fit >= 75) {
    reasons.push({
      category: 'strength',
      message: 'Strong implementation fit',
      impact: 'high',
    });
  } else if (score.implementation_fit < 50) {
    reasons.push({
      category: 'risk',
      message: 'Limited implementation experience',
      impact: 'high',
    });
  }

  if (score.capability_fit < 60) {
    reasons.push({
      category: 'risk',
      message: 'Capability gap may require investment',
      impact: 'medium',
    });
  }

  if (score.market_signal_confidence >= 70) {
    reasons.push({
      category: 'strength',
      message: 'Supported by market signals',
      impact: 'medium',
    });
  }

  if (input.lead_count_current && input.lead_count_previous) {
    const growth = ((input.lead_count_current - input.lead_count_previous) / input.lead_count_previous) * 100;
    if (growth > 25) {
      reasons.push({
        category: 'insight',
        message: `${Math.round(growth)}% growth in lead volume`,
        impact: 'high',
      });
    }
  }

  if (input.win_rate && input.win_rate > 0.5) {
    reasons.push({
      category: 'strength',
      message: 'High win rate',
      impact: 'medium',
    });
  }

  if (input.avg_deal_size && input.avg_deal_size > 50000) {
    reasons.push({
      category: 'strength',
      message: 'Large average deal size',
      impact: 'medium',
    });
  }

  return reasons;
}

export function determineOpportunityLevel(totalScore: number): OpportunityLevel {
  if (totalScore >= 75) return 'high';
  if (totalScore >= 55) return 'medium';
  return 'low';
}

export function calculateConfidenceLevel(input: ScoreInputData, score: OpportunityScore): number {
  let confidence = 50;

  const dataPoints = [
    input.revenue_current !== undefined,
    input.lead_count_current !== undefined,
    input.project_count !== undefined,
    input.win_rate !== undefined,
    input.market_signal_count !== undefined,
    input.avg_deal_size !== undefined,
  ].filter(Boolean).length;

  confidence = 40 + (dataPoints * 10);

  if (input.revenue_current && input.revenue_current > 0) {
    confidence += 5;
  }

  if (input.project_count && input.project_count > 3) {
    confidence += 10;
  }

  if (score.market_signal_confidence > 60) {
    confidence += 5;
  }

  return Math.round(Math.max(0, Math.min(100, confidence)));
}

export function generateRecommendedAction(
  score: OpportunityScore,
  level: OpportunityLevel,
  reasons: OpportunityReason[]
): string {
  const hasHighRisk = reasons.some(r => r.category === 'risk' && r.impact === 'high');
  const hasStrongMomentum = score.demand_momentum >= 75;
  const hasRevenuePotential = score.revenue_potential >= 75;

  if (level === 'high') {
    if (hasStrongMomentum && hasRevenuePotential) {
      return 'Prioritize investment and resource allocation';
    }
    if (hasHighRisk) {
      return 'Address capability gaps while pursuing opportunities';
    }
    return 'Actively pursue with focused resources';
  }

  if (level === 'medium') {
    if (hasStrongMomentum) {
      return 'Monitor closely and consider strategic investment';
    }
    if (hasHighRisk) {
      return 'Develop capabilities before scaling';
    }
    return 'Evaluate for selective engagement';
  }

  return 'Monitor for emerging signals';
}
