import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle2, ArrowRight, Zap, Brain, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FeatureKey, PlanTier } from '../../types/billing';
import { PLANS } from '../../lib/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: string;
  requiredPlanTier?: PlanTier | null;
  customDescription?: string;
  featureKey?: FeatureKey;
  modalType?: 'feature' | 'limit' | 'credits';
  actionType?: 'self-serve' | 'sales';
}

const FEATURE_ICONS: Partial<Record<FeatureKey, typeof Zap>> = {
  workspace_learning_ai: Brain,
  screen_recording_analysis: Video,
};

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan,
  requiredPlanTier,
  customDescription,
  featureKey,
  modalType = 'feature',
  actionType = 'self-serve',
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const targetPlan = requiredPlanTier ? PLANS.find((p) => p.tier === requiredPlanTier) : null;
  const FeatureIcon = featureKey ? (FEATURE_ICONS[featureKey] ?? Lock) : Lock;

  const title =
    modalType === 'limit'
      ? 'Limit Reached'
      : modalType === 'credits'
      ? 'Out of AI Credits'
      : 'Upgrade Required';

  const description =
    customDescription ??
    (modalType === 'limit'
      ? `You've reached the maximum allowance for your current plan. Upgrade to ${requiredPlan} to lift this restriction.`
      : modalType === 'credits'
      ? `You've run out of AI credits for this month. Top up now or upgrade your plan for a higher monthly allowance.`
      : `This feature requires the ${requiredPlan} plan. Upgrade your workspace to instantly access this module.`);

  const accentColor = modalType === 'credits' ? '#ef4444' : '#f59e0b';
  const ctaLabel =
    modalType === 'credits'
      ? 'Top Up Credits'
      : actionType === 'self-serve'
      ? `Upgrade to ${requiredPlan}`
      : 'Contact Sales';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative z-10"
          style={{ border: `1px solid ${accentColor}25` }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
              transform: 'translate(30%, -30%)',
            }}
          />

          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
              >
                <FeatureIcon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <h4 className="text-white font-bold text-lg mb-2">
              {modalType === 'feature' || modalType === 'limit' ? (
                <>
                  Unlock{' '}
                  <span style={{ color: accentColor }}>{featureName}</span>
                </>
              ) : (
                'Refill Your AI Credits'
              )}
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{description}</p>

            {/* Plan highlights */}
            {targetPlan && (
              <div
                className="rounded-xl p-5 mb-5"
                style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
              >
                <p className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: accentColor }} />
                  {targetPlan.name} Plan includes:
                </p>
                <ul className="space-y-2">
                  {targetPlan.features
                    .filter((f) => f.included)
                    .slice(0, 5)
                    .map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {feature.name}
                      </li>
                    ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <p className="text-slate-500 text-xs">{targetPlan.tagline}</p>
                  {targetPlan.pricing.monthly && (
                    <p className="text-white font-black text-sm">
                      from ${(targetPlan.pricing.monthly).toLocaleString()}/mo
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all text-sm"
              >
                Not Now
              </button>
              {actionType === 'self-serve' ? (
                <button
                  onClick={() => {
                    onClose();
                    navigate(modalType === 'credits' ? '/app/billing#addons' : '/app/billing');
                  }}
                  className="flex-1 px-4 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    boxShadow: `0 0 20px ${accentColor}35`,
                  }}
                >
                  {ctaLabel} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href="mailto:sales@bridgebox.ai?subject=Enterprise Upgrade Request"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm text-white"
                >
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
