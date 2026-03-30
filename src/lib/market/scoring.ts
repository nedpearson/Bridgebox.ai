import type {
  MarketSignal,
  MarketSignalScore,
  SignalScoreInput,
  KeySignal,
  Recommendation,
  GrowthDirection,
} from "./types";
import { inferGrowthDirection, aggregateSignalStrength } from "./signals";

export function scoreMarketOpportunity(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const strengthScore = aggregateSignalStrength(signals);
  const recencyBonus = calculateRecencyBonus(signals);
  const diversityBonus = calculateDiversityBonus(signals);
  const momentumScore = calculateMomentumScore(signals);

  const baseScore =
    strengthScore * 0.4 +
    momentumScore * 0.3 +
    recencyBonus * 0.2 +
    diversityBonus * 0.1;

  return Math.min(100, Math.round(baseScore));
}

export function calculateMomentumScore(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const avgVelocity =
    signals.reduce((sum, s) => sum + s.velocity, 0) / signals.length;
  const risingCount = signals.filter(
    (s) => s.growth_direction === "rising" || s.growth_direction === "emerging",
  ).length;
  const risingRatio = risingCount / signals.length;

  const velocityScore = Math.min(100, (avgVelocity + 50) * 2);
  const directionScore = risingRatio * 100;

  return Math.round(velocityScore * 0.6 + directionScore * 0.4);
}

export function calculateConfidenceLevel(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const avgConfidence =
    signals.reduce((sum, s) => sum + s.confidence_score, 0) / signals.length;
  const sampleSizeBonus = Math.min(20, signals.length * 2);

  return Math.min(100, Math.round(avgConfidence + sampleSizeBonus));
}

function calculateRecencyBonus(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const now = new Date().getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  const recentSignals = signals.filter((s) => {
    const signalDate = new Date(s.signal_date).getTime();
    return now - signalDate < oneWeek;
  });

  return (recentSignals.length / signals.length) * 100;
}

function calculateDiversityBonus(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const uniqueSources = new Set(signals.map((s) => s.source)).size;
  const uniqueCategories = new Set(signals.map((s) => s.category)).size;

  const sourceScore = Math.min(100, (uniqueSources / 3) * 100);
  const categoryScore = Math.min(100, (uniqueCategories / 3) * 100);

  return (sourceScore + categoryScore) / 2;
}

export function generateScoreInsights(
  signals: MarketSignal[],
  score: MarketSignalScore,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (score.opportunity_score >= 75) {
    recommendations.push({
      type: "action",
      priority: "high",
      message: `Strong opportunity detected in ${score.industry}`,
      context: `${score.signal_count} signals indicate high potential. Consider immediate action.`,
    });
  }

  if (score.momentum_score >= 70 && score.growth_direction === "rising") {
    recommendations.push({
      type: "insight",
      priority: "high",
      message: "Rapid growth trajectory detected",
      context:
        "Market momentum is accelerating. Early entry could maximize advantage.",
    });
  }

  if (score.confidence_level < 40) {
    recommendations.push({
      type: "warning",
      priority: "medium",
      message: "Low confidence in current data",
      context:
        "Consider gathering additional market signals before taking action.",
    });
  }

  if (score.growth_direction === "declining") {
    recommendations.push({
      type: "warning",
      priority: "high",
      message: "Declining market signals detected",
      context: "Recent trends show weakening demand. Proceed with caution.",
    });
  }

  if (score.growth_direction === "emerging" && score.signal_count < 5) {
    recommendations.push({
      type: "insight",
      priority: "medium",
      message: "Early-stage opportunity identified",
      context: "Limited data available. Monitor closely for confirmation.",
    });
  }

  const serviceTypes = new Set(
    signals.map((s) => s.service_type).filter(Boolean),
  );
  if (serviceTypes.size > 3) {
    recommendations.push({
      type: "insight",
      priority: "low",
      message: "Diverse service demand detected",
      context:
        "Multiple service types showing interest. Consider bundled offerings.",
    });
  }

  return recommendations;
}

export function extractKeySignals(
  signals: MarketSignal[],
  limit: number = 5,
): KeySignal[] {
  return signals
    .sort((a, b) => {
      const scoreA = a.strength_score * (a.confidence_score / 100);
      const scoreB = b.strength_score * (b.confidence_score / 100);
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map((s) => ({
      signal_id: s.id,
      signal_name: s.signal_name,
      strength: s.strength_score,
      date: s.signal_date,
    }));
}

export function computeSignalScore(
  signals: MarketSignal[],
  input: SignalScoreInput,
): Omit<
  MarketSignalScore,
  "id" | "organization_id" | "created_at" | "updated_at"
> {
  const opportunityScore = scoreMarketOpportunity(signals);
  const momentumScore = calculateMomentumScore(signals);
  const confidenceLevel = calculateConfidenceLevel(signals);
  const avgStrength =
    signals.length > 0
      ? signals.reduce((sum, s) => sum + s.strength_score, 0) / signals.length
      : 0;

  const avgVelocity =
    signals.length > 0
      ? signals.reduce((sum, s) => sum + s.velocity, 0) / signals.length
      : 0;

  const growthDirection = inferGrowthDirection(
    avgVelocity,
    avgStrength,
    signals.length,
  );

  const keySignals = extractKeySignals(signals);

  const score: MarketSignalScore = {
    id: "",
    organization_id: "",
    industry: input.industry,
    service_type: input.service_type,
    geography: input.geography,
    opportunity_score: opportunityScore,
    momentum_score: momentumScore,
    confidence_level: confidenceLevel,
    growth_direction: growthDirection,
    signal_count: signals.length,
    avg_strength: Math.round(avgStrength),
    key_signals: keySignals,
    recommendations: [],
    score_date: input.score_date ?? new Date().toISOString().split("T")[0],
    created_at: "",
    updated_at: "",
  };

  const recommendations = generateScoreInsights(signals, score);

  return {
    ...score,
    recommendations,
  };
}

export function rankOpportunities(
  scores: MarketSignalScore[],
): MarketSignalScore[] {
  return [...scores].sort((a, b) => {
    const scoreA =
      a.opportunity_score * 0.5 +
      a.momentum_score * 0.3 +
      a.confidence_level * 0.2;
    const scoreB =
      b.opportunity_score * 0.5 +
      b.momentum_score * 0.3 +
      b.confidence_level * 0.2;
    return scoreB - scoreA;
  });
}

export function getTopEmergingSignals(
  scores: MarketSignalScore[],
  limit: number = 10,
): MarketSignalScore[] {
  return scores
    .filter(
      (s) =>
        s.growth_direction === "rising" || s.growth_direction === "emerging",
    )
    .sort((a, b) => b.momentum_score - a.momentum_score)
    .slice(0, limit);
}
