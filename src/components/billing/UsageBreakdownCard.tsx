import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { USAGE_METRIC_LABELS, USAGE_METRIC_ICONS } from '../../lib/db/usageEvents';
import type { UsageMetricType } from '../../types/billing';

interface UsageBreakdownCardProps {
  breakdown: Partial<Record<UsageMetricType, number>>;
  periodLabel?: string;
  totalCreditsConsumed?: number;
}

const KEY_METRICS: UsageMetricType[] = [
  'voice_request',
  'recording_analyzed',
  'screenshot_analyzed',
  'blueprint_generated',
  'refinement_processed',
  'integration_connected',
];

export default function UsageBreakdownCard({
  breakdown,
  periodLabel = 'This Month',
  totalCreditsConsumed = 0,
}: UsageBreakdownCardProps) {
  const [expanded, setExpanded] = useState(false);

  const relevantMetrics = KEY_METRICS.filter((k) => (breakdown[k] ?? 0) > 0);
  const maxValue = Math.max(...relevantMetrics.map((k) => breakdown[k] ?? 0), 1);

  const isEmpty = relevantMetrics.length === 0;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Usage Breakdown</p>
            <p className="text-slate-500 text-xs">
              {periodLabel} · {totalCreditsConsumed} credits consumed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEmpty && (
            <span className="text-xs text-slate-600 italic">No activity recorded</span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div className="px-5 py-4 space-y-4">
              {isEmpty ? (
                <div className="text-center py-8">
                  <p className="text-5xl mb-2">📊</p>
                  <p className="text-slate-400 text-sm">No AI activity recorded yet this period.</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Start a voice discovery session or upload a recording to begin.
                  </p>
                </div>
              ) : (
                relevantMetrics.map((metric) => {
                  const value = breakdown[metric] ?? 0;
                  const pct = Math.round((value / maxValue) * 100);
                  const label = USAGE_METRIC_LABELS[metric] ?? metric;
                  const icon = USAGE_METRIC_ICONS[metric] ?? '⚡';

                  return (
                    <div key={metric}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span>{icon}</span>
                          {label}
                        </span>
                        <span className="text-slate-400 tabular-nums font-medium">
                          {value.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full bg-indigo-500/70"
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {/* All metrics with zero value */}
              {!isEmpty && relevantMetrics.length < KEY_METRICS.length && (
                <div className="pt-2 border-t border-slate-800/50">
                  <p className="text-slate-600 text-xs mb-2">Not used this period:</p>
                  <div className="flex flex-wrap gap-2">
                    {KEY_METRICS.filter((k) => (breakdown[k] ?? 0) === 0).map((metric) => (
                      <span
                        key={metric}
                        className="text-xs text-slate-600 bg-slate-800/40 px-2 py-1 rounded-lg"
                      >
                        {USAGE_METRIC_ICONS[metric]} {USAGE_METRIC_LABELS[metric] ?? metric}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
