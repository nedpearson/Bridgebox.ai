import type {
  MarketSignal,
  SignalIngestionInput,
  GrowthDirection,
} from "./types";

export function normalizeSignal(
  input: SignalIngestionInput,
): Omit<MarketSignal, "id" | "organization_id" | "created_at" | "updated_at"> {
  return {
    source: input.source,
    category: input.category,
    signal_name: input.signal_name,
    description: input.description,
    industry: input.industry,
    service_type: input.service_type,
    geography: input.geography,
    confidence_score: Math.min(100, Math.max(0, input.confidence_score ?? 50)),
    strength_score: Math.min(100, Math.max(0, input.strength_score ?? 50)),
    growth_direction: input.growth_direction ?? "stable",
    velocity: input.velocity ?? 0,
    raw_metadata: input.raw_metadata ?? {},
    data_points: input.data_points ?? [],
    signal_date: input.signal_date ?? new Date().toISOString(),
  };
}

export function calculateVelocity(
  dataPoints: { value: number; date: string }[],
): number {
  if (dataPoints.length < 2) return 0;

  const sorted = [...dataPoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const recent = sorted.slice(-3);
  if (recent.length < 2) return 0;

  const oldValue = recent[0].value;
  const newValue = recent[recent.length - 1].value;

  if (oldValue === 0) return 0;

  return ((newValue - oldValue) / oldValue) * 100;
}

export function inferGrowthDirection(
  velocity: number,
  strengthScore: number,
  signalCount: number,
): GrowthDirection {
  if (signalCount < 3) {
    return "emerging";
  }

  if (Math.abs(velocity) > 30) {
    return "volatile";
  }

  if (velocity > 15) {
    return "rising";
  }

  if (velocity < -15) {
    return "declining";
  }

  return "stable";
}

export function mergeSignalMetadata(
  existing: Record<string, any>,
  incoming: Record<string, any>,
): Record<string, any> {
  return {
    ...existing,
    ...incoming,
    merged_at: new Date().toISOString(),
  };
}

export function validateSignalThresholds(signal: Partial<MarketSignal>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (signal.confidence_score !== undefined) {
    if (signal.confidence_score < 0 || signal.confidence_score > 100) {
      errors.push("Confidence score must be between 0 and 100");
    }
  }

  if (signal.strength_score !== undefined) {
    if (signal.strength_score < 0 || signal.strength_score > 100) {
      errors.push("Strength score must be between 0 and 100");
    }
  }

  if (!signal.signal_name || signal.signal_name.trim() === "") {
    errors.push("Signal name is required");
  }

  if (!signal.category) {
    errors.push("Signal category is required");
  }

  if (!signal.source) {
    errors.push("Signal source is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function aggregateSignalStrength(signals: MarketSignal[]): number {
  if (signals.length === 0) return 0;

  const weightedSum = signals.reduce((sum, signal) => {
    const weight = signal.confidence_score / 100;
    return sum + signal.strength_score * weight;
  }, 0);

  const totalWeight = signals.reduce((sum, signal) => {
    return sum + signal.confidence_score / 100;
  }, 0);

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function detectSignalAnomaly(
  signal: MarketSignal,
  historical: MarketSignal[],
): boolean {
  if (historical.length < 3) return false;

  const avgStrength =
    historical.reduce((sum, s) => sum + s.strength_score, 0) /
    historical.length;
  const stdDev = Math.sqrt(
    historical.reduce(
      (sum, s) => sum + Math.pow(s.strength_score - avgStrength, 2),
      0,
    ) / historical.length,
  );

  return Math.abs(signal.strength_score - avgStrength) > 2 * stdDev;
}
