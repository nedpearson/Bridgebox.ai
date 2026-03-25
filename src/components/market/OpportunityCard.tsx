// @ts-nocheck
import { TrendingUp, AlertCircle, Target, ChevronRight } from 'lucide-react';
import Card from '../Card';
import { GrowthDirectionBadge } from './GrowthDirectionBadge';
import type { MarketOpportunity } from '../../lib/market/types';

interface OpportunityCardProps {
  opportunity: MarketOpportunity;
  onClick?: () => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const priorityColor = opportunity.priority_score >= 75
    ? 'text-emerald-600'
    : opportunity.priority_score >= 50
    ? 'text-blue-600'
    : 'text-amber-600';

  const confidenceColor = opportunity.confidence_score >= 70
    ? 'text-emerald-600'
    : opportunity.confidence_score >= 50
    ? 'text-blue-600'
    : 'text-amber-600';

  return (
    <Card
      hover
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
          </div>

          {opportunity.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
              {opportunity.industry}
            </span>
            {opportunity.service_type && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                {opportunity.service_type}
              </span>
            )}
            {opportunity.geography && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                {opportunity.geography}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Priority Score</p>
              <p className={`text-lg font-bold ${priorityColor}`}>{opportunity.priority_score}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Confidence</p>
              <p className={`text-lg font-bold ${confidenceColor}`}>{opportunity.confidence_score}%</p>
            </div>
          </div>

          {opportunity.estimated_value && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Estimated Value</p>
              <p className="text-lg font-bold text-gray-900">
                ${opportunity.estimated_value.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <ChevronRight className="text-gray-400 flex-shrink-0 ml-4" size={20} />
      </div>
    </Card>
  );
}
