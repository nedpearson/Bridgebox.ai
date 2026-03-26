import { supabase } from '../../supabase';
import { AIProviderFactory } from '../providers';
import { logTokenUsage } from '../tokenTracker';
import { getOrganizationTokenSummary } from '../tokenTracker';

/**
 * BRIDGEBOX AI COST OPTIMIZATION AGENT
 * Analyzes token usage patterns and generates actionable recommendations
 * for reducing AI cost and improving efficiency for an organization.
 */

export interface OptimizationRecommendation {
  category: 'batching' | 'caching' | 'model_switch' | 'workflow_efficiency' | 'integration_efficiency' | 'usage_reduction';
  title: string;
  description: string;
  estimatedSavingPercent: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface OptimizationReport {
  organizationId: string;
  generatedAt: string;
  totalTokensLast30Days: number;
  projectedMonthlyCost: number;
  efficiencyScore: number;     // 0-100
  recommendations: OptimizationRecommendation[];
  topConsumingFeatures: Array<{ feature: string; tokens: number; cost: number }>;
}

export const OptimizationAgent = {
  /**
   * Analyze an organization's token usage and generate cost optimization recommendations.
   */
  async analyzeOrganization(organizationId: string): Promise<OptimizationReport> {
    const summary = await getOrganizationTokenSummary(organizationId, 30);

    const topFeatures = Object.entries(summary.byFeature)
      .map(([feature, data]) => ({ feature, ...data }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5)
      .map(f => ({ feature: f.feature, tokens: f.tokens, cost: f.cost }));

    // Run AI analysis if tokens are available
    let aiRecommendations: OptimizationRecommendation[] = [];

    try {
      const provider = AIProviderFactory.getProvider();
      if (provider.isConfigured() && summary.totalTokens > 0) {
        const analysisPrompt = `
You are the Bridgebox AI Cost Optimization Engine.

Analyze this AI usage data for an organization and return ONLY a valid JSON array of optimization recommendations.

Usage Summary (last 30 days):
- Total tokens: ${summary.totalTokens.toLocaleString()}
- Total cost: $${summary.totalCost}
- Event count: ${summary.eventCount}
- Projected monthly tokens: ${summary.projectedMonthlyTokens.toLocaleString()}
- Projected monthly cost: $${summary.projectedMonthlyCost}
- Top consuming features: ${JSON.stringify(topFeatures)}

Return a JSON array where each item has:
- category: "batching" | "caching" | "model_switch" | "workflow_efficiency" | "integration_efficiency" | "usage_reduction"
- title: short actionable title (max 60 chars)
- description: specific recommendation (max 200 chars)
- estimatedSavingPercent: number (realistic saving % if implemented)
- priority: "high" | "medium" | "low"
- actionable: true
        `.trim();

        const response = await provider.complete({
          messages: [
            { role: 'system', content: 'You are an AI cost optimization engine. Return ONLY a valid JSON array with no additional text.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.2,
          maxTokens: 1500,
        });

        // Log this optimization analysis call
        if (response.usage) {
          await logTokenUsage({
            organizationId,
            featureContext: 'optimization_agent',
            agentName: 'OptimizationAgent',
            promptTokens: response.usage.inputTokens,
            completionTokens: response.usage.outputTokens,
            aiModel: response.model,
          });
        }

        if (response.content) {
          let raw = response.content.trim().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(raw);
          aiRecommendations = Array.isArray(parsed) ? parsed : [];
        }
      }
    } catch (err) {
      console.warn('[OptimizationAgent] AI analysis failed, using heuristics:', err);
    }

    // Fallback heuristic recommendations
    if (aiRecommendations.length === 0) {
      aiRecommendations = generateHeuristicRecommendations(summary);
    }

    // Calculate efficiency score (higher = more efficient)
    const efficiencyScore = calculateEfficiencyScore(summary, topFeatures);

    const report: OptimizationReport = {
      organizationId,
      generatedAt: new Date().toISOString(),
      totalTokensLast30Days: summary.totalTokens,
      projectedMonthlyCost: summary.projectedMonthlyCost,
      efficiencyScore,
      recommendations: aiRecommendations.slice(0, 6),
      topConsumingFeatures: topFeatures,
    };

    // Persist report to DB
    try {
      await supabase.from('bb_platform_cost_events').insert({
        organization_id: organizationId,
        event_type: 'ai_agent_run',
        quantity: 1,
        unit: 'report',
        unit_cost_usd: 0,
        total_cost_usd: 0,
        reference_type: 'optimization_report',
        metadata: { report: { efficiencyScore, recommendationCount: aiRecommendations.length } },
      });
    } catch (_) { /* non-fatal */ }

    return report;
  },
};

function generateHeuristicRecommendations(summary: any): OptimizationRecommendation[] {
  const recs: OptimizationRecommendation[] = [];

  if (summary.projectedMonthlyTokens > 2_000_000) {
    recs.push({
      category: 'caching',
      title: 'Enable AI Response Caching',
      description: 'Cache frequent AI query results to reduce repeated token generation. High-frequency identical queries are a prime caching target.',
      estimatedSavingPercent: 20,
      priority: 'high',
      actionable: true,
    });
  }

  if (summary.eventCount > 500) {
    recs.push({
      category: 'batching',
      title: 'Batch Similar AI Requests',
      description: 'Group similar AI document and workflow analysis calls into single batch requests to reduce per-call overhead.',
      estimatedSavingPercent: 15,
      priority: 'medium',
      actionable: true,
    });
  }

  if (summary.projectedMonthlyTokens > 1_000_000) {
    recs.push({
      category: 'model_switch',
      title: 'Route Simple Tasks to Smaller Models',
      description: 'Non-complex classification and summarization tasks can use faster, cheaper models (e.g. GPT-4o-mini) without quality loss.',
      estimatedSavingPercent: 30,
      priority: 'high',
      actionable: true,
    });
  }

  return recs;
}

function calculateEfficiencyScore(summary: any, topFeatures: any[]): number {
  let score = 80; // Start at 80

  // Penalize if a single feature consumes > 60% of tokens
  if (topFeatures.length > 0 && summary.totalTokens > 0) {
    const topShare = topFeatures[0].tokens / summary.totalTokens;
    if (topShare > 0.6) score -= 20;
    else if (topShare > 0.4) score -= 10;
  }

  // Penalize for very high token counts
  if (summary.projectedMonthlyTokens > 5_000_000) score -= 15;
  else if (summary.projectedMonthlyTokens > 2_000_000) score -= 7;

  return Math.max(20, Math.min(100, score));
}
