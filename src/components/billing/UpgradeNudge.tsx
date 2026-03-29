import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FeatureKey } from '../../types/billing';

type NudgeTrigger =
  | 'low_credits'
  | 'critical_credits'
  | 'recording_limit'
  | 'workspace_limit'
  | 'locked_feature'
  | 'high_activity';

interface UpgradeNudgeProps {
  trigger: NudgeTrigger;
  featureAttempted?: FeatureKey;
  requiredPlan?: string;
  currentUsage?: number;
  limit?: number;
  creditsRemaining?: number;
  onDismiss?: () => void;
}

const NUDGE_COPY: Record<NudgeTrigger, {
  icon: typeof Zap;
  title: string;
  body: (props: UpgradeNudgeProps) => string;
  cta: string;
  color: string;
}> = {
  low_credits: {
    icon: Zap,
    color: '#f59e0b',
    title: 'AI Credits Running Low',
    body: ({ creditsRemaining }) =>
      `You have ${creditsRemaining} credits remaining this month. Top up now to keep your discovery sessions and blueprint runs uninterrupted.`,
    cta: 'Top Up Credits',
  },
  critical_credits: {
    icon: Zap,
    color: '#ef4444',
    title: 'Almost Out of AI Credits',
    body: ({ creditsRemaining }) =>
      `Only ${creditsRemaining} credits left. Voice blueprints, recording analyses, and AI runs will stop working when you hit zero.`,
    cta: 'Top Up or Upgrade',
  },
  recording_limit: {
    icon: TrendingUp,
    color: '#06b6d4',
    title: 'Recording Limit Reached',
    body: ({ currentUsage, limit }) =>
      `You've used ${currentUsage ?? 'all'} of your ${limit ?? '—'} monthly screen recording analyses. Upgrade your plan or add a recording pack.`,
    cta: 'Expand Recordings',
  },
  workspace_limit: {
    icon: TrendingUp,
    color: '#6366f1',
    title: 'Workspace Limit Reached',
    body: ({ currentUsage, limit }) =>
      `You've created ${currentUsage ?? 'all'} of your ${limit ?? '—'} allowed workspaces. Upgrade to Pro to manage up to 10 workspaces.`,
    cta: 'Upgrade to Pro',
  },
  locked_feature: {
    icon: Lock,
    color: '#f59e0b',
    title: 'Feature Not Available on Your Plan',
    body: ({ requiredPlan }) =>
      `This feature requires the ${requiredPlan ?? 'Growth'} plan. Upgrade to unlock it and continue building.`,
    cta: 'View Upgrade Options',
  },
  high_activity: {
    icon: TrendingUp,
    color: '#10b981',
    title: 'You\'re Using Bridgebox Heavily',
    body: () =>
      'Your team is getting a lot of value from Bridgebox. Upgrading to Growth unlocks workspace learning AI, more recordings, and priority support.',
    cta: 'Explore Growth Plan',
  },
};

export default function UpgradeNudge({
  trigger,
  featureAttempted,
  requiredPlan,
  currentUsage,
  limit,
  creditsRemaining,
  onDismiss,
}: UpgradeNudgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const config = NUDGE_COPY[trigger];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleCTA = () => {
    if (trigger === 'low_credits' || trigger === 'critical_credits') {
      navigate('/app/billing#addons');
    } else {
      navigate('/app/billing');
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12, scaleY: 0.95 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: `${config.color}08`,
            border: `1px solid ${config.color}25`,
          }}
        >
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: config.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold mb-0.5">{config.title}</p>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              {config.body({ trigger, featureAttempted, requiredPlan, currentUsage, limit, creditsRemaining })}
            </p>
            <button
              onClick={handleCTA}
              className="flex items-center gap-1.5 text-xs font-bold transition-all"
              style={{ color: config.color }}
            >
              {config.cta} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-slate-600 hover:text-slate-400 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
