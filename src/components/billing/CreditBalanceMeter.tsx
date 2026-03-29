import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditBalanceMeterProps {
  balance: number;
  monthlyAllowance: number;
  creditsUsed: number;
  isUnlimited?: boolean;
  compact?: boolean;
  showTopUpCTA?: boolean;
}

export default function CreditBalanceMeter({
  balance,
  monthlyAllowance,
  creditsUsed,
  isUnlimited = false,
  compact = false,
  showTopUpCTA = true,
}: CreditBalanceMeterProps) {
  const navigate = useNavigate();
  const pct = isUnlimited ? 100 : monthlyAllowance > 0 ? Math.round((balance / monthlyAllowance) * 100) : 0;
  const isLow = !isUnlimited && pct < 20;
  const isCritical = !isUnlimited && pct < 5;

  const barColor = isCritical
    ? '#ef4444'
    : isLow
    ? '#f59e0b'
    : '#6366f1';

  const glowColor = isCritical
    ? 'rgba(239,68,68,0.3)'
    : isLow
    ? 'rgba(245,158,11,0.25)'
    : 'rgba(99,102,241,0.25)';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: `${barColor}20`, border: `1px solid ${barColor}30` }}
        >
          <Zap className="w-3 h-3" style={{ color: barColor }} />
        </div>
        <div>
          <p className="text-xs font-semibold text-white tabular-nums">
            {isUnlimited ? '∞' : balance} credits
          </p>
          {!isUnlimited && (
            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15,15,30,0.9) 0%, rgba(20,20,45,0.9) 100%)',
        border: `1px solid ${barColor}30`,
        boxShadow: `0 0 40px ${glowColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `${barColor}15`, border: `1px solid ${barColor}25` }}
          >
            <Zap className="w-5 h-5" style={{ color: barColor }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">AI Credits</p>
            <p className="text-slate-500 text-xs">This month's allowance</p>
          </div>
        </div>
        {(isLow || isCritical) && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: `${barColor}15`,
              border: `1px solid ${barColor}30`,
              color: barColor,
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isCritical ? 'Critical' : 'Low Credits'}
          </div>
        )}
      </div>

      {/* Balance display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-black text-white tabular-nums">
            {isUnlimited ? '∞' : balance.toLocaleString()}
          </span>
          {!isUnlimited && (
            <span className="text-slate-400 text-sm font-medium">
              / {monthlyAllowance.toLocaleString()} credits
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs">
          {isUnlimited
            ? 'Unlimited — Enterprise plan'
            : `${creditsUsed} used · ${balance} remaining this month`}
        </p>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="mb-5">
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, pct)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                boxShadow: `0 0 12px ${barColor}60`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-slate-600 text-xs">0 credits</span>
            <span className="text-xs font-medium" style={{ color: barColor }}>
              {pct}% remaining
            </span>
          </div>
        </div>
      )}

      {/* Usage hint */}
      {!isUnlimited && creditsUsed > 0 && (
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
          <span>
            At this rate, you'll use approximately{' '}
            <span className="text-white font-medium">{Math.min(monthlyAllowance, creditsUsed * 2)}</span> credits this month
          </span>
        </div>
      )}

      {/* Top-up CTA */}
      {showTopUpCTA && !isUnlimited && isLow && (
        <button
          onClick={() => navigate('/app/billing#addons')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: `${barColor}15`,
            border: `1px solid ${barColor}30`,
            color: barColor,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = `${barColor}25`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = `${barColor}15`)}
        >
          <Plus className="w-4 h-4" />
          Top Up Credits
        </button>
      )}
    </div>
  );
}
