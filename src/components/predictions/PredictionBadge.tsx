import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import type { RiskLevel, ConversionLikelihood } from '../../lib/predictiveAnalytics';

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const config = {
    low: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      icon: CheckCircle,
      displayLabel: 'Low Risk',
    },
    medium: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      icon: AlertTriangle,
      displayLabel: 'Medium Risk',
    },
    high: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
      icon: AlertTriangle,
      displayLabel: 'High Risk',
    },
    critical: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      icon: AlertTriangle,
      displayLabel: 'Critical Risk',
    },
  };

  const style = config[level];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="w-3 h-3" />
      {label || style.displayLabel}
    </span>
  );
}

interface ConversionBadgeProps {
  likelihood: ConversionLikelihood;
  label?: string;
}

export function ConversionBadge({ likelihood, label }: ConversionBadgeProps) {
  const config = {
    low: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
      icon: TrendingDown,
      displayLabel: 'Low',
    },
    medium: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      icon: TrendingUp,
      displayLabel: 'Medium',
    },
    high: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      icon: TrendingUp,
      displayLabel: 'High',
    },
    very_high: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      icon: TrendingUp,
      displayLabel: 'Very High',
    },
  };

  const style = config[likelihood];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="w-3 h-3" />
      {label || style.displayLabel}
    </span>
  );
}

interface ConfidenceIndicatorProps {
  score: number;
  showLabel?: boolean;
}

export function ConfidenceIndicator({ score, showLabel = true }: ConfidenceIndicatorProps) {
  const getColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Confidence</span>
          <span className={`font-medium ${getTextColor()}`}>{score}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800/50 rounded-full h-1.5">
        <div
          className={`h-full rounded-full transition-all ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  label?: string;
}

export function TrendIndicator({ trend, label }: TrendIndicatorProps) {
  const config = {
    up: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      icon: TrendingUp,
      displayLabel: 'Trending Up',
    },
    down: {
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: TrendingDown,
      displayLabel: 'Trending Down',
    },
    stable: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      icon: TrendingUp,
      displayLabel: 'Stable',
    },
  };

  const style = config[trend];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" />
      {label || style.displayLabel}
    </span>
  );
}
