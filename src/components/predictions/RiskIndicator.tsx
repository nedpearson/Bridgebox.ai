import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import Card from '../Card';
import type { RiskLevel } from '../../lib/predictiveAnalytics';

interface RiskIndicatorProps {
  level: RiskLevel;
  title: string;
  description?: string;
  factors?: string[];
  actions?: string[];
}

export function RiskIndicator({ level, title, description, factors, actions }: RiskIndicatorProps) {
  const config = {
    low: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      icon: CheckCircle,
      iconColor: 'text-green-400',
      label: 'Low Risk',
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      icon: Info,
      iconColor: 'text-yellow-400',
      label: 'Medium Risk',
    },
    high: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      icon: AlertCircle,
      iconColor: 'text-orange-400',
      label: 'High Risk',
    },
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      label: 'Critical Risk',
    },
  };

  const style = config[level];
  const Icon = style.icon;

  return (
    <Card className={`p-6 ${style.bg} border ${style.border}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${style.bg}`}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{title}</h4>
            <span className={`text-xs font-medium ${style.iconColor}`}>{style.label}</span>
          </div>

          {description && (
            <p className="text-sm text-slate-400 mb-4">{description}</p>
          )}

          {factors && factors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-400 mb-2">Risk Factors:</p>
              <ul className="space-y-1">
                {factors.map((factor, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-slate-500 mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actions && actions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Recommended Actions:</p>
              <ul className="space-y-1">
                {actions.map((action, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className={`mt-1 ${style.iconColor}`}>→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface CompactRiskIndicatorProps {
  level: RiskLevel;
  probability: number;
}

export function CompactRiskIndicator({ level, probability }: CompactRiskIndicatorProps) {
  const config = {
    low: { color: 'text-green-400', bg: 'bg-green-500' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500' },
    critical: { color: 'text-red-400', bg: 'bg-red-500' },
  };

  const style = config[level];

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Risk Level</span>
          <span className={`font-medium ${style.color}`}>{level.toUpperCase()}</span>
        </div>
        <div className="w-full bg-slate-800/50 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all ${style.bg}`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </div>
      <div className={`text-lg font-bold ${style.color}`}>
        {probability}%
      </div>
    </div>
  );
}
