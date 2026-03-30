import { useEffect, useState, useId } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  FileText,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  Brain,
  Sparkles,
  Building2,
  ChevronRight,
  Shield,
  RefreshCw,
  Package,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";
import CreditBalanceMeter from "../../components/billing/CreditBalanceMeter";
import UsageBreakdownCard from "../../components/billing/UsageBreakdownCard";
import AddOnPackGrid from "../../components/billing/AddOnPackGrid";
import UpgradeNudge from "../../components/billing/UpgradeNudge";
import { useAuth } from "../../contexts/AuthContext";
import { creditsService } from "../../lib/db/credits";
import { usageEventsService } from "../../lib/db/usageEvents";
import { billingService } from "../../lib/db/billing";
import { stripeHelpers } from "../../lib/stripe";
import { PLANS, formatPlanPrice } from "../../lib/plans";
import { useEntitlements } from "../../hooks/useEntitlements";
import type { CreditWallet, UsageMetricType } from "../../types/billing";
import { getOrganizationSubscription } from "../../lib/stripe/customerSync";

export default function BillingOverview() {
  const { currentOrganization } = useAuth();
  const tabId = useId();
  const [activeTab, setActiveTab] = useState<
    "overview" | "addons" | "invoices"
  >("overview");
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [usageBreakdown, setUsageBreakdown] = useState<
    Partial<Record<UsageMetricType, number>>
  >({});
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const entitlements = useEntitlements(wallet?.balance ?? 0, creditsUsed);

  useEffect(() => {
    if (currentOrganization) loadData();
    // Check hash for deep-link to addons tab
    if (window.location.hash === "#addons") setActiveTab("addons");
  }, [currentOrganization]);

  const loadData = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      setError("");

      const [subResult, walletData, breakdownData, summary] = await Promise.all(
        [
          getOrganizationSubscription(currentOrganization.id),
          creditsService.getWallet(currentOrganization.id).catch(() => null),
          usageEventsService
            .getMonthlyBreakdown(currentOrganization.id)
            .catch(() => ({})),
          creditsService
            .getMonthlyUsageSummary(currentOrganization.id)
            .catch(() => ({ byType: {}, totalConsumed: 0 })),
        ],
      );

      // Load invoices separately
      const orgInvoices = await billingService
        .getOrganizationInvoices(currentOrganization.id)
        .catch(() => []);

      setSubscription(subResult.subscription ?? null);
      setInvoices(orgInvoices);
      setWallet(walletData);
      setUsageBreakdown(breakdownData as any);
      setCreditsUsed(summary.totalConsumed);
    } catch (err: any) {
      setError(err.message ?? "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const planTier = (currentOrganization as any)?.billing_plan ?? "starter";
  const currentPlan = PLANS.find((p) => p.tier === planTier) ?? PLANS[0];
  const availableUpgrades = PLANS.filter(
    (p) =>
      currentPlan &&
      PLANS.indexOf(p) > PLANS.indexOf(currentPlan) &&
      p.tier !== "enterprise",
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;

  const isEnterprise = (currentOrganization as any)?.is_enterprise_client;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "addons", label: "Add-Ons & Packs" },
    { id: "invoices", label: "Invoices" },
  ] as const;

  return (
    <>
      <AppHeader
        title="Billing & Plan"
        subtitle="Manage your subscription, AI credits, and add-ons"
        action={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="p-8 space-y-6 max-w-6xl">
        {/* Credit nudge */}
        {entitlements.credits.isCritical && !isEnterprise && (
          <UpgradeNudge
            trigger="critical_credits"
            creditsRemaining={entitlements.credits.balance}
          />
        )}
        {!entitlements.credits.isCritical &&
          entitlements.credits.isLow &&
          !isEnterprise && (
            <UpgradeNudge
              trigger="low_credits"
              creditsRemaining={entitlements.credits.balance}
            />
          )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-900 rounded-xl w-fit border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`${tabId}-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? {
                      background: "rgba(99,102,241,0.15)",
                      color: "#818cf8",
                      border: "1px solid rgba(99,102,241,0.25)",
                    }
                  : { color: "#64748b" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Plan card */}
              <Card glass className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white">
                        {currentPlan.name} Plan
                      </h2>
                      {currentPlan.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                          {currentPlan.badge}
                        </span>
                      )}
                      {isEnterprise && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Enterprise
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm italic">
                      {currentPlan.tagline}
                    </p>
                  </div>
                  {!isEnterprise && subscription && (
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">
                        {formatPlanPrice(
                          currentPlan,
                          subscription.billing_cycle ?? "monthly",
                        )}
                      </p>
                      <p className="text-slate-500 text-xs">
                        /{" "}
                        {subscription.billing_cycle === "yearly"
                          ? "year"
                          : "month"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Feature grid */}
                <div className="grid sm:grid-cols-2 gap-2 mb-5">
                  {currentPlan.features
                    .filter((f) => f.included)
                    .slice(0, 8)
                    .map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature.name}
                      </div>
                    ))}
                </div>

                {/* Subscription status */}
                {subscription && (
                  <div className="grid sm:grid-cols-3 gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <div>
                      <p className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Status
                      </p>
                      <p className="text-emerald-400 font-semibold text-sm capitalize">
                        {subscription.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Renewal
                      </p>
                      <p className="text-white font-medium text-sm">
                        {new Date(
                          subscription.current_period_end,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        MRR
                      </p>
                      <p className="text-white font-medium text-sm">
                        {stripeHelpers.formatAmount(subscription.mrr)}
                      </p>
                    </div>
                  </div>
                )}

                {!subscription && !isEnterprise && (
                  <div className="p-4 bg-amber-500/05 border border-amber-500/20 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">
                        No active subscription
                      </p>
                      <p className="text-slate-400 text-xs">
                        Contact your account manager to activate billing.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 rounded-xl text-sm font-semibold transition-all">
                    <ExternalLink className="w-4 h-4" />
                    Manage Subscription
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all">
                    <CreditCard className="w-4 h-4" />
                    Update Payment
                  </button>
                </div>
              </Card>

              {/* Usage breakdown */}
              <UsageBreakdownCard
                breakdown={usageBreakdown}
                totalCreditsConsumed={creditsUsed}
              />

              {/* Upgrade CTA cards */}
              {availableUpgrades.length > 0 && (
                <div>
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                    Upgrade Your Plan
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {availableUpgrades.slice(0, 2).map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{ y: -2 }}
                        className="p-5 rounded-2xl cursor-pointer transition-all"
                        style={{
                          background: "rgba(99,102,241,0.05)",
                          border: "1px solid rgba(99,102,241,0.15)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-bold">{plan.name}</p>
                            {plan.badge && (
                              <span className="text-xs text-indigo-400">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-indigo-400 font-bold">
                              {formatPlanPrice(plan, "monthly")}
                            </p>
                            <p className="text-slate-600 text-xs">/month</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mb-3 italic">
                          {plan.tagline}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-400 font-semibold">
                            +{plan.monthlyCredits} credits/mo
                          </span>
                          <button className="flex items-center gap-1 text-indigo-400 text-xs font-semibold hover:text-indigo-300 transition-colors">
                            View Plan <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Credit meter */}
              <CreditBalanceMeter
                balance={wallet?.balance ?? 0}
                monthlyAllowance={currentPlan.monthlyCredits}
                creditsUsed={creditsUsed}
                isUnlimited={isEnterprise || currentPlan.monthlyCredits === -1}
              />

              {/* What credits buy */}
              <Card glass className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-white font-bold text-sm">Credit Costs</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Voice Blueprint Request", cost: 5, icon: "🎤" },
                    { label: "Recording Analysis", cost: 8, icon: "🎥" },
                    { label: "Screenshot Analysis", cost: 3, icon: "📸" },
                    { label: "Blueprint Generation", cost: 10, icon: "🏗️" },
                    {
                      label: "Workspace Intelligence Run",
                      cost: 15,
                      icon: "🧠",
                    },
                    { label: "Refinement Cycle", cost: 3, icon: "🔄" },
                  ].map(({ label, cost, icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span>{icon}</span> {label}
                      </span>
                      <span className="text-white font-bold tabular-nums">
                        {cost} cr
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab("addons")}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold transition-all"
                  >
                    Buy More Credits
                  </button>
                </div>
              </Card>

              {/* Workspace Learning AI promo */}
              {!entitlements.can("workspace_learning_ai") && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        Workspace Learning AI
                      </p>
                      <p className="text-indigo-400 text-xs">
                        Growth plan feature
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">
                    Your AI learns your business over time — improving every
                    recommendation, reducing friction, and speeding future
                    builds.
                  </p>
                  <button
                    onClick={() => setActiveTab("addons")}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-400 text-xs font-semibold rounded-xl transition-all"
                  >
                    Unlock Learning AI <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Enterprise CTA */}
              <Card glass className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-white font-bold text-sm">
                    Looking for Enterprise?
                  </h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Custom limits, SSO, audit controls, dedicated support, and a
                  white-glove rollout.
                </p>
                <a
                  href="mailto:sales@bridgebox.ai?subject=Enterprise Inquiry"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-amber-500/25 bg-amber-500/05 hover:bg-amber-500/10 text-amber-400 text-xs font-semibold transition-all"
                >
                  Contact Sales <ArrowUpRight className="w-3 h-3" />
                </a>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ── ADD-ONS TAB ── */}
        {activeTab === "addons" && (
          <motion.div
            key="addons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg mb-1">
                Add-Ons &amp; Packs
              </h2>
              <p className="text-slate-400 text-sm">
                Extend your plan with extra credits, recording analyses, and
                done-for-you implementation services.
              </p>
            </div>
            <AddOnPackGrid
              onPurchase={(addonId) => {
                // Placeholder — wire to Stripe checkout when keys are configured
                console.log("Purchase add-on:", addonId);
                alert(
                  `Stripe checkout for ${addonId} will open here once payment keys are configured.`,
                );
              }}
            />
          </motion.div>
        )}

        {/* ── INVOICES TAB ── */}
        {activeTab === "invoices" && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Invoice History
                  </h2>
                  <p className="text-slate-400 text-sm">
                    View and download your billing history
                  </p>
                </div>
                {invoices.length > 3 && (
                  <Button variant="outline" size="sm">
                    Export All
                  </Button>
                )}
              </div>

              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 10).map((invoice, index) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {invoice.invoice_number ??
                              `Invoice #${invoice.id?.slice(0, 8)}`}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {invoice.due_date
                              ? new Date(invoice.due_date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            invoice.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                              : invoice.status === "overdue"
                                ? "bg-red-500/10 text-red-400 border border-red-500/25"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          }`}
                        >
                          {invoice.status}
                        </span>
                        <p className="text-white font-bold">
                          {typeof invoice.amount_due === "number"
                            ? stripeHelpers.formatAmount(
                                invoice.amount_due / 100,
                              )
                            : stripeHelpers.formatAmount(invoice.total ?? 0)}
                        </p>
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No invoices yet</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Invoices will appear here after your first billing cycle.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
}
