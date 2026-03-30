// @ts-nocheck
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Card from "../../components/Card";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { billingService } from "../../lib/db/billing";
import { stripeHelpers } from "../../lib/stripe";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";

export default function ClientBilling() {
  const { currentOrganization } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBillingData();
  }, [currentOrganization]);

  const loadBillingData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const [subData, invoiceData] = await Promise.all([
        billingService.getOrganizationSubscription(currentOrganization.id),
        billingService.getOrganizationInvoices(currentOrganization.id),
      ]);

      setSubscription(subData);
      setInvoices(invoiceData);
    } catch (err: any) {
      setError(err.message || "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "sent":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
      case "active":
        return "success";
      case "overdue":
      case "past_due":
        return "error";
      case "sent":
        return "warning";
      default:
        return "default";
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
          <p className="text-slate-400">
            Manage your subscription and view invoices
          </p>
        </div>

        {subscription ? (
          <>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card glass className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">
                      Monthly Subscription
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {stripeHelpers.formatAmount(subscription.mrr)}
                    </p>
                  </div>
                  <CreditCard className="w-12 h-12 text-indigo-500 opacity-20" />
                </div>
                <StatusBadge
                  status={subscription.status}
                  variant={getStatusVariant(subscription.status)}
                />
              </Card>

              <Card glass className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">
                      Next Billing Date
                    </p>
                    <p className="text-xl font-bold text-white">
                      {stripeHelpers.formatDate(
                        subscription.current_period_end,
                      )}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-slate-400 opacity-20" />
                </div>
              </Card>

              <Card glass className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">
                      Unpaid Invoices
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {invoices.filter((inv) => inv.status !== "paid").length}
                    </p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-yellow-500 opacity-20" />
                </div>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <Card glass className="lg:col-span-2 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Current Plan
                </h2>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {subscription.subscription_plans?.name || "Unknown Plan"}
                    </h3>
                    <p className="text-2xl text-indigo-500 font-semibold mb-4">
                      {stripeHelpers.formatAmount(subscription.mrr)}/
                      {stripeHelpers.formatInterval(subscription.billing_cycle)}
                    </p>
                    <StatusBadge
                      status={subscription.billing_cycle}
                      variant="info"
                    />
                  </div>
                </div>

                {subscription.subscription_plans?.features && (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-sm font-medium mb-3">
                      Plan Features:
                    </p>
                    {JSON.parse(
                      subscription.subscription_plans.features || "[]",
                    ).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Current billing period
                    </span>
                    <span className="text-white font-medium">
                      {stripeHelpers.formatDate(
                        subscription.current_period_start,
                      )}{" "}
                      -{" "}
                      {stripeHelpers.formatDate(
                        subscription.current_period_end,
                      )}
                    </span>
                  </div>
                </div>
              </Card>

              <Card glass className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Manage Billing
                </h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span>Update Payment Method</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <span>Manage Subscription</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card glass className="p-6 mb-8">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-2xl mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Active Subscription
              </h3>
              <p className="text-slate-400 mb-6">
                You don't have an active subscription at the moment
              </p>
            </div>
          </Card>
        )}

        <Card glass className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Invoice History
          </h2>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {getInvoiceIcon(invoice.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-white font-semibold">
                            {invoice.invoice_number}
                          </h3>
                          <StatusBadge
                            status={invoice.status}
                            variant={getStatusVariant(invoice.status)}
                          />
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <span>
                            Issued:{" "}
                            {stripeHelpers.formatDate(invoice.issue_date)}
                          </span>
                          <span>
                            Due: {stripeHelpers.formatDate(invoice.due_date)}
                          </span>
                          {invoice.paid_date && (
                            <span className="text-[#10B981]">
                              Paid:{" "}
                              {stripeHelpers.formatDate(invoice.paid_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-white">
                          {stripeHelpers.formatAmount(invoice.total)}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {stripeHelpers.formatAmount(invoice.subtotal)} +{" "}
                          {stripeHelpers.formatAmount(invoice.tax)} tax
                        </p>
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No invoices found</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
