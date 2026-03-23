import { TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import Card from '../Card';
import { GrowthDirectionBadge } from './GrowthDirectionBadge';
import type { EmergingTrend } from '../../lib/market/types';

interface EmergingTrendCardProps {
  trend: EmergingTrend;
}

export function EmergingTrendCard({ trend }: EmergingTrendCardProps) {
  const momentumColor = trend.growth_rate >= 75
    ? 'text-emerald-600'
    : trend.growth_rate >= 50
    ? 'text-blue-600'
    : 'text-amber-600';

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{trend.industry}</h3>
          {trend.service_type && (
            <p className="text-sm text-gray-600">{trend.service_type}</p>
          )}
        </div>
        <GrowthDirectionBadge direction={trend.direction} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Momentum</p>
          <p className={`text-xl font-bold ${momentumColor}`}>{trend.growth_rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Signals</p>
          <p className="text-xl font-bold text-gray-900">{trend.signal_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Confidence</p>
          <p className="text-xl font-bold text-gray-900">{trend.confidence}%</p>
        </div>
      </div>

      {trend.key_indicators.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Key Indicators</p>
          <div className="space-y-1.5">
            {trend.key_indicators.slice(0, 3).map((indicator, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                <span className="text-xs text-gray-600 line-clamp-1">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
