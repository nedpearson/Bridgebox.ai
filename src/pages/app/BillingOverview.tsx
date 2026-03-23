import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  FileText,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Building2
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import SubscriptionStatusBadge from '../../components/billing/SubscriptionStatusBadge';
import BillingPlanBadge from '../../components/billing/BillingPlanBadge';
import { useAuth } from '../../contexts/AuthContext';
import { billingService } from '../../lib/db/billing';
import { stripeHelpers } from '../../lib/stripe';
import { PLANS, formatPlanPrice } from '../../lib/plans';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import {
  getOrganizationSubscription,
  getOrganizationInvoices,
  getBillingPlanDisplay,
} from '../../lib/stripe/customerSync';

export default function BillingOverview() {
  const { currentOrganization } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBillingData();
  }, [currentOrganization]);

  const loadBillingData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      setError('');

      const [subResult, invoiceResult] = await Promise.all([
        getOrganizationSubscription(currentOrganization.id),
        getOrganizationInvoices(currentOrganization.id),
      ]);

      if (subResult.error) {
        console.error('Failed to load subscription:', subResult.error);
      }

      if (invoiceResult.error) {
        console.error('Failed to load invoices:', invoiceResult.error);
      }

      setSubscription(subResult.subscription);
      setInvoices(invoiceResult.invoices);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'success';
      case 'overdue':
      case 'past_due':
        return 'error';
      case 'sent':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const currentPlan = PLANS.find(p => p.id === subscription?.plan_id);
  const availableUpgrades = PLANS.filter(p =>
    currentPlan && PLANS.indexOf(p) > PLANS.indexOf(currentPlan)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <>
      <AppHeader
        title="Billing & Subscription"
        subtitle="Manage your subscription, invoices, and payment methods"
        action={
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            View All Invoices
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        {/* Current Subscription Status */}
        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Current Subscription</h2>
              <p className="text-slate-400 text-sm">
                {currentOrganization?.is_enterprise_client
                  ? 'Enterprise client account'
                  : 'Manage your plan and billing'}
              </p>
            </div>
            {currentOrganization?.is_enterprise_client && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg">
                <Building2 className="w-5 h-5 text-[#10B981]" />
                <span className="text-sm font-medium text-[#10B981]">Enterprise Client</span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Plan</p>
              <BillingPlanBadge
                plan={currentOrganization?.billing_plan || null}
                size="lg"
                isEnterprise={currentOrganization?.is_enterprise_client || false}
              />
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Status</p>
              {subscription ? (
                <SubscriptionStatusBadge status={subscription.status} size="lg" />
              ) : (
                <span className="text-slate-500">No active subscription</span>
              )}
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Current Period</p>
              {subscription ? (
                <div className="flex items-center space-x-2 text-white">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">
                    {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-sm">N/A</span>
              )}
            </div>

            <div>
              <p className="text-slate-400 text-sm mb-2">Renewal</p>
              {subscription && subscription.cancel_at_period_end ? (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Canceling</span>
                </div>
              ) : subscription ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Auto-renews</span>
                </div>
              ) : (
                <span className="text-slate-500 text-sm">N/A</span>
              )}
            </div>
          </div>
        </Card>

        {subscription && (
          <>
            <div className="grid md:grid-cols-4 gap-6">

              <Card glass className="p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-[#F59E0B]" />
                  <p className="text-slate-400 text-sm">Next Billing</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {new Date(subscription.current_period_end).getFullYear()}
                </p>
              </Card>

              <Card glass className="p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <p className="text-slate-400 text-sm">Unpaid Invoices</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {invoices.filter(inv => inv.status !== 'paid').length}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {invoices.length} total
                </p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card glass className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Current Plan Details</h2>
                  {subscription.cancel_at_period_end && (
                    <StatusBadge status="Cancels at period end" variant="warning" />
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline space-x-3 mb-4">
                    <h3 className="text-3xl font-bold text-white">
                      {subscription.subscription_plans?.name || 'Unknown Plan'}
                    </h3>
                    <p className="text-2xl text-[#3B82F6] font-semibold">
                      {stripeHelpers.formatAmount(subscription.mrr)}/
                      {stripeHelpers.formatInterval(subscription.billing_cycle)}
                    </p>
                  </div>

                  {subscription.subscription_plans?.features && (
                    <div className="space-y-3 mb-6">
                      {JSON.parse(subscription.subscription_plans.features || '[]').map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Current period</span>
                    <span className="text-white font-medium">
                      {stripeHelpers.formatDate(subscription.current_period_start)} - {stripeHelpers.formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Started on</span>
                    <span className="text-white font-medium">
                      {stripeHelpers.formatDate(subscription.started_at)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span>Manage Subscription</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
                    <CreditCard className="w-4 h-4" />
                    <span>Update Payment</span>
                  </button>
                </div>
              </Card>

              <div className="space-y-6">
                <Card glass className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Upgrade Available</h3>
                      <p className="text-slate-400 text-sm">Get more features</p>
                    </div>
                  </div>

                  {availableUpgrades.length > 0 && (
                    <div className="space-y-3">
                      {availableUpgrades.slice(0, 2).map(plan => (
                        <div key={plan.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">{plan.name}</p>
                            <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{plan.description}</p>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card glass className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Custom Solutions</h3>
                      <p className="text-slate-400 text-sm">Enterprise pricing</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4">
                    Need custom software, dashboards, mobile apps, or enterprise integrations?
                  </p>

                  <Button variant="outline" className="w-full">
                    Request Custom Quote
                  </Button>
                </Card>
              </div>
            </div>
          </>
        )}

        {!subscription && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card glass className="p-8">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-2xl mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                <p className="text-slate-400 mb-6">
                  Choose a plan to unlock platform features and automation tools
                </p>
                <div className="space-y-3">
                  {PLANS.filter(p => p.tier !== 'custom').map(plan => (
                    <div key={plan.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold">{plan.name}</p>
                        <p className="text-[#3B82F6] font-bold">{formatPlanPrice(plan, 'monthly')}/mo</p>
                      </div>
                      <p className="text-slate-400 text-sm">{plan.description}</p>
                    </div>
                  ))}
                </div>
                <Button variant="primary" className="w-full mt-6">
                  View All Plans
                </Button>
              </div>
            </Card>

            <Card glass className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F59E0B]/10 rounded-2xl mb-4">
                  <Building2 className="w-8 h-8 text-[#F59E0B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Custom Development</h3>
                <p className="text-slate-400 mb-6">
                  Looking for custom software, dashboards, mobile apps, or enterprise integrations?
                </p>

                <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50 mb-6 text-left">
                  <h4 className="text-white font-semibold mb-3">We Build:</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Custom Software Solutions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Executive Dashboards & Analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Mobile Applications (iOS & Android)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Enterprise System Integrations</span>
                    </li>
                  </ul>
                </div>

                <Button variant="primary" className="w-full">
                  Request Custom Quote
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Recent Invoices</h2>
              <p className="text-slate-400">View and download your billing history</p>
            </div>
            {invoices.length > 3 && (
              <Button variant="outline" size="sm">
                View All
              </Button>
            )}
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-[#3B82F6]/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-white font-semibold">
                            {invoice.invoice_number || `Invoice #${invoice.id.slice(0, 8)}`}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              invoice.status === 'paid'
                                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                : invoice.status === 'open'
                                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          {invoice.period_start && invoice.period_end && (
                            <span>
                              Period: {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                            </span>
                          )}
                          {invoice.due_date && (
                            <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                          )}
                          {invoice.paid_at && (
                            <span className="text-[#10B981]">
                              Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          ${(invoice.amount_due / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 uppercase">{invoice.currency}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-[#3B82F6] transition-colors"
                            title="View invoice"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-[#3B82F6] transition-colors"
                            title="Download PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No invoices found</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
