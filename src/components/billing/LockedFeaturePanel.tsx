import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FeatureKey } from '../../types/billing';
import { getUpgradeContext } from '../../lib/entitlements';

interface LockedFeaturePanelProps {
  feature: FeatureKey;
  currentPlanTier?: string;
  /** Custom headline override */
  headline?: string;
  /** Replace the standard description */
  description?: string;
  /** Show a feature preview screenshot */
  previewImageUrl?: string;
  /** Compact = smaller inline variant */
  compact?: boolean;
  className?: string;
}

const FEATURE_PREVIEW_COPY: Partial<Record<FeatureKey, { headline: string; bullets: string[] }>> = {
  screen_recording_analysis: {
    headline: 'Record your current software. We\'ll extract every workflow.',
    bullets: [
      'Upload screen recordings of tools you use today',
      'AI identifies workflows, pain points, and patterns',
      'Extracted insights feed directly into your blueprint',
    ],
  },
  workspace_learning_ai: {
    headline: 'Your AI learns your business over time.',
    bullets: [
      'Every discovery session improves recommendation quality',
      'AI develops a memory of your team\'s workflow preferences',
      'Becomes more accurate and valuable with each interaction',
    ],
  },
  predictive_recommendations: {
    headline: 'Bridgebox predicts your next best feature.',
    bullets: [
      'Pattern detection across your usage history',
      'Proactive suggestions before you ask',
      'Ranked by business impact and implementation effort',
    ],
  },
  workspace_merge: {
    headline: 'Combine the best features from any workspace.',
    bullets: [
      'Merge approved features from client workspaces',
      'Build reusable feature modules across projects',
      'Unified blueprint for complex multi-workspace deployments',
    ],
  },
  multi_workspace: {
    headline: 'Manage every client or product line in one place.',
    bullets: [
      'Operator view across all workspaces',
      'Per-client intelligence profiles',
      'Implementation status tracking across workspaces',
    ],
  },
  reusable_feature_packs: {
    headline: 'Build once. Deploy to any workspace.',
    bullets: [
      'Save proven feature modules to your library',
      'Instantly add them to new client workspaces',
      'Reduces build time for recurring client needs',
    ],
  },
  implementation_queue: {
    headline: 'Control what gets built and in what order.',
    bullets: [
      'Prioritize features across the delivery queue',
      'Set sprint timelines and track delivery milestones',
      'Full visibility into build progress',
    ],
  },
  white_glove_onboarding: {
    headline: 'We guide you through the entire discovery process.',
    bullets: [
      'Dedicated Bridgebox specialist on your account',
      'Guided voice and recording sessions',
      'Your intelligence profile fully configured at launch',
    ],
  },
};

export default function LockedFeaturePanel({
  feature,
  currentPlanTier = 'starter',
  headline,
  description,
  previewImageUrl,
  compact = false,
  className = '',
}: LockedFeaturePanelProps) {
  const navigate = useNavigate();
  const { requiredPlan, message } = getUpgradeContext(feature, currentPlanTier);
  const preview = FEATURE_PREVIEW_COPY[feature];

  const displayHeadline = headline ?? preview?.headline ?? `Upgrade to unlock this feature`;
  const displayDescription = description ?? message;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-xl ${className}`}
        style={{
          background: 'rgba(245,158,11,0.05)',
          border: '1px solid rgba(245,158,11,0.2)',
        }}
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{displayHeadline}</p>
          <p className="text-slate-500 text-xs">Requires {requiredPlan} plan</p>
        </div>
        <button
          onClick={() => navigate('/app/billing')}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
        >
          Upgrade <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,30,0.95) 0%, rgba(20,15,40,0.95) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        boxShadow: '0 0 40px rgba(245,158,11,0.08)',
      }}
    >
      {/* Lock banner */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}
      >
        <Lock className="w-4 h-4 text-amber-400" />
        <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">
          Requires {requiredPlan} Plan
        </span>
      </div>

      <div className="p-6">
        {/* Preview image */}
        {previewImageUrl && (
          <div className="relative mb-5 rounded-xl overflow-hidden">
            <img
              src={previewImageUrl}
              alt="Feature preview"
              className="w-full h-36 object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                <Eye className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">Preview</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-snug mb-1">{displayHeadline}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{displayDescription}</p>
          </div>
        </div>

        {/* Feature bullets */}
        {preview?.bullets && (
          <ul className="space-y-2 mb-5 pl-2">
            {preview.bullets.map((bullet, i) => (
              <li key={i} className="flex items-center gap-2.5 text-slate-300 text-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#f59e0b' }}
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/billing')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 0 20px rgba(245,158,11,0.3)',
            }}
          >
            Upgrade to {requiredPlan} <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="mailto:sales@bridgebox.ai?subject=Feature Upgrade Enquiry"
            className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
          >
            Talk to Sales
          </a>
        </div>
      </div>
    </motion.div>
  );
}
