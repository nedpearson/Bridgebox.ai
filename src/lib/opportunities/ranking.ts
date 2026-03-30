import type {
  ScoredOpportunity,
  IndustryOpportunity,
  ServiceOpportunity,
  OpportunityFilter,
  HotOpportunitiesSummary,
  OpportunityInsight,
} from "./types";

export function rankOpportunities(
  opportunities: ScoredOpportunity[],
  filter?: OpportunityFilter,
): ScoredOpportunity[] {
  let filtered = [...opportunities];

  if (filter?.type) {
    filtered = filtered.filter((o) => o.type === filter.type);
  }

  if (filter?.min_score !== undefined) {
    filtered = filtered.filter((o) => o.overall_score >= filter.min_score);
  }

  if (filter?.opportunity_level) {
    filtered = filtered.filter(
      (o) => o.opportunity_level === filter.opportunity_level,
    );
  }

  if (filter?.industry) {
    filtered = filtered.filter((o) => o.industry === filter.industry);
  }

  if (filter?.service_type) {
    filtered = filtered.filter((o) => o.service_type === filter.service_type);
  }

  const ranked = filtered.sort((a, b) => {
    if (b.overall_score !== a.overall_score) {
      return b.overall_score - a.overall_score;
    }

    if (b.confidence_level !== a.confidence_level) {
      return b.confidence_level - a.confidence_level;
    }

    return (
      b.score.revenue_potential +
      b.score.demand_momentum -
      (a.score.revenue_potential + a.score.demand_momentum)
    );
  });

  if (filter?.limit) {
    return ranked.slice(0, filter.limit);
  }

  return ranked;
}

export function getNextBestMarkets(
  opportunities: IndustryOpportunity[],
  limit: number = 5,
): IndustryOpportunity[] {
  const filtered = opportunities.filter(
    (o) =>
      o.score.demand_momentum >= 60 ||
      o.score.revenue_potential >= 70 ||
      o.overall_score >= 65,
  );

  return rankOpportunities(filtered, {
    type: "industry",
    limit,
  }) as IndustryOpportunity[];
}

export function getNextBestServiceFocus(
  opportunities: ServiceOpportunity[],
  limit: number = 5,
): ServiceOpportunity[] {
  const filtered = opportunities.filter(
    (o) =>
      o.score.capability_fit >= 60 &&
      (o.score.demand_momentum >= 60 || o.score.revenue_potential >= 65),
  );

  return rankOpportunities(filtered, {
    type: "service",
    limit,
  }) as ServiceOpportunity[];
}

export function identifyEmergingCombinations(
  opportunities: ScoredOpportunity[],
  limit: number = 3,
): ScoredOpportunity[] {
  const emerging = opportunities.filter(
    (o) =>
      o.score.demand_momentum >= 70 &&
      o.score.market_signal_confidence >= 60 &&
      (o.metrics.active_projects || 0) < 5,
  );

  return rankOpportunities(emerging, { limit });
}

export function generateHotOpportunitiesSummary(
  allOpportunities: ScoredOpportunity[],
): HotOpportunitiesSummary {
  const industries = allOpportunities.filter(
    (o) => o.type === "industry",
  ) as IndustryOpportunity[];
  const services = allOpportunities.filter(
    (o) => o.type === "service",
  ) as ServiceOpportunity[];

  const topIndustries = getNextBestMarkets(industries, 3);
  const topServices = getNextBestServiceFocus(services, 3);
  const emergingCombinations = identifyEmergingCombinations(
    allOpportunities,
    3,
  );

  const keyInsights = generateKeyInsights(
    topIndustries,
    topServices,
    emergingCombinations,
  );

  const totalPotentialRevenue = allOpportunities
    .filter((o) => o.opportunity_level === "high")
    .reduce((sum, o) => sum + (o.metrics.potential_revenue || 0), 0);

  const recommendedFocusAreas = generateFocusRecommendations(
    topIndustries,
    topServices,
  );

  return {
    top_industries: topIndustries,
    top_services: topServices,
    emerging_combinations: emergingCombinations,
    key_insights: keyInsights,
    total_potential_revenue: totalPotentialRevenue,
    recommended_focus_areas: recommendedFocusAreas,
  };
}

