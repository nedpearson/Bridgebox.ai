import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, ChevronDown, ChevronUp, AlertCircle, Zap } from 'lucide-react';
import { getOrganizationTokenSummary } from '../../lib/ai/tokenTracker';
import { getActivePricingModel, fmtCurrency, fmtTokens } from '../../lib/billing/pricingEngine';

interface Props {
  organizationId: string;
}

export default function AiUsageWidget({ organizationId }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [pricingModel, setPricingModel] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;
    load();
  }, [organizationId]);

  const load = async () => {
    try {
      const [s, p] = await Promise.all([
        getOrganizationTokenSummary(organizationId, 30),
        getActivePricingModel(organizationId),
      ]);
      setSummary(s);
      setPricingModel(p);
    } catch (_) { /* non-fatal */ }
    finally { setLoading(false); }
  };

  if (loading || (!summary && !pricingModel)) return null;

  const budgetTotal = pricingModel?.estimated_total_monthly_cost ?? 0;
  const costSoFar = summary?.totalCost ?? 0;
  const projectedCost = summary?.projectedMonthlyCost ?? 0;
  const projectedTokens = summary?.projectedMonthlyTokens ?? 0;
  const pct = budgetTotal > 0 ? Math.min(100, Math.round((projectedCost / budgetTotal) * 100)) : 0;
  const isNearLimit = pct >= 80;
  const isOverLimit = pct >= 100;

  const barColor = isOverLimit
    ? '#f87171'
    : isNearLimit
    ? '#fb923c'
    : '#818cf8';

  const topFeatures: [string, { tokens: number; cost: number }][] = Object.entries(summary?.byFeature ?? {})
    .sort((a: any, b: any) => b[1].tokens - a[1].tokens)
    .slice(0, 4) as any;

  const FEATURE_LABELS: Record<string, string> = {
    onboarding: 'Onboarding Setup',
    ai_copilot: 'AI Copilot',
    document_processing: 'Document Processing',
    workflow_agent: 'Workflow Automation',
    optimization_agent: 'System Optimization',
    ai_search: 'AI Search',
    support_agent: 'Support Agent',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">AI Usage This Month</p>
            <p className="text-slate-500 text-xs">
              {fmtTokens(summary?.totalTokens ?? 0)} tokens used · {fmtCurrency(costSoFar)} spent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isNearLimit && (
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              isOverLimit ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
            }`}>
              <AlertCircle className="w-3 h-3" />
              {isOverLimit ? 'Over budget' : 'Near limit'}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Progress bar (always visible) */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Projected monthly usage</span>
          <span className="font-medium" style={{ color: barColor }}>
            {pct}% of budget
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: barColor }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>$0</span>
          {budgetTotal > 0 && <span>Budget: {fmtCurrency(budgetTotal)}/mo</span>}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div className="px-5 py-4 space-y-5">

              {/* Key numbers */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tokens Used', value: fmtTokens(summary?.totalTokens ?? 0), color: '#818cf8' },
                  { label: 'Projected/Month', value: fmtTokens(projectedTokens), color: '#38bdf8' },
                  { label: 'Est. Cost', value: fmtCurrency(projectedCost), color: '#34d399' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="font-bold text-base tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Feature breakdown */}
              {topFeatures.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Usage by Feature
                  </p>
                  <div className="space-y-2.5">
                    {topFeatures.map(([key, val]) => {
                      const totalTok = summary?.totalTokens ?? 1;
                      const share = Math.round((val.tokens / totalTok) * 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-300">{FEATURE_LABELS[key] ?? key}</span>
                            <span className="text-slate-500 tabular-nums">{fmtTokens(val.tokens)} · {share}%</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${share}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full bg-indigo-500/60"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trend message */}
              {projectedCost > 0 && (
                <div className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl px-4 py-3">
                  <TrendingUp className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Based on current usage pace, your AI cost this month will be approximately{' '}
                    <span className="text-white font-semibold">{fmtCurrency(projectedCost)}</span>.
                    {budgetTotal > 0 && projectedCost <= budgetTotal
                      ? ` You\u2019re on track within your plan budget.`
                      : budgetTotal > 0
                      ? ' This exceeds your current plan estimate — consider reviewing your workflows.'
                      : ''}
                  </p>
                </div>
              )}

              {summary?.eventCount === 0 && (
                <p className="text-slate-600 text-xs text-center py-2">No AI activity recorded yet this period.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
