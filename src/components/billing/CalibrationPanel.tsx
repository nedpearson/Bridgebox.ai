import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, RefreshCw, Activity, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Minus, Zap, GitBranch, Puzzle
} from 'lucide-react';
import { calibratePricingModel, type CalibrationResult } from '../../lib/billing/pricingCalibrator';
import { fmtCurrency, fmtTokens } from '../../lib/billing/pricingEngine';

interface Props {
  organizationId: string;
  pricingModelId: string;
  organizationName?: string;
}

// ── Confidence pill ───────────────────────────────────────────────────────────
const CONFIDENCE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  very_low:  { label: 'Very Low',  color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  low:       { label: 'Low',       color: '#fb923c', bg: 'rgba(251,146,60,0.1)'  },
  moderate:  { label: 'Moderate',  color: '#facc15', bg: 'rgba(250,204,21,0.1)'  },
  high:      { label: 'High',      color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  very_high: { label: 'Very High', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
};

const ACTION_STYLE: Record<string, { color: string; icon: React.ReactNode }> = {
  no_change:             { color: '#34d399', icon: <CheckCircle2 className="w-4 h-4" /> },
  minor_adjustment:      { color: '#facc15', icon: <Minus className="w-4 h-4" /> },
  significant_adjustment:{ color: '#fb923c', icon: <AlertTriangle className="w-4 h-4" /> },
  review_required:       { color: '#f87171', icon: <AlertTriangle className="w-4 h-4" /> },
};

// ── Mini bar chart ─────────────────────────────────────────────────────────────
function SparkBar({ buckets }: { buckets: Array<{ tokens: number }> }) {
  const max = Math.max(...buckets.map(b => b.tokens), 1);
  const last14 = buckets.slice(-14);
  return (
    <div className="flex items-end gap-px h-10">
      {last14.map((b, i) => {
        const h = Math.round((b.tokens / max) * 100);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${Math.max(4, h)}%`,
              background: `rgba(129,140,248,${0.3 + (h / 100) * 0.7})`,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Drift indicator ────────────────────────────────────────────────────────────
function DriftChip({ ratio }: { ratio: number }) {
  const pct = Math.round((ratio - 1) * 100);
  const positive = pct > 0;
  const neutral = Math.abs(pct) < 5;

  if (neutral) return (
    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> On-track
    </span>
  );

  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color: positive ? '#fb923c' : '#34d399', background: positive ? 'rgba(251,146,60,0.1)' : 'rgba(52,211,153,0.1)' }}
    >
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct)}% {positive ? 'over' : 'under'}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CalibrationPanel({ organizationId, pricingModelId, organizationName }: Props) {
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const runCalibration = async () => {
    setLoading(true);
    try {
      const r = await calibratePricingModel(organizationId, pricingModelId);
      setResult(r);
      setHasLoaded(true);
    } catch (err) {
      console.error('[CalibrationPanel] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runCalibration(); }, [organizationId, pricingModelId]);

  if (!hasLoaded) {
    return (
      <div className="flex items-center gap-3 px-5 py-6 text-slate-500 text-sm">
        <div className="w-4 h-4 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        {loading ? 'Running calibration…' : 'Awaiting data…'}
      </div>
    );
  }

  if (!result) return null;

  const { record, prediction, wasCalibrated, recommendedAction, adjustmentSummary } = result;
  const confStyle = CONFIDENCE_STYLE[record.confidenceLabel] ?? CONFIDENCE_STYLE.low;
  const actionStyle = ACTION_STYLE[recommendedAction] ?? ACTION_STYLE.no_change;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Calibration · {organizationName ?? 'Organization'}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            Last run: {new Date(record.calibratedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={runCalibration}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Recalibrate
        </button>
      </div>

      {/* ── Status banner ── */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 border"
        style={{ borderColor: `${actionStyle.color}25`, background: `${actionStyle.color}08` }}
      >
        <span style={{ color: actionStyle.color }} className="mt-0.5 shrink-0">{actionStyle.icon}</span>
        <div>
          <p className="text-white text-sm font-medium">{adjustmentSummary}</p>
          {!wasCalibrated && (
            <p className="text-slate-500 text-xs mt-1">
              Pricing engine will auto-calibrate once {Math.max(0, 10 - record.dataSampleSize)} more AI events are recorded.
            </p>
          )}
        </div>
      </div>

      {/* ── Key metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Confidence */}
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Confidence</p>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: confStyle.color, background: confStyle.bg }}
          >
            {confStyle.label}
          </span>
          <p className="text-slate-600 text-xs mt-1">{record.dataSampleSize} events</p>
        </div>

        {/* Token drift */}
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1.5">Token Drift</p>
          <DriftChip ratio={record.tokenDriftRatio} />
          <p className="text-slate-600 text-xs mt-1">{fmtTokens(record.projectedTokens30d)} projected</p>
        </div>

        {/* Estimated vs calibrated */}
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Original Estimate</p>
          <p className="text-white font-bold text-sm">{fmtCurrency(record.estimatedMonthlyTotal)}</p>
          <p className="text-slate-600 text-xs">/mo</p>
        </div>

        <div
          className="rounded-xl p-3 border"
          style={{ background: 'rgba(129,140,248,0.06)', borderColor: 'rgba(129,140,248,0.2)' }}
        >
          <p className="text-slate-400 text-xs mb-1">Calibrated Price</p>
          <p className="font-bold text-sm" style={{ color: '#818cf8' }}>{fmtCurrency(record.calibratedMonthlyTotal)}</p>
          <p className="text-slate-600 text-xs">/mo</p>
        </div>
      </div>

      {/* ── Trend chart ── */}
      {prediction.dailyBuckets.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
              {prediction.accelerating
                ? <TrendingUp className="w-4 h-4 text-orange-400" />
                : <TrendingDown className="w-4 h-4 text-emerald-400" />}
              Usage Trend (last {Math.min(prediction.dailyBuckets.length, 14)} days)
            </p>
            <span className="text-slate-500 text-xs">
              {prediction.growthRatePercent > 0 ? '+' : ''}{prediction.growthRatePercent}% / 30d
            </span>
          </div>
          <SparkBar buckets={prediction.dailyBuckets} />
          {/* Confidence band */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>80% CI: {fmtTokens(prediction.lowerBound30d)} – {fmtTokens(prediction.upperBound30d)}</span>
            <span>R² {prediction.trend.r2.toFixed(2)}</span>
          </div>
          <p className="text-slate-600 text-xs mt-1.5">{record.confidenceReason}</p>
        </div>
      )}

      {/* ── Dimension accuracy ── */}
      {(record.workflowAccuracyScore !== null || record.integrationAccuracyScore !== null) && (
        <div className="grid grid-cols-2 gap-3">
          {record.workflowAccuracyScore !== null && (
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-2">
                <GitBranch className="w-3 h-3" /> Workflow Accuracy
              </p>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${record.workflowAccuracyScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: record.workflowAccuracyScore > 70 ? '#34d399' : '#fb923c' }}
                />
              </div>
              <p className="text-white text-xs font-semibold mt-1">{record.workflowAccuracyScore}%</p>
            </div>
          )}
          {record.integrationAccuracyScore !== null && (
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-2">
                <Puzzle className="w-3 h-3" /> Integration Accuracy
              </p>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${record.integrationAccuracyScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: record.integrationAccuracyScore > 70 ? '#34d399' : '#fb923c' }}
                />
              </div>
              <p className="text-white text-xs font-semibold mt-1">{record.integrationAccuracyScore}%</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
