import type {
  MarketSignal,
  SignalIngestionInput,
  MarketSignalScore,
  MarketOpportunity,
  EmergingTrend,
  SignalScoreInput,
  OpportunityInput,
} from "../types";
import { normalizeSignal, validateSignalThresholds } from "../signals";
import { computeSignalScore, getTopEmergingSignals } from "../scoring";
import {
  createMarketSignal,
  getMarketSignals,
  upsertSignalScore,
  getSignalScores,
  createMarketOpportunity,
  getMarketOpportunities,
} from "../../db/marketSignals";

export class MarketSignalService {
  async ingestMarketSignals(
    organizationId: string,
    inputs: SignalIngestionInput[],
  ): Promise<{ success: boolean; ingested: number; errors: string[] }> {
    const errors: string[] = [];
    let ingested = 0;

    for (const input of inputs) {
      const normalized = normalizeSignal(input);
      const validation = validateSignalThresholds({
        ...normalized,
        id: "",
        organization_id: "",
      } as MarketSignal);

      if (!validation.valid) {
        errors.push(
          `Signal "${input.signal_name}": ${validation.errors.join(", ")}`,
        );
        continue;
      }

      const { error } = await createMarketSignal(organizationId, input);

      if (error) {
        errors.push(
          `Failed to ingest "${input.signal_name}": ${error.message}`,
        );
      } else {
        ingested++;
      }
    }

    return { success: errors.length === 0, ingested, errors };
  }

  async aggregateAndScoreSignals(
    organizationId: string,
    industry: string,
    options?: {
      service_type?: string;
      geography?: string;
      days?: number;
    },
  ): Promise<{ score: MarketSignalScore | null; error: Error | null }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (options?.days ?? 30));

    const { data: signals, error: fetchError } = await getMarketSignals(
      organizationId,
      {
        industry,
        service_type: options?.service_type,
        geography: options?.geography,
        startDate: startDate.toISOString(),
      },
    );

    if (fetchError || !signals) {
      return { score: null, error: fetchError };
    }

    const scoreInput: SignalScoreInput = {
      industry,
      service_type: options?.service_type,
      geography: options?.geography,
    };

    const computedScore = computeSignalScore(signals, scoreInput);

    const { data: score, error: upsertError } = await upsertSignalScore(
      organizationId,
      computedScore,
    );

    return { score, error: upsertError };
  }

  async getTopEmergingSignals(
    organizationId: string,
    limit: number = 10,
  ): Promise<{ trends: EmergingTrend[]; error: Error | null }> {
    const { data: scores, error } = await getSignalScores(organizationId, {
      minOpportunityScore: 50,
    });

    if (error || !scores) {
      return { trends: [], error };
    }

    const emerging = getTopEmergingSignals(scores, limit);

    const trends: EmergingTrend[] = emerging.map((score) => ({
      industry: score.industry,
      service_type: score.service_type,
      growth_rate: score.momentum_score,
      signal_count: score.signal_count,
      confidence: score.confidence_level,
      direction: score.growth_direction,
      key_indicators: score.key_signals.map((s) => s.signal_name),
    }));

    return { trends, error: null };
  }

  async identifyOpportunities(
    organizationId: string,
    minScore: number = 70,
  ): Promise<{ opportunities: MarketOpportunity[]; error: Error | null }> {
    const { data: scores, error: scoresError } = await getSignalScores(
      organizationId,
      {
        minOpportunityScore: minScore,
      },
    );

    if (scoresError || !scores) {
      return { opportunities: [], error: scoresError };
    }

    const existingOpps = await getMarketOpportunities(organizationId);
    const existingKeys = new Set(
      existingOpps.data?.map((o) => `${o.industry}-${o.service_type}`) ?? [],
    );

    const newOpportunities: OpportunityInput[] = [];

    for (const score of scores) {
      const key = `${score.industry}-${score.service_type ?? "general"}`;

      if (!existingKeys.has(key)) {
        newOpportunities.push({
          title: `${score.industry} ${score.service_type ? `- ${score.service_type}` : ""} Opportunity`,
          description: `Market signals indicate ${score.growth_direction} demand with ${score.confidence_level}% confidence.`,
          category: "industry_demand",
          industry: score.industry,
          service_type: score.service_type,
          priority_score: score.opportunity_score,
          confidence_score: score.confidence_level,
          supporting_data: {
            signal_count: score.signal_count,
            momentum: score.momentum_score,
            key_signals: score.key_signals,
          },
        });
      }
    }

    const created: MarketOpportunity[] = [];

    for (const oppInput of newOpportunities) {
      const { data } = await createMarketOpportunity(organizationId, oppInput);
      if (data) {
        created.push(data);
      }
    }

    return { opportunities: created, error: null };
  }

  async analyzeIndustryTrends(
    organizationId: string,
    industry: string,
  ): Promise<{
    summary: {
      total_signals: number;
      avg_confidence: number;
      growth_direction: string;
      top_services: string[];
    };
    error: Error | null;
  }> {
    const { data: signals, error } = await getMarketSignals(organizationId, {
      industry,
    });

    if (error || !signals) {
      return {
        summary: {
          total_signals: 0,
          avg_confidence: 0,
          growth_direction: "stable",
          top_services: [],
        },
        error,
      };
    }

    const avgConfidence =
      signals.reduce((sum, s) => sum + s.confidence_score, 0) / signals.length;

    const risingCount = signals.filter(
      (s) =>
        s.growth_direction === "rising" || s.growth_direction === "emerging",
    ).length;

    const growthDirection =
      risingCount / signals.length > 0.6
        ? "rising"
        : risingCount / signals.length > 0.4
          ? "stable"
          : "declining";

    const serviceCounts = signals.reduce(
      (acc, signal) => {
        const service = signal.service_type || "Other";
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([service]) => service);

    return {
      summary: {
        total_signals: signals.length,
        avg_confidence: Math.round(avgConfidence),
        growth_direction: growthDirection,
        top_services: topServices,
      },
      error: null,
    };
  }
}

export const marketSignalService = new MarketSignalService();
