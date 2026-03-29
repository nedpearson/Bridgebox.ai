import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Settings, Users, Database, Sparkles, Fingerprint, Zap, TrendingUp, Plus, Minus, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { PLANS } from '../../lib/plans';
import { creditsService } from '../../lib/db/credits';

// ─── Mock tenant data (replace with real DB reads in production) ───────────────
const mockTenants = [
  { name: 'Apex Logistics', plan: 'Pro', status: 'active', mrr: 2997, credits: 420 },
  { name: 'Summit Law', plan: 'Growth', status: 'active', mrr: 1497, credits: 85 },
  { name: 'Bridal Visions', plan: 'Starter', status: 'active', mrr: 497, credits: 12 },
  { name: 'Horizon Health', plan: 'Enterprise', status: 'active', mrr: 0, credits: -1 },
];

const ALL_FEATURE_KEYS = [
  { key: 'voice_to_app', label: 'Voice-to-App Discovery', tier: 'Starter' },
  { key: 'screenshot_analysis', label: 'Screenshot Analysis', tier: 'Starter' },
  { key: 'blueprint_generation', label: 'Blueprint Generation', tier: 'Starter' },
  { key: 'export_blueprint', label: 'Export Blueprint', tier: 'Starter' },
  { key: 'screen_recording_analysis', label: 'Screen Recording Analysis', tier: 'Growth' },
  { key: 'workspace_learning_ai', label: 'Workspace Learning AI', tier: 'Growth' },
  { key: 'reusable_feature_packs', label: 'Reusable Feature Packs', tier: 'Growth' },
  { key: 'advanced_integrations', label: 'Advanced Integrations', tier: 'Growth' },
  { key: 'analytics_suite', label: 'Analytics Suite', tier: 'Growth' },
  { key: 'workspace_merge', label: 'Workspace Merge', tier: 'Pro' },
  { key: 'multi_workspace', label: 'Multi-Workspace Management', tier: 'Pro' },
  { key: 'premium_admin_controls', label: 'Premium Admin Controls', tier: 'Pro' },
  { key: 'predictive_recommendations', label: 'Predictive AI Recommendations', tier: 'Pro' },
  { key: 'implementation_queue', label: 'Implementation Queue', tier: 'Pro' },
  { key: 'white_glove_onboarding', label: 'White-Glove Onboarding', tier: 'Pro' },
  { key: 'priority_support', label: 'Priority Support', tier: 'Pro' },
  { key: 'custom_branding', label: 'Custom Branding', tier: 'Enterprise' },
  { key: 'sso_ready', label: 'SSO-Ready Architecture', tier: 'Enterprise' },
  { key: 'audit_controls', label: 'Audit Controls', tier: 'Enterprise' },
];

