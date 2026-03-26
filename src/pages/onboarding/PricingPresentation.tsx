import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingDown, ArrowRight, Check, Zap, Database,
  GitBranch, HardDrive, Puzzle, Shield, ChevronDown, ChevronUp,
  CheckCircle2, Info, RefreshCw, DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  calculatePricing, fmtCurrency, fmtTokens,
  type PricingInputs, type PricingBreakdown
} from '../../lib/billing/pricingEngine';

interface Props {
  sessionId: string;
  organizationId: string;
  onApprove?: (pricingModelId: string) => void;
  onAdjust?: () => void;
}

// ============================================================
// TIER META
// ============================================================
const TIER_META: Record<string, { label: string; gradient: string; accent: string; bg: string }> = {
  low:        { label: 'Starter',    gradient: 'from-slate-400 to-slate-500',   accent: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  medium:     { label: 'Standard',   gradient: 'from-sky-400 to-blue-500',      accent: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
  growth:     { label: 'Growth',     gradient: 'from-indigo-400 to-violet-500', accent: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  high:       { label: 'Scale',      gradient: 'from-violet-400 to-purple-600', accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  enterprise: { label: 'Enterprise', gradient: 'from-amber-400 to-orange-500',  accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
};

// ============================================================
// LINE ITEMS
// ============================================================
interface LineItem {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  adjustable: boolean;
  sliderKey?: 'ai' | 'workflow' | 'storage';
}

function buildLineItems(
  breakdown: PricingBreakdown,
  model: any,
  multipliers: { ai: number; workflow: number; storage: number }
): LineItem[] {
  return [
    {
      id: 'base',
      label: 'Platform Access',
      sublabel: 'Core Bridgebox infrastructure, security & uptime',
      value: breakdown.basePlatformFee,
      icon: <Shield className="w-4 h-4" />,
      color: '#94a3b8',
      adjustable: false,
    },
    {
      id: 'ai',
      label: 'AI Usage',
      sublabel: `~${fmtTokens(Math.round(breakdown.estimatedTokensPerMonth * multipliers.ai))} tokens/mo · ${breakdown.aiTier} tier`,
      value: Math.round(breakdown.aiUsageCost * multipliers.ai * 100) / 100,
      icon: <Sparkles className="w-4 h-4" />,
      color: '#818cf8',
      adjustable: true,
      sliderKey: 'ai',
    },
    {
      id: 'workflow',
      label: 'Workflow Automation',
      sublabel: `${model?.workflow_count ?? 0} workflows · ${model?.workflow_execution_frequency ?? 'medium'} frequency`,
      value: Math.round(breakdown.workflowCost * multipliers.workflow * 100) / 100,
      icon: <GitBranch className="w-4 h-4" />,
      color: '#a78bfa',
      adjustable: true,
      sliderKey: 'workflow',
    },
    {
      id: 'integrations',
      label: 'Integrations',
      sublabel: `${model?.integration_count ?? 0} connected systems · ${model?.integration_complexity ?? 'simple'} sync`,
      value: breakdown.integrationCost,
      icon: <Puzzle className="w-4 h-4" />,
      color: '#38bdf8',
      adjustable: false,
    },
    {
      id: 'storage',
      label: 'Storage & Documents',
      sublabel: `${model?.estimated_storage_gb ?? 0} GB · ${model?.document_processing_volume ?? 0} docs/mo`,
      value: Math.round(breakdown.storageCost * multipliers.storage * 100) / 100,
      icon: <HardDrive className="w-4 h-4" />,
      color: '#34d399',
      adjustable: true,
      sliderKey: 'storage',
    },
    {
      id: 'features',
      label: 'Custom Features',
      sublabel: `${model?.custom_feature_count ?? 0} custom-built modules`,
      value: breakdown.featureCost,
      icon: <Database className="w-4 h-4" />,
      color: '#f59e0b',
      adjustable: false,
    },
    {
      id: 'support',
      label: 'AI Support Agents',
      sublabel: `${model?.support_agent_usage ?? 'standard'} tier`,
      value: breakdown.supportCost,
      icon: <Zap className="w-4 h-4" />,
      color: '#fb7185',
      adjustable: false,
    },
  ];
}

// ============================================================
// SLIDER COMPONENT
// ============================================================
interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}

function PricingSlider({ label, value, onChange, color }: SliderProps) {
  const pct = Math.round((value / 2) * 100);
  const displayLabel =
    value < 0.6 ? 'Minimal' :
    value < 0.85 ? 'Reduced' :
    value < 1.15 ? 'Standard' :
    value < 1.6 ? 'Increased' : 'Maximum';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color, background: `${color}18` }}>
          {displayLabel}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0.25} max={2} step={0.05}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(51,65,85,1) ${pct}%, rgba(51,65,85,1) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>Minimal</span>
        <span>Standard</span>
        <span>Maximum</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PricingPresentation({ sessionId, organizationId, onApprove, onAdjust }: Props) {
  const [pricingModel, setPricingModel] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showOpts, setShowOpts] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const [multipliers, setMultipliers] = useState({ ai: 1.0, workflow: 1.0, storage: 1.0 });

  useEffect(() => { loadPricingModel(); }, [sessionId]);

  const loadPricingModel = async () => {
    try {
      const { data: session } = await supabase
        .from('bb_onboarding_sessions')
        .select('ai_intelligence')
        .eq('id', sessionId)
        .maybeSingle();

      const pricingModelId = session?.ai_intelligence?.pricing_model_id;
      if (pricingModelId) {
        const { data: pricing } = await supabase
          .from('bb_pricing_models')
          .select('*')
          .eq('id', pricingModelId)
          .single();

        setPricingModel(pricing);
        if (pricing?.ai_inputs_snapshot) {
          setBreakdown(calculatePricing(pricing.ai_inputs_snapshot as PricingInputs));
        }
      }
    } catch (err) {
      console.error('Failed to load pricing model', err);
    } finally {
      setLoading(false);
    }
  };

  // Live-calculated totals
  const lineItems = useMemo(() => {
    if (!breakdown || !pricingModel) return [];
    return buildLineItems(breakdown, pricingModel, multipliers);
  }, [breakdown, pricingModel, multipliers]);

  const adjustedTotal = useMemo(() =>
    lineItems.reduce((s, item) => s + item.value, 0),
    [lineItems]);

  const baseTotal = breakdown?.totalMonthly ?? 0;
  const savings = Math.max(0, baseTotal - adjustedTotal);
  const tierMeta = TIER_META[breakdown?.tier ?? 'growth'];

  const handleApprove = async () => {
    if (!pricingModel?.id) return;
    setApproving(true);
    try {
      await supabase.from('bb_pricing_models').update({ status: 'pending_review' }).eq('id', pricingModel.id);
      setApproved(true);
      onApprove?.(pricingModel.id);
    } finally {
      setApproving(false);
    }
  };

  // ── LOADING ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-950">
        <div className="relative w-14 h-14 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-white font-semibold text-lg mb-1">Generating Your Pricing</p>
        <p className="text-slate-500 text-sm">AI is analyzing your business requirements…</p>
      </div>
    );
  }

  // ── NO MODEL ─────────────────────────────────────────────
  if (!breakdown || !pricingModel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <DollarSign className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-xl mb-2">Pricing Pending</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Your implementation engineer will review your setup and generate a custom price shortly.
        </p>
        <button
          onClick={loadPricingModel}
          className="mt-6 flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Check Again
        </button>
      </div>
    );
  }

  // ── MAIN ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tierMeta.gradient}`}>
            <Sparkles className="w-3 h-3" />
            {tierMeta.label} Plan — AI Generated
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Custom Price</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Built specifically around your workflows, integrations, and AI usage. No hidden fees. Adjust anything below.
          </p>
        </motion.div>

        {/* ── TOTAL CARD ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="relative rounded-2xl overflow-hidden border"
          style={{ borderColor: `${tierMeta.accent}30`, background: tierMeta.bg }}
        >
          {/* subtle glow line */}
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${tierMeta.gradient} opacity-60`} />

          <div className="px-8 py-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Monthly Estimate</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white tabular-nums">
                  {fmtCurrency(adjustedTotal)}
                </span>
                <span className="text-slate-500 text-lg mb-1">/mo</span>
              </div>
              <p className="text-slate-500 text-sm mt-1.5">
                Billed annually: <span className="text-emerald-400 font-medium">{fmtCurrency(adjustedTotal * 10)}</span>
                <span className="text-slate-600"> (2 months free)</span>
              </p>
            </div>

            <AnimatePresence>
              {savings > 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex flex-col items-center sm:items-end gap-1"
                >
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {fmtCurrency(savings)}/mo saved
                  </span>
                  <span className="text-slate-600 text-xs">from standard estimate</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── BREAKDOWN ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold text-sm">What's Included</h2>
            <p className="text-slate-500 text-xs mt-0.5">Click any row to learn more. Adjustable rows have a slider icon.</p>
          </div>

          <div className="divide-y divide-slate-800/70">
            {lineItems.map((item, i) => (
              <React.Fragment key={item.id}>
                <button
                  onClick={() => setActiveInfo(activeInfo === item.id ? null : item.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left group"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}18`, color: item.color }}>
                    {item.icon}
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{item.label}</span>
                      {item.adjustable && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">adjustable</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{item.sublabel}</p>
                  </div>

                  {/* Value */}
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold tabular-nums">{fmtCurrency(item.value)}</span>
                    <Info className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition-colors shrink-0" />
                  </div>
                </button>

                {/* Info Expansion */}
                <AnimatePresence>
                  {activeInfo === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-2" style={{ background: `${item.color}06` }}>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {INFO_COPY[item.id] ?? item.sublabel}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}

            {/* Total Row */}
            <div className="flex items-center justify-between px-5 py-4 bg-white/[0.03]">
              <span className="text-slate-300 font-semibold text-sm">Monthly Total</span>
              <span className="text-white text-xl font-black tabular-nums">{fmtCurrency(adjustedTotal)}</span>
            </div>
          </div>
        </motion.div>

        {/* ── ADJUST USAGE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
        >
          <div>
            <h2 className="text-white font-semibold text-sm">Adjust Your Usage</h2>
            <p className="text-slate-500 text-xs mt-0.5">Drag to see how your choices affect the monthly cost in real time.</p>
          </div>

          <PricingSlider
            label="AI Usage Intensity"
            value={multipliers.ai}
            onChange={(v) => setMultipliers(m => ({ ...m, ai: v }))}
            color="#818cf8"
          />
          <PricingSlider
            label="Workflow Automation Depth"
            value={multipliers.workflow}
            onChange={(v) => setMultipliers(m => ({ ...m, workflow: v }))}
            color="#a78bfa"
          />
          <PricingSlider
            label="Storage & Document Volume"
            value={multipliers.storage}
            onChange={(v) => setMultipliers(m => ({ ...m, storage: v }))}
            color="#34d399"
          />

          {/* Reset */}
          {(multipliers.ai !== 1 || multipliers.workflow !== 1 || multipliers.storage !== 1) && (
            <button
              onClick={() => setMultipliers({ ai: 1, workflow: 1, storage: 1 })}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Reset to standard
            </button>
          )}
        </motion.div>

        {/* ── OPTIMIZATIONS ── */}
        {(breakdown?.optimizationOpportunities?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden"
          >
            <button
              onClick={() => setShowOpts(!showOpts)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                {breakdown.optimizationOpportunities.length} Way{breakdown.optimizationOpportunities.length !== 1 ? 's' : ''} to Reduce Your Cost
              </span>
              {showOpts ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            <AnimatePresence>
              {showOpts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-emerald-500/10 overflow-hidden"
                >
                  <div className="px-5 py-4 space-y-3">
                    {breakdown.optimizationOpportunities.map((opt, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{opt}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── NO SURPRISES ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: '🔒', label: 'No hidden fees' },
            { icon: '📊', label: 'Usage-based billing' },
            { icon: '🔄', label: 'Adjust anytime' },
          ].map((p) => (
            <div key={p.label} className="bg-slate-900/60 border border-slate-800 rounded-xl py-3 px-4 text-center">
              <div className="text-xl mb-1">{p.icon}</div>
              <p className="text-slate-400 text-xs font-medium">{p.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="flex flex-col sm:flex-row items-center gap-3 pt-2"
        >
          <button
            onClick={onAdjust}
            className="w-full sm:w-auto text-center px-5 py-3 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-xl transition-colors text-sm font-medium"
          >
            ← Revise Requirements
          </button>

          <button
            onClick={handleApprove}
            disabled={approving || approved}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all ${
              approved
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {approved ? (
              <><CheckCircle2 className="w-4 h-4" /> Submitted for Review</>
            ) : approving ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
            ) : (
              <>Looks Good — Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>

        <p className="text-center text-slate-600 text-xs pb-4">
          Your pricing will be reviewed by your implementation engineer before being finalised.
        </p>
      </div>
    </div>
  );
}

// ── LINE ITEM TOOLTIP COPY ──────────────────────────────────
const INFO_COPY: Record<string, string> = {
  base: 'The base subscription grants access to all core Bridgebox features: security, real-time sync, user management, and platform uptime SLA.',
  ai: 'Covers the AI tokens consumed by your copilot queries, workflow automation decisions, document analysis, and AI search. Token usage is tracked and visible in your dashboard.',
  workflow: 'Each workflow automation has a monthly execution cost based on how often it runs and how many steps it contains. You can pause or scale individual workflows at any time.',
  integrations: 'Connects your existing tools (CRM, ERP, email, etc.) to Bridgebox. Cost scales with the number of systems and how frequently data is synced.',
  storage: 'Storage for uploaded documents, generated files, and processed data. Document processing incurs an additional cost per page for AI extraction.',
  features: 'Custom-built modules specific to your business — unique views, automations, or data models not covered by the standard platform.',
  support: 'AI-powered support and debugging agents that resolve issues, answer questions, and surface insights proactively.',
};
