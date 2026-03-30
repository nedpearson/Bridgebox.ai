import { useState, useEffect } from "react";
import { TrendingUp, Radar, Target, AlertCircle, Filter } from "lucide-react";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import { EmergingTrendCard } from "../../components/market/EmergingTrendCard";
import { OpportunityCard } from "../../components/market/OpportunityCard";
import { MarketSignalChart } from "../../components/market/MarketSignalChart";
import { SignalStrengthIndicator } from "../../components/market/SignalStrengthIndicator";
import { UncertaintyNotice } from "../../components/intelligence/ConfidenceBadge";
import { useAuth } from "../../contexts/AuthContext";
import {
  getMarketSignals,
  getSignalScores,
  getMarketOpportunities,
} from "../../lib/db/marketSignals";
import { marketSignalService } from "../../lib/market";
import type {
  MarketSignal,
  MarketSignalScore,
  MarketOpportunity,
  EmergingTrend,
} from "../../lib/market/types";

export default function MarketSignals() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [scores, setScores] = useState<MarketSignalScore[]>([]);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [emergingTrends, setEmergingTrends] = useState<EmergingTrend[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (currentOrganization?.id) {
      loadMarketData();
    }
  }, [currentOrganization?.id]);

  async function loadMarketData() {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const [signalsRes, scoresRes, oppsRes, trendsRes] = await Promise.all([
        getMarketSignals(currentOrganization.id, {}),
        getSignalScores(currentOrganization.id, { minOpportunityScore: 40 }),
        getMarketOpportunities(currentOrganization.id, {
          status: "identified",
        }),
        marketSignalService.getTopEmergingSignals(currentOrganization.id, 6),
      ]);

      if (signalsRes.data) setSignals(signalsRes.data);
      if (scoresRes.data) setScores(scoresRes.data);
      if (oppsRes.data) setOpportunities(oppsRes.data);
      if (trendsRes.trends) setEmergingTrends(trendsRes.trends);
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const topScores = scores.slice(0, 3);
  const recentSignals = signals.slice(0, 20);

  const signalsByIndustry = signals.reduce(
    (acc, signal) => {
      const industry = signal.industry || "Other";
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(signal);
      return acc;
    },
    {} as Record<string, MarketSignal[]>,
  );

  const avgConfidence =
    signals.length > 0
      ? Math.round(
          signals.reduce((sum, s) => sum + s.confidence_score, 0) /
            signals.length,
        )
      : 0;

  const avgStrength =
    signals.length > 0
      ? Math.round(
          signals.reduce((sum, s) => sum + s.strength_score, 0) /
            signals.length,
        )
      : 0;

  const risingCount = signals.filter(
    (s) => s.growth_direction === "rising" || s.growth_direction === "emerging",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Radar className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Signals</h1>
            <p className="text-gray-600">
              Track external market motion and identify opportunities
            </p>
          </div>
        </div>
      </div>

      <UncertaintyNotice message="Market signals are based on external data sources and internal trends. Signal strength indicates relative importance, not absolute certainty. Always validate opportunities with your market expertise." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Signals</p>
            <Radar className="text-blue-600" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{signals.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active market indicators</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Rising Signals</p>
            <TrendingUp className="text-emerald-600" size={18} />
          </div>
          <p className="text-3xl font-bold text-emerald-600">{risingCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {signals.length > 0
              ? Math.round((risingCount / signals.length) * 100)
              : 0}
            % of total
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Opportunities</p>
            <Target className="text-blue-600" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {opportunities.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Identified prospects</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Confidence</p>
            <AlertCircle className="text-gray-600" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgConfidence}%</p>
          <p className="text-xs text-gray-500 mt-1">Signal reliability</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Emerging Trends
        </h2>
        {emergingTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergingTrends.map((trend, index) => (
              <EmergingTrendCard key={index} trend={trend} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No emerging trends detected yet
            </p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Market Opportunities
        </h2>
        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.slice(0, 6).map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No opportunities identified yet
            </p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Industry Activity
        </h2>
        {Object.keys(signalsByIndustry).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(signalsByIndustry)
              .slice(0, 4)
              .map(([industry, industrySignals]) => (
                <Card key={industry}>
                  <MarketSignalChart
                    signals={industrySignals}
                    industry={industry}
                  />
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No signal data available
            </p>
          </Card>
        )}
      </div>

      {topScores.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Scored Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topScores.map((score) => (
              <Card key={score.id}>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {score.industry}
                  </h3>
                  {score.service_type && (
                    <p className="text-sm text-gray-600">
                      {score.service_type}
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <SignalStrengthIndicator
                    strength={score.opportunity_score}
                    confidence={score.confidence_level}
                    size="sm"
                    showLabels
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Momentum</span>
                    <span className="font-medium text-gray-900">
                      {score.momentum_score}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Signals</span>
                    <span className="font-medium text-gray-900">
                      {score.signal_count}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