const tierColor: Record<string, string> = {
  Starter: '#10b981',
  Growth: '#6366f1',
  Pro: '#f59e0b',
  Enterprise: '#ef4444',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MonetizationHub() {
  const [activeTab, setActiveTab] = useState<'Billing' | 'Credits' | 'Plans' | 'Entitlements'>('Billing');
  const totalMRR = mockTenants.filter(t => t.mrr > 0).reduce((sum, t) => sum + t.mrr, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Monetization Engine</h1>
          <p className="text-sm text-slate-400">Control billing, AI credits, plan limits, and feature entitlement overrides.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'Billing' && <Button className="bg-indigo-500 hover:bg-indigo-600"><Calculator className="w-4 h-4 mr-2" />Pricing Simulator</Button>}
          {activeTab === 'Credits' && <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"><Zap className="w-4 h-4 mr-2" />Bulk Credit Grant</Button>}
          {activeTab === 'Plans' && <Button className="bg-[#10B981] hover:bg-[#059669] text-white border-transparent"><Settings className="w-4 h-4 mr-2" />View Live Plans</Button>}
          {activeTab === 'Entitlements' && <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"><Fingerprint className="w-4 h-4 mr-2" />Audit Sync</Button>}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex space-x-2 border-b border-white/10 mt-6">
        {(['Billing', 'Credits', 'Plans', 'Entitlements'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm transition-colors relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab === 'Billing' ? 'Revenue & Invoices' : tab === 'Credits' ? 'AI Credit Manager' : tab === 'Plans' ? 'Subscription Tiers' : 'Feature Overrides'}
            {activeTab === tab && <motion.div layoutId="monetization-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
          </button>
        ))}
      </div>

      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Billing' && <BillingView totalMRR={totalMRR} />}
            {activeTab === 'Credits' && <CreditsView />}
            {activeTab === 'Plans' && <PlansView />}
            {activeTab === 'Entitlements' && <EntitlementsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Billing View ─────────────────────────────────────────────────────────────

function BillingView({ totalMRR }: { totalMRR: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `$${totalMRR.toLocaleString()}`, sub: `Across ${mockTenants.length} orgs`, color: '#10b981' },
          { label: 'ARR', value: `$${(totalMRR * 12).toLocaleString()}`, sub: 'Annualized', color: '#6366f1' },
          { label: 'Active Orgs', value: String(mockTenants.filter(t => t.status === 'active').length), sub: 'No churn this month', color: '#f59e0b' },
          { label: 'Avg Plan MRR', value: `$${Math.round(totalMRR / Math.max(1, mockTenants.filter(t => t.mrr > 0).length)).toLocaleString()}`, sub: 'Per paying org', color: '#38bdf8' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900/60 rounded-2xl p-5" style={{ border: `1px solid ${stat.color}20` }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 text-slate-400">
              <TrendingUp className="w-3 h-3" style={{ color: stat.color }} /> {stat.label}
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="text-xs mt-1 font-medium" style={{ color: stat.color }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50 border-b border-white/5">
              {['Organization', 'Plan', 'Credits', 'Status', 'MRR', ''].map(h => (
                <th key={h} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockTenants.map(tenant => (
              <tr key={tenant.name} className="hover:bg-white/[0.02] cursor-pointer group">
                <td className="px-6 py-4 font-semibold text-white">{tenant.name}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{tenant.plan}</td>
                <td className="px-6 py-4 text-sm text-indigo-400 font-bold">{tenant.credits === -1 ? '∞' : `${tenant.credits} cr`}</td>
                <td className="px-6 py-4 text-sm"><span className="text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded font-bold text-xs uppercase">Active</span></td>
                <td className="px-6 py-4 font-bold text-white">{tenant.mrr === 0 ? 'Custom' : `$${tenant.mrr.toLocaleString()}`}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Credit Manager ───────────────────────────────────────────────────────────

function CreditsView() {
  const [orgId, setOrgId] = useState('');
  const [amount, setAmount] = useState('50');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleAdjust = async (direction: number) => {
    if (!orgId.trim()) { setErr('Enter an organization ID'); return; }
    const qty = parseInt(amount) * direction;
    if (isNaN(qty)) { setErr('Invalid amount'); return; }
    setLoading(true); setErr(''); setSuccess('');
    try {
      await creditsService.adminAdjustBalance(orgId.trim(), qty, reason || (qty > 0 ? 'Admin grant' : 'Admin deduction'));
      setSuccess(`${qty > 0 ? 'Added' : 'Removed'} ${Math.abs(qty)} credits to org ${orgId.slice(0, 8)}…`);
    } catch (e: any) {
      setErr(e.message ?? 'Failed to adjust balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-slate-900/60 p-6 border border-indigo-500/15">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-400" />Manual Credit Adjustment</h3>
        <p className="text-slate-500 text-xs mb-5">Grant or deduct AI credits from any organization wallet.</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Organization ID</label>
            <input type="text" value={orgId} onChange={e => setOrgId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Credit Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1"
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Reason (optional)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Sales concession, onboarding gift..."
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600" />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          {success && <p className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{success}</p>}
          <div className="flex gap-3">
            <button onClick={() => handleAdjust(1)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-sm font-bold transition-all disabled:opacity-50">
              <Plus className="w-4 h-4" />Grant
            </button>
            <button onClick={() => handleAdjust(-1)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-sm font-bold transition-all disabled:opacity-50">
              <Minus className="w-4 h-4" />Deduct
            </button>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-900/60 p-6 border border-white/5">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" />Credit Cost Reference</h3>
        <p className="text-slate-500 text-xs mb-5">Standard costs per AI action (defined in <code className="text-indigo-400">types/billing.ts</code>).</p>
        <div className="space-y-2.5">
          {[
            { label: 'Voice Blueprint Request', cost: 5 },
            { label: 'Recording Analysis', cost: 8 },
            { label: 'Screenshot Analysis', cost: 3 },
            { label: 'Blueprint Generation', cost: 10 },
            { label: 'Workspace Intelligence Run', cost: 15 },
            { label: 'Roadmap Generation', cost: 8 },
            { label: 'Refinement Cycle', cost: 3 },
            { label: 'Integration Setup AI', cost: 5 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">{item.label}</span>
              <span className="text-indigo-400 font-bold text-sm tabular-nums">{item.cost} cr</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Plans View ───────────────────────────────────────────────────────────────

function PlansView() {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const plan = PLANS.find(p => p.id === selectedPlan) ?? PLANS[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map(p => (
          <div key={p.id} onClick={() => setSelectedPlan(p.id)}>
            <Card className={`p-5 cursor-pointer transition-all duration-200 border-2 ${selectedPlan === p.id ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold ${selectedPlan === p.id ? 'text-indigo-400' : 'text-white'}`}>{p.name}</h3>
                {p.badge && <span className="text-xs text-amber-400">{p.badge}</span>}
              </div>
              <div className="text-xl font-black text-white">
                {p.pricing.monthly ? `$${p.pricing.monthly.toLocaleString()}` : 'Custom'}
                {p.pricing.monthly && <span className="text-xs font-medium text-slate-500 ml-1">/mo</span>}
              </div>
              <div className="text-xs text-indigo-400 mt-1">{p.monthlyCredits === -1 ? '∞' : p.monthlyCredits} cr/mo</div>
            </Card>
          </div>
        ))}
      </div>

      <Card className="bg-slate-900/60 p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white flex items-center mb-5"><Settings className="w-5 h-5 mr-2 text-slate-400" />{plan.name} Plan Limits</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Monthly Credits', value: plan.monthlyCredits === -1 ? 'Unlimited' : plan.monthlyCredits, icon: Zap },
            { label: 'Max Workspaces', value: plan.maxWorkspaces === -1 ? 'Unlimited' : plan.maxWorkspaces, icon: Database },
            { label: 'Users/Workspace', value: plan.maxUsersPerWorkspace === -1 ? 'Unlimited' : plan.maxUsersPerWorkspace, icon: Users },
            { label: 'Recordings/Month', value: plan.maxRecordingsPerMonth === -1 ? 'Unlimited' : plan.maxRecordingsPerMonth, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-800/40 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Icon className="w-3.5 h-3.5" />{label}</div>
              <div className="text-white font-bold text-lg">{value}</div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Entitlements Included</p>
          <div className="flex flex-wrap gap-2">
            {plan.entitlements.map(key => (
              <span key={key} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                {key.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Entitlements Override View ───────────────────────────────────────────────

function EntitlementsView() {
  const [orgId, setOrgId] = useState('');
  const [overrides, setOverrides] = useState<Record<string, boolean | undefined>>({});

  const toggle = (key: string) => {
    setOverrides(prev => {
      const current = prev[key];
      if (current === undefined) return { ...prev, [key]: true };
      if (current === true) return { ...prev, [key]: false };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-white/5 rounded-xl">
        <input type="text" value={orgId} onChange={e => setOrgId(e.target.value)}
          placeholder="Organization ID to override..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600" />
        <Button variant="outline" size="sm">Load Org</Button>
      </div>

      <Card className="p-0 bg-slate-900/30 border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/80">
          <h3 className="text-sm font-bold text-white">Feature Entitlement Overrides</h3>
          <p className="text-slate-500 text-xs mt-0.5">Force-grant or revoke features independent of plan tier. Org-specific.</p>
        </div>
        <div className="divide-y divide-white/5">
          {ALL_FEATURE_KEYS.map(feat => {
            const ov = overrides[feat.key];
            return (
              <div key={feat.key} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggle(feat.key)}
                    className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                    style={{ background: ov === false ? '#ef4444' : ov === true ? '#10b981' : '#334155' }}>
                    <span className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all ${ov === true ? 'right-0.5 left-auto' : 'left-0.5'}`} />
                  </button>
                  <div>
                    <p className="text-white text-sm font-semibold">{feat.label}</p>
                    <p className="text-slate-600 text-xs font-mono">{feat.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${tierColor[feat.tier]}15`, color: tierColor[feat.tier], border: `1px solid ${tierColor[feat.tier]}30` }}>
                    {feat.tier}+
                  </span>
                  {ov !== undefined && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${ov ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {ov ? 'Force Granted' : 'Revoked'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
