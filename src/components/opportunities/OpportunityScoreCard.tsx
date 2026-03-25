// @ts-nocheck
import { TrendingUp, DollarSign, Target, Zap, Users, Signal, Award } from 'lucide-react';
import Card from '../Card';
import { OpportunityLevelBadge } from './OpportunityLevelBadge';
import { OpportunityReasonTag } from './OpportunityReasonTag';
import type { ScoredOpportunity } from '../../lib/opportunities/types';

interface OpportunityScoreCardProps {
  opportunity: ScoredOpportunity;
  onClick?: () => void;
}

export function OpportunityScoreCard({ opportunity, onClick }: OpportunityScoreCardProps) {
  const scoreColor =
    opportunity.overall_score >= 75
      ? 'text-emerald-600'
      : opportunity.overall_score >= 55
      ? 'text-blue-600'
      : 'text-amber-600';

  return (
    <Card hover={!!onClick} className="cursor-pointer" onClick={onClick}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{opportunity.name}</h3>
            {opportunity.description && (
              <p className="text-sm text-gray-600">{opportunity.description}</p>
            )}
          </div>
          <OpportunityLevelBadge level={opportunity.opportunity_level} size="sm" showLabel={false} />
        </div>

        <div className="flex items-center gap-2">
          {opportunity.industry && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
              {opportunity.industry}
            </span>
          )}
          {opportunity.service_type && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {opportunity.service_type}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1">Overall Score</p>
            <p className={`text-2xl font-bold ${scoreColor}`}>{opportunity.overall_score}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Confidence</p>
            <p className="text-2xl font-bold text-gray-900">{opportunity.confidence_level}%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ScoreMetric
            icon={TrendingUp}
            label="Momentum"
            value={opportunity.score.demand_momentum}
          />
          <ScoreMetric
            icon={DollarSign}
            label="Revenue"
            value={opportunity.score.revenue_potential}
          />
          <ScoreMetric icon={Target} label="Fit" value={opportunity.score.implementation_fit} />
        </div>

        {opportunity.reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Key Factors</p>
            <div className="flex flex-wrap gap-2">
              {opportunity.reasons.slice(0, 3).map((reason, index) => (
                <OpportunityReasonTag key={index} reason={reason} size="sm" />
              ))}
            </div>
          </div>
        )}

        {opportunity.recommended_action && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-1">Recommended Action</p>
            <p className="text-sm text-gray-600">{opportunity.recommended_action}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ScoreMetric({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  const color =
    value >= 75 ? 'text-emerald-600' : value >= 55 ? 'text-blue-600' : 'text-amber-600';

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Icon size={12} className="text-gray-400" />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
