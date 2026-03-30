import { Logger } from "./logger";
// @ts-nocheck
import { metricsEngine } from "./metricsEngine";
import { predictiveAnalytics } from "./predictiveAnalytics";
import { trendDetection } from "./trendDetection";
import { aiDecisionEngine } from "./aiDecisionEngine";
import { metricsAggregator } from "./metricsAggregator";
import { marketSignalService } from "./market/services/MarketSignalService";
import { opportunityAnalyzer } from "./opportunities/OpportunityAnalyzer";
import { actionRecommender } from "./agents/actions/ActionRecommender";
import type { AIInsight } from "./aiDecisionEngine";
import type { MarketSignal } from "./market/types";
import type { ScoredOpportunity } from "./opportunities/types";

export interface IntelligenceSnapshot {
  timestamp: string;
  metrics: {
    sales: any;
    operations: any;
    client: any;
    financial: any;
  };
  predictions: {
    revenue: any;
    projectDelivery: any;
    clientChurn: any;
    leadConversion: any;
  };
  trends: {
    hotServices: any[];
    hotIndustries: any[];
    emergingKeywords: any[];
    serviceGrowth: any[];
    industryGrowth: any[];
  };
  marketSignals: {
    signals: MarketSignal[];
    strongSignals: number;
    emergingTrends: number;
  };
  opportunities: {
    scored: ScoredOpportunity[];
    highOpportunities: number;
    totalScore: number;
  };
  insights: AIInsight[];
  recommendedActions: {
    total: number;
    highPriority: number;
    categories: Record<string, number>;
  };
  summary: {
    criticalAlerts: number;
    highPriorityActions: number;
    opportunitiesIdentified: number;
    risksDetected: number;
    confidenceScore: number;
    dataQuality: "excellent" | "good" | "fair" | "limited";
  };
}

export interface IntelligenceBriefing {
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  data: any;
}

