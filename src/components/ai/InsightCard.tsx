// @ts-nocheck
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Users,
  FolderKanban,
  Building2,
  Brain,
} from "lucide-react";
import Card from "../Card";
import { ConfidenceBadge } from "../intelligence/ConfidenceBadge";
import type {
  AIInsight,
  InsightType,
  InsightCategory,
  InsightPriority,
} from "../../lib/aiDecisionEngine";

interface InsightCardProps {
  insight: AIInsight;
  onClick?: () => void;
  compact?: boolean;
}

export function InsightCard({
  insight,
  onClick,
  compact = false,
}: InsightCardProps) {
  const categoryConfig: Record<
    InsightCategory,
    { bg: string; border: string; icon: any; label: string }
  > = {
    opportunity: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: TrendingUp,
      label: "Opportunity",
    },
    risk: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: AlertTriangle,
      label: "Risk",
    },
    optimization: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: Zap,
      label: "Optimization",
    },
    alert: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      icon: AlertTriangle,
      label: "Alert",
    },
  };

  const priorityConfig: Record<
    InsightPriority,
    { color: string; label: string }
  > = {
    critical: { color: "text-red-400", label: "Critical" },
    high: { color: "text-orange-400", label: "High Priority" },
    medium: { color: "text-yellow-400", label: "Medium Priority" },
    low: { color: "text-slate-400", label: "Low Priority" },
  };

  const typeIcons: Record<InsightType, any> = {
    sales: Target,
    project: FolderKanban,
    client: Building2,
    automation: Zap,
    strategic: Brain,
  };

  const category = categoryConfig[insight.category];
  const priority = priorityConfig[insight.priority];
  const TypeIcon = typeIcons[insight.type];
  const CategoryIcon = category.icon;

  const impactColor = {
    high: "text-green-400",
    medium: "text-yellow-400",
    low: "text-slate-400",
  }[insight.impact];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`${category.bg} border ${category.border} ${
          onClick ? "cursor-pointer hover:border-blue-500/50" : ""
        } transition-all`}
        onClick={onClick}
      >
        <div
          className={`p-${compact ? "4" : "6"} space-y-${compact ? "3" : "4"}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 ${category.bg} rounded-lg flex-shrink-0`}>
                <CategoryIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className={`text-xs font-medium ${priority.color} flex items-center gap-1`}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {priority.label}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 capitalize">
                    {insight.type}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span
                    className={`text-xs ${impactColor} font-medium capitalize`}
                  >
                    {insight.impact} Impact
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1 break-words">
                  {insight.title}
                </h3>
                {!compact && (
                  <p className="text-sm text-slate-300 mb-2">
                    {insight.description}
                  </p>
                )}
              </div>
            </div>
            {onClick && (
              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
            )}
          </div>

          {!compact && (
            <>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-1">AI Reasoning</p>
                    <p className="text-sm text-slate-300">
                      {insight.reasoning}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700">
                  <ConfidenceBadge confidence={insight.confidence} size="sm" />
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {(insight.confidence * 100).toFixed(0)}% confident
                    </span>
                  </div>
                </div>
              </div>

              {insight.actionItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Recommended Actions
                  </p>
                  <div className="space-y-1.5">
                    {insight.actionItems.map((action, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-300">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {compact && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {(insight.confidence * 100).toFixed(0)}% confidence
              </span>
              <span className="text-blue-400">View details →</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface InsightListProps {
  insights: AIInsight[];
  onInsightClick?: (insight: AIInsight) => void;
  compact?: boolean;
  limit?: number;
}

export function InsightList({
  insights,
  onInsightClick,
  compact = false,
  limit,
}: InsightListProps) {
  const displayInsights = limit ? insights.slice(0, limit) : insights;

  if (insights.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No insights available yet</p>
        <p className="text-sm text-slate-500 mt-1">
          AI will analyze your data and provide recommendations
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayInsights.map((insight) => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface InsightSummaryProps {
  insights: AIInsight[];
}

export function InsightSummary({ insights }: InsightSummaryProps) {
  const criticalCount = insights.filter(
    (i) => i.priority === "critical",
  ).length;
  const highCount = insights.filter((i) => i.priority === "high").length;
  const opportunityCount = insights.filter(
    (i) => i.category === "opportunity",
  ).length;
  const riskCount = insights.filter((i) => i.category === "risk").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-red-500/10 border-red-500/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-2xl font-bold text-white">{criticalCount}</p>
            <p className="text-xs text-slate-400">Critical</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-orange-500/10 border-orange-500/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <div>
            <p className="text-2xl font-bold text-white">{highCount}</p>
            <p className="text-xs text-slate-400">High Priority</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-green-500/10 border-green-500/30">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-2xl font-bold text-white">{opportunityCount}</p>
            <p className="text-xs text-slate-400">Opportunities</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-2xl font-bold text-white">{riskCount}</p>
            <p className="text-xs text-slate-400">Risks</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
