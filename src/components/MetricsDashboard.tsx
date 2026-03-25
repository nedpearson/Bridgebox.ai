// @ts-nocheck
import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';
import Card from './Card';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, change, icon: Icon, color = '#3B82F6', trend = 'neutral' }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {change && (
        <div className={`text-xs mt-2 ${getTrendColor()}`}>
          {change}
        </div>
      )}
    </Card>
  );
}

interface MetricsGridProps {
  metrics: MetricCardProps[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  percentage?: number;
  color?: string;
}

export function MetricRow({ label, value, percentage, color = '#3B82F6' }: MetricRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
      {percentage !== undefined && (
        <div className="w-full bg-slate-800/50 rounded-full h-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}

interface MetricsListProps {
  metrics: MetricRowProps[];
  title?: string;
}

export function MetricsList({ metrics, title }: MetricsListProps) {
  return (
    <Card className="p-6">
      {title && <h3 className="text-lg font-bold text-white mb-6">{title}</h3>}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <MetricRow key={index} {...metric} />
        ))}
      </div>
    </Card>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: LucideIcon;
}

export function StatBox({ label, value, color = '#3B82F6', icon: Icon }: StatBoxProps) {
  return (
    <div>
      {Icon && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <p className="text-slate-400 text-sm">{label}</p>
        </div>
      )}
      {!Icon && <p className="text-slate-400 text-sm mb-2">{label}</p>}
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