class IntelligenceOrchestrator {
  async generateFullIntelligence(
    organizationId?: string,
  ): Promise<IntelligenceSnapshot> {
    const [
      salesMetrics,
      operationsMetrics,
      clientMetrics,
      financialMetrics,
      predictions,
      trends,
      marketData,
      opportunityData,
      insights,
    ] = await Promise.all([
      metricsEngine.calculateConversionRate({ organizationId }),
      metricsEngine.calculateProjectVelocity({ organizationId }),
      metricsEngine.calculateClientHealthScore({ organizationId }),
      metricsEngine.calculateMRR({ organizationId }),
      this.generateAllPredictions(organizationId),
      this.generateAllTrends(),
      organizationId
        ? this.gatherMarketIntelligence(organizationId)
        : this.getEmptyMarketData(),
      organizationId
        ? this.analyzeOpportunities(organizationId)
        : this.getEmptyOpportunityData(),
      aiDecisionEngine.generateInsights(organizationId),
    ]);

    const criticalInsights = insights.filter((i) => i.priority === "critical");
    const highPriorityInsights = insights.filter((i) => i.priority === "high");
    const opportunities = insights.filter((i) => i.category === "opportunity");
    const risks = insights.filter((i) => i.category === "risk");

    const avgConfidence =
      insights.length > 0
        ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
        : 0;

    const actionStats = organizationId
      ? await this.getActionStatistics(organizationId)
      : { total: 0, highPriority: 0, categories: {} };

    const dataQuality = this.assessDataQuality({
      metricsAvailable: !!salesMetrics,
      predictionsAvailable: !!predictions.revenue,
      marketDataAvailable: marketData.signals.length > 0,
      opportunitiesAvailable: opportunityData.scored.length > 0,
    });

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        sales: salesMetrics,
        operations: operationsMetrics,
        client: clientMetrics,
        financial: financialMetrics,
      },
      predictions,
      trends,
      marketSignals: marketData,
      opportunities: opportunityData,
      insights,
      recommendedActions: actionStats,
      summary: {
        criticalAlerts: criticalInsights.length,
        highPriorityActions:
          highPriorityInsights.length + actionStats.highPriority,
        opportunitiesIdentified:
          opportunities.length + opportunityData.highOpportunities,
        risksDetected: risks.length,
        confidenceScore: avgConfidence,
        dataQuality,
      },
    };
  }

  private async generateAllPredictions(organizationId?: string) {
    const [revenue, projectDelivery, clientChurn, leadConversion] =
      await Promise.all([
        predictiveAnalytics
          .forecastRevenue(organizationId, 3)
          .catch(() => null),
        predictiveAnalytics
          .predictProjectDelayBatch(organizationId)
          .catch(() => null),
        predictiveAnalytics
          .predictClientRiskBatch(organizationId)
          .catch(() => null),
        predictiveAnalytics
          .predictLeadConversionBatch(organizationId)
          .catch(() => null),
      ]);

    return { revenue, projectDelivery, clientChurn, leadConversion };
  }

  private async generateAllTrends(organizationId?: string) {
    const [hotOpportunities, serviceGrowth, industryGrowth] = await Promise.all(
      [
        trendDetection
          .getHotOpportunities(organizationId)
          .catch(() => ({
            hotServices: [],
            hotIndustries: [],
            emergingKeywords: [],
          })),
        trendDetection
          .detectTrendingServices(organizationId, 90)
          .catch(() => []),
        trendDetection.detectIndustryGrowth(organizationId, 90).catch(() => []),
      ],
    );

    return {
      hotServices: hotOpportunities.hotServices,
      hotIndustries: hotOpportunities.hotIndustries,
      emergingKeywords: hotOpportunities.emergingKeywords,
      serviceGrowth,
      industryGrowth,
    };
  }

  async generateExecutiveBriefing(
    organizationId?: string,
  ): Promise<IntelligenceBriefing[]> {
    const intelligence = await this.generateFullIntelligence(organizationId);
    const briefings: IntelligenceBriefing[] = [];

    if (intelligence.summary.criticalAlerts > 0) {
      const criticalInsights = intelligence.insights.filter(
        (i) => i.priority === "critical",
      );
      briefings.push({
        title: "Critical Actions Required",
        priority: "critical",
        summary: `${intelligence.summary.criticalAlerts} critical items require immediate attention`,
        keyPoints: criticalInsights.map((i) => i.title),
        recommendations: criticalInsights.map((i) => i.recommendation),
        data: criticalInsights,
      });
    }

    if (intelligence.trends.hotServices.length > 0) {
      const topService = intelligence.trends.hotServices[0];
      if (topService.growthRate > 50) {
        briefings.push({
          title: "High-Growth Service Opportunity",
          priority: "high",
          summary: `${topService.serviceType.replace("_", " ")} is growing ${topService.growthRate.toFixed(0)}% with strong momentum`,
          keyPoints: [
            `${topService.currentPeriodCount} leads in last period`,
            `$${(topService.totalRevenue / 1000).toFixed(0)}K total value`,
            `${topService.conversionRate.toFixed(0)}% conversion rate`,
          ],
          recommendations: [
            "Increase marketing investment in this service area",
            "Develop specialized case studies and materials",
            "Consider hiring specialists for this domain",
          ],
          data: topService,
        });
      }
    }

    if (intelligence.predictions.revenue) {
      const revenue = intelligence.predictions.revenue;
      briefings.push({
        title: "Revenue Forecast",
        priority: "medium",
        summary: `Projected ${revenue.trend === "up" ? "growth" : "decline"} of ${Math.abs(revenue.percentChange).toFixed(0)}% over next quarter`,
        keyPoints: [
          `Current: $${(revenue.current / 1000).toFixed(0)}K`,
          `Projected: $${(revenue.predicted / 1000).toFixed(0)}K`,
          `Confidence: ${(revenue.confidence * 100).toFixed(0)}%`,
        ],
        recommendations: revenue.recommendations || [],
        data: revenue,
      });
    }

    if (intelligence.predictions.clientChurn?.highRiskClients?.length > 0) {
      const churn = intelligence.predictions.clientChurn;
      briefings.push({
        title: "Client Retention Alert",
        priority: "high",
        summary: `${churn.highRiskClients.length} clients at risk of churn`,
        keyPoints: churn.highRiskClients
          .slice(0, 3)
          .map(
            (c: any) =>
              `${c.name}: ${(c.churnProbability * 100).toFixed(0)}% risk`,
          ),
        recommendations: [
          "Schedule retention calls with high-risk clients",
          "Review service quality and satisfaction",
          "Consider offering retention incentives",
        ],
        data: churn,
      });
    }

    const opportunities = intelligence.insights.filter(
      (i) => i.category === "opportunity",
    );
    if (opportunities.length > 0) {
      briefings.push({
        title: "Business Opportunities",
        priority: "medium",
        summary: `${opportunities.length} growth opportunities identified`,
        keyPoints: opportunities.slice(0, 5).map((o) => o.title),
        recommendations: opportunities.slice(0, 5).map((o) => o.recommendation),
        data: opportunities,
      });
    }

    return briefings.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async getBusinessHealth(organizationId?: string): Promise<{
    overall: "excellent" | "good" | "fair" | "poor";
    score: number;
    factors: Array<{
      name: string;
      status: "good" | "warning" | "critical";
      impact: number;
    }>;
  }> {
    const intelligence = await this.generateFullIntelligence(organizationId);
    const factors: Array<{
      name: string;
      status: "good" | "warning" | "critical";
      impact: number;
    }> = [];

    let totalScore = 100;

    if (intelligence.summary.criticalAlerts > 0) {
      factors.push({
        name: "Critical Issues",
        status: "critical",
        impact: -intelligence.summary.criticalAlerts * 10,
      });
      totalScore -= intelligence.summary.criticalAlerts * 10;
    }

    if (intelligence.summary.risksDetected > 3) {
      factors.push({
        name: "Risk Management",
        status: "warning",
        impact: -5,
      });
      totalScore -= 5;
    } else {
      factors.push({
        name: "Risk Management",
        status: "good",
        impact: 5,
      });
      totalScore += 5;
    }

    if (intelligence.summary.opportunitiesIdentified > 0) {
      factors.push({
        name: "Growth Opportunities",
        status: "good",
        impact: Math.min(intelligence.summary.opportunitiesIdentified * 2, 10),
      });
      totalScore += Math.min(
        intelligence.summary.opportunitiesIdentified * 2,
        10,
      );
    }

    if (intelligence.metrics.sales?.conversionRate) {
      const convRate = intelligence.metrics.sales.conversionRate;
      if (convRate > 30) {
        factors.push({ name: "Sales Performance", status: "good", impact: 5 });
        totalScore += 5;
      } else if (convRate < 15) {
        factors.push({
          name: "Sales Performance",
          status: "warning",
          impact: -5,
        });
        totalScore -= 5;
      }
    }

    if (intelligence.predictions.revenue) {
      const revenue = intelligence.predictions.revenue;
      if (revenue.trend === "up") {
        factors.push({ name: "Revenue Trend", status: "good", impact: 5 });
        totalScore += 5;
      } else if (revenue.trend === "down") {
        factors.push({ name: "Revenue Trend", status: "warning", impact: -5 });
        totalScore -= 5;
      }
    }

    totalScore = Math.max(0, Math.min(100, totalScore));

    let overall: "excellent" | "good" | "fair" | "poor";
    if (totalScore >= 85) overall = "excellent";
    else if (totalScore >= 70) overall = "good";
    else if (totalScore >= 50) overall = "fair";
    else overall = "poor";

    return { overall, score: totalScore, factors };
  }

  async getRealtimeMetricsSummary() {
    return {
      status: "aggregate-only",
      message: "Use metricsAggregator for daily computation",
    };
  }

  async getContextualInsights(context: {
    type: "lead" | "project" | "client" | "general";
    organizationId?: string;
    id?: string;
  }): Promise<AIInsight[]> {
    if (context.type === "general") {
      return await aiDecisionEngine.getDashboardInsights(
        context.organizationId,
      );
    }

    if (context.id) {
      return await aiDecisionEngine.getRecommendationsForContext({
        type: context.type,
        id: context.id,
      });
    }

    const allInsights = await aiDecisionEngine.generateInsights(
      context.organizationId,
    );
    return allInsights.filter((i) => {
      if (context.type === "lead") return i.type === "sales";
      if (context.type === "project") return i.type === "project";
      if (context.type === "client") return i.type === "client";
      return true;
    });
  }

  async trackIntelligenceEvent(event: {
    type: "insight_viewed" | "recommendation_acted" | "prediction_validated";
    insightId?: string;
    metadata?: Record<string, any>;
  }) {
    Logger.info("Intelligence event tracked:", event);
  }

  private async gatherMarketIntelligence(organizationId: string) {
    try {
      const { trends, error } = await marketSignalService.getTopEmergingSignals(
        organizationId,
        10,
      );
      if (error) throw error;

      const strongSignals = trends.filter((s) => s.confidence > 80).length;
      const emergingTrends = trends.length;

      return {
        signals: trends as any[],
        strongSignals,
        emergingTrends,
      };
    } catch (error) {
      Logger.error("Error gathering market intelligence:", error);
      return this.getEmptyMarketData();
    }
  }

  private async analyzeOpportunities(organizationId: string) {
    try {
      const { opportunities, error } =
        await opportunityAnalyzer.getRankedOpportunities(organizationId);
      if (error) throw error;
      const highOpportunities = opportunities.filter(
        (o) => o.opportunity_level === "high",
      ).length;
      const totalScore = opportunities.reduce(
        (sum, o) => sum + o.overall_score,
        0,
      );

      return {
        scored: opportunities,
        highOpportunities,
        totalScore,
      };
    } catch (error) {
      Logger.error("Error analyzing opportunities:", error);
      return this.getEmptyOpportunityData();
    }
  }

  private async getActionStatistics(organizationId: string) {
    try {
      const { actionReviewer } = await import("./agents");
      const { stats } = await actionReviewer.getActionStats(organizationId);

      if (!stats) {
        return { total: 0, highPriority: 0, categories: {} };
      }

      return {
        total: stats.total_suggested,
        highPriority: stats.by_priority.high,
        categories: stats.by_category,
      };
    } catch (error) {
      Logger.error("Error getting action statistics:", error);
      return { total: 0, highPriority: 0, categories: {} };
    }
  }

  private getEmptyMarketData() {
    return {
      signals: [],
      strongSignals: 0,
      emergingTrends: 0,
    };
  }

  private getEmptyOpportunityData() {
    return {
      scored: [],
      highOpportunities: 0,
      totalScore: 0,
    };
  }

  private assessDataQuality(checks: {
    metricsAvailable: boolean;
    predictionsAvailable: boolean;
    marketDataAvailable: boolean;
    opportunitiesAvailable: boolean;
  }): "excellent" | "good" | "fair" | "limited" {
    const available = Object.values(checks).filter(Boolean).length;

    if (available === 4) return "excellent";
    if (available === 3) return "good";
    if (available >= 2) return "fair";
    return "limited";
  }

  async generateActionRecommendations(
    organizationId: string,
    entityType: "lead" | "project" | "ticket",
    entityId: string,
  ) {
    try {
      if (entityType === "lead") {
        return await actionRecommender.recommendLeadActions(
          organizationId,
          entityId,
        );
      } else if (entityType === "project") {
        return await actionRecommender.recommendProjectActions(
          organizationId,
          entityId,
        );
      } else if (entityType === "ticket") {
        return await actionRecommender.recommendSupportActions(
          organizationId,
          entityId,
        );
      }
      return [];
    } catch (error) {
      Logger.error("Error generating action recommendations:", error);
      return [];
    }
  }
}

export const intelligenceOrchestrator = new IntelligenceOrchestrator();