function generateKeyInsights(
  industries: IndustryOpportunity[],
  services: ServiceOpportunity[],
  emerging: ScoredOpportunity[],
): OpportunityInsight[] {
  const insights: OpportunityInsight[] = [];

  const highMomentumIndustries = industries.filter(
    (i) => i.score.demand_momentum >= 80,
  );
  if (highMomentumIndustries.length > 0) {
    insights.push({
      title: "Strong Industry Momentum",
      description: `${highMomentumIndustries.length} ${highMomentumIndustries.length === 1 ? "industry shows" : "industries show"} high demand momentum`,
      opportunity_ids: highMomentumIndustries.map((i) => i.id),
      priority: "high",
      action_items: [
        "Allocate additional sales resources",
        "Develop industry-specific marketing",
        "Build case studies and references",
      ],
    });
  }

  const highValueServices = services.filter(
    (s) => s.score.revenue_potential >= 85,
  );
  if (highValueServices.length > 0) {
    insights.push({
      title: "High-Value Service Offerings",
      description: `${highValueServices.length} ${highValueServices.length === 1 ? "service has" : "services have"} strong revenue potential`,
      opportunity_ids: highValueServices.map((s) => s.id),
      priority: "high",
      action_items: [
        "Expand service delivery capacity",
        "Develop specialized expertise",
        "Create premium service packages",
      ],
    });
  }

  if (emerging.length > 0) {
    insights.push({
      title: "Emerging Opportunities",
      description: `${emerging.length} new ${emerging.length === 1 ? "opportunity" : "opportunities"} with rising demand and market signals`,
      opportunity_ids: emerging.map((e) => e.id),
      priority: "medium",
      action_items: [
        "Conduct market validation",
        "Assess capability requirements",
        "Develop pilot programs",
      ],
    });
  }

  const capabilityGaps = [...industries, ...services].filter(
    (o) => o.score.capability_fit < 60 && o.overall_score >= 70,
  );
  if (capabilityGaps.length > 0) {
    insights.push({
      title: "Capability Development Needed",
      description: `${capabilityGaps.length} high-potential ${capabilityGaps.length === 1 ? "area requires" : "areas require"} capability investment`,
      opportunity_ids: capabilityGaps.map((o) => o.id),
      priority: "medium",
      action_items: [
        "Identify skill gaps",
        "Plan training and hiring",
        "Consider strategic partnerships",
      ],
    });
  }

  return insights;
}

function generateFocusRecommendations(
  industries: IndustryOpportunity[],
  services: ServiceOpportunity[],
): string[] {
  const recommendations: string[] = [];

  if (industries.length > 0) {
    const top = industries[0];
    recommendations.push(`${top.industry}: ${top.recommended_action}`);
  }

  if (services.length > 0) {
    const top = services[0];
    recommendations.push(`${top.service_type}: ${top.recommended_action}`);
  }

  const highConfidence = [...industries, ...services].filter(
    (o) => o.confidence_level >= 80 && o.overall_score >= 75,
  );

  if (highConfidence.length > 0) {
    recommendations.push(
      "Focus on high-confidence opportunities for immediate impact",
    );
  }

  const emerging = [...industries, ...services].filter(
    (o) =>
      o.score.demand_momentum >= 75 && (o.metrics.active_projects || 0) < 3,
  );

  if (emerging.length > 0) {
    recommendations.push(
      "Establish early presence in emerging high-momentum areas",
    );
  }

  return recommendations;
}

export function compareOpportunities(
  a: ScoredOpportunity,
  b: ScoredOpportunity,
): {
  winner: ScoredOpportunity;
  advantages: string[];
  considerations: string[];
} {
  const winner = a.overall_score > b.overall_score ? a : b;
  const other = winner === a ? b : a;

  const advantages: string[] = [];
  const considerations: string[] = [];

  if (winner.score.revenue_potential > other.score.revenue_potential) {
    advantages.push("Higher revenue potential");
  }

  if (winner.score.demand_momentum > other.score.demand_momentum) {
    advantages.push("Stronger demand momentum");
  }

  if (winner.score.capability_fit > other.score.capability_fit) {
    advantages.push("Better capability fit");
  }

  if (winner.confidence_level < other.confidence_level) {
    considerations.push("Lower data confidence");
  }

  if (winner.score.implementation_fit < other.score.implementation_fit) {
    considerations.push("Less implementation experience");
  }

  return { winner, advantages, considerations };
}
