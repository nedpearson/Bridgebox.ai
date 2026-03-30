import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Building2,
  FileText,
  Zap,
  BarChart3,
  Activity,
  Heart,
  Flame,
  ArrowRight,
  Brain,
  Sparkles,
  Lightbulb,
  LayoutTemplate,
  Database,
  Shield,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";
import SimpleBarChart from "../../components/analytics/SimpleBarChart";
import DonutChart from "../../components/analytics/DonutChart";
import {
  ServiceTrendCard,
  IndustryTrendCard,
} from "../../components/trends/TrendCard";
import AIContent, { AIButton } from "../../components/ai/AIContent";
import { useMetrics, type TimeFilter } from "../../hooks/useMetrics";
import { useBusinessInsights } from "../../hooks/useAI";
import { useAuth } from "../../contexts/AuthContext";
import { trendDetection } from "../../lib/trendDetection";
import {
  intelligenceOrchestrator,
  type IntelligenceBriefing,
} from "../../lib/intelligenceOrchestrator";
import type { ServiceTrend, IndustryTrend } from "../../lib/trendDetection";
import { useEnterpriseMetrics } from "../../hooks/useEnterpriseMetrics";
import SparklineCard from "../../components/analytics/SparklineCard";
import UpgradeModal from "../../components/app/UpgradeModal";
import IndustryBenchmarkCard from "../../components/intelligence/IndustryBenchmarkCard";

type AnalyticsView =
  | "overview"
  | "operations"
  | "sales"
  | "delivery"
  | "billing"
  | "support"
  | "clients"
  | "benchmarks";

export default function Analytics() {
  const { currentOrganization, profile } = useAuth();
  const [view, setView] = useState<AnalyticsView>("overview");
  const isStarter =
    currentOrganization?.billing_plan === "Starter" &&
    profile?.role !== "super_admin" &&
    profile?.role !== "internal_staff";
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30d");
  const { loading, metrics, error } = useMetrics(timeFilter);
  const [hotOpportunities, setHotOpportunities] = useState<any>(null);
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([]);
  const [businessHealth, setBusinessHealth] = useState<any>(null);
  const aiInsights = useBusinessInsights();

  const views = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "operations" as const, label: "Platform Operations", icon: Sparkles },
    { id: "sales" as const, label: "Sales & CRM", icon: TrendingUp },
    { id: "delivery" as const, label: "Delivery", icon: Package },
    { id: "billing" as const, label: "Revenue", icon: DollarSign },
    { id: "support" as const, label: "Support", icon: AlertCircle },
    { id: "clients" as const, label: "Clients", icon: Building2 },
    { id: "benchmarks" as const, label: "Industry Benchmarks", icon: Flame },
  ];

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  const loadIntelligenceData = async () => {
    if (!currentOrganization) return;
    try {
      const [opportunities, executiveBriefings, health] = await Promise.all([
        trendDetection.getHotOpportunities(currentOrganization.id),
        intelligenceOrchestrator.generateExecutiveBriefing(
          currentOrganization.id,
        ),
        intelligenceOrchestrator.getBusinessHealth(currentOrganization.id),
      ]);
      setHotOpportunities(opportunities);
      setBriefings(executiveBriefings);
      setBusinessHealth(health);
    } catch (err) {
      console.error("Failed to load intelligence data:", err);
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

  if (!metrics) {
    return <ErrorState message="No metrics available" />;
  }

  return (
    <>
      <AppHeader
        title="Business Analytics"
        subtitle="Executive insights into sales, delivery, billing, and operations"
      />

      <div
        className={`p-8 space-y-8 ${isStarter ? "filter blur-[8px] pointer-events-none opacity-40 h-[80vh] overflow-hidden select-none" : ""}`}
      >
        {businessHealth && view === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card
              className={`p-6 ${
                businessHealth.overall === "excellent"
                  ? "bg-green-500/10 border-green-500/30"
                  : businessHealth.overall === "good"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : businessHealth.overall === "fair"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      businessHealth.overall === "excellent"
                        ? "bg-green-500/20"
                        : businessHealth.overall === "good"
                          ? "bg-blue-500/20"
                          : businessHealth.overall === "fair"
                            ? "bg-yellow-500/20"
                            : "bg-red-500/20"
                    }`}
                  >
                    <Heart
                      className={`w-8 h-8 ${
                        businessHealth.overall === "excellent"
                          ? "text-green-400"
                          : businessHealth.overall === "good"
                            ? "text-blue-400"
                            : businessHealth.overall === "fair"
                              ? "text-yellow-400"
                              : "text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {businessHealth.overall} Health
                    </h2>
                    <p className="text-sm text-slate-400">
                      Business health score: {businessHealth.score}/100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {businessHealth.factors.map((factor: any, index: number) => (
                    <div key={index} className="text-right">
                      <p className="text-xs text-slate-400">{factor.name}</p>
                      <p
                        className={`text-lg font-bold ${
                          factor.status === "good"
                            ? "text-green-400"
                            : factor.status === "warning"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {factor.impact > 0 ? "+" : ""}
                        {factor.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {briefings.length > 0 && view === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">
                Executive Intelligence Briefing
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {briefings.map((briefing, index) => (
                <Card
                  key={index}
                  className={`p-6 ${
                    briefing.priority === "critical"
                      ? "bg-red-500/10 border-red-500/30"
                      : briefing.priority === "high"
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        briefing.priority === "critical"
                          ? "bg-red-500/20"
                          : briefing.priority === "high"
                            ? "bg-orange-500/20"
                            : "bg-blue-500/20"
                      }`}
                    >
                      {briefing.priority === "critical" ||
                      briefing.priority === "high" ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">
                        {briefing.title}
                      </h3>
                      <p className="text-sm text-slate-300 mb-3">
                        {briefing.summary}
                      </p>
                      {briefing.keyPoints.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {briefing.keyPoints.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-400">
                                {point}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {briefing.recommendations.length > 0 && (
                        <div className="pt-3 border-t border-slate-700">
                          <p className="text-xs font-medium text-slate-400 mb-2">
                            Recommended Actions
                          </p>
                          {briefing.recommendations
                            .slice(0, 2)
                            .map((rec, idx) => (
                              <p
                                key={idx}
                                className="text-xs text-blue-400 mb-1"
                              >
                                → {rec}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {view === "benchmarks" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Primary Data Moat Visualizations */}
            <IndustryBenchmarkCard />

            {/* Placeholders for future benchmark cards */}
            <div className="bg-slate-800/50 border border-slate-700/50 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500">
              <Shield className="w-8 h-8 mb-2 opacity-50" />
              More Aggregated Industry Metrics Calculating...
            </div>
          </motion.div>
        )}

        {view === "overview" && metrics && aiInsights.isAvailable && (
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  AI Business Insights
                </h2>
              </div>
              {!aiInsights.data && !aiInsights.loading && (
                <AIButton
                  onClick={() =>
                    aiInsights.generate({
                      totalLeads: metrics.conversion?.totalLeads || 0,
                      conversionRate: metrics.conversion?.conversionRate || 0,
                      activeProjects: metrics.projects?.activeProjects || 0,
                      revenue: metrics.revenue?.mrr || 0,
                      clientCount: metrics.clients?.activeClients || 0,
                    })
                  }
                >
                  Generate Insights
                </AIButton>
              )}
            </div>

            <AIContent
              loading={aiInsights.loading}
              error={aiInsights.error}
              isAIGenerated={aiInsights.isAIGenerated}
              fromCache={aiInsights.fromCache}
              provider={aiInsights.provider}
              onRetry={() =>
                aiInsights.generate(
                  {
                    totalLeads: metrics.conversion?.totalLeads || 0,
                    conversionRate: metrics.conversion?.conversionRate || 0,
                    activeProjects: metrics.projects?.activeProjects || 0,
                    revenue: metrics.revenue?.mrr || 0,
                    clientCount: metrics.clients?.activeClients || 0,
                  },
                  false,
                )
              }
            >
              {aiInsights.data && (
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-300 leading-relaxed">
                      {aiInsights.data.summary}
                    </p>
                  </div>

                  {aiInsights.data.opportunities &&
                    aiInsights.data.opportunities.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3">
                          Growth Opportunities
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {aiInsights.data.opportunities.map(
                            (opp: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-white">
                                    {opp.title}
                                  </h4>
                                  <div className="flex gap-1">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded ${
                                        opp.impact === "high"
                                          ? "bg-green-500/20 text-green-300"
                                          : opp.impact === "medium"
                                            ? "bg-yellow-500/20 text-yellow-300"
                                            : "bg-slate-500/20 text-slate-300"
                                      }`}
                                    >
                                      {opp.impact} impact
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400">
                                  {opp.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {aiInsights.data.risks &&
                    aiInsights.data.risks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3">
                          Risk Factors
                        </h3>
                        <div className="space-y-3">
                          {aiInsights.data.risks.map(
                            (risk: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-white">
                                    {risk.title}
                                  </h4>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      risk.severity === "high"
                                        ? "bg-red-500/20 text-red-300"
                                        : risk.severity === "medium"
                                          ? "bg-yellow-500/20 text-yellow-300"
                                          : "bg-slate-500/20 text-slate-300"
                                    }`}
                                  >
                                    {risk.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-2">
                                  {risk.description}
                                </p>
                                <p className="text-xs text-slate-500">
                                  <span className="text-slate-400 font-medium">
                                    Mitigation:
                                  </span>{" "}
                                  {risk.mitigation}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {aiInsights.data.recommendations &&
                    aiInsights.data.recommendations.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <h3 className="text-sm font-bold text-white mb-3">
                          Key Recommendations
                        </h3>
                        <div className="space-y-2">
                          {aiInsights.data.recommendations.map(
                            (rec: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-300">
                                  {rec}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </AIContent>
          </Card>
        )}

        {/* View and Time Filter */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide w-full xl:w-auto">
            {views.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  view === id
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1 overflow-x-auto scrollbar-hide w-full xl:w-auto">
            {(["7d", "30d", "90d", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeFilter === filter
                    ? "bg-blue-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter === "all" ? "All Time" : filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {view === "overview" && (
          <>
            {hotOpportunities &&
              (hotOpportunities.hotServices.length > 0 ||
                hotOpportunities.hotIndustries.length > 0) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                        <Flame className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Hot Opportunities
                        </h2>
                        <p className="text-sm text-slate-400">
                          High-growth areas detected
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/app/trends"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All Trends
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotOpportunities.hotServices
                      .slice(0, 2)
                      .map((trend: ServiceTrend, index: number) => (
                        <ServiceTrendCard key={index} trend={trend} />
                      ))}
                    {hotOpportunities.hotIndustries
                      .slice(0, 1)
                      .map((trend: IndustryTrend, index: number) => (
                        <IndustryTrendCard key={index} trend={trend} />
                      ))}
                  </div>
                </div>
              )}

            <OverviewView metrics={metrics} />
          </>
        )}

        {view === "operations" && <OperationsView />}
        {view === "sales" && <SalesView data={metrics.conversion} />}
        {view === "delivery" && <DeliveryView data={metrics.projects} />}
        {view === "billing" && <BillingView data={metrics.revenue} />}
        {view === "support" && <SupportView data={metrics.support} />}
        {view === "clients" && <ClientsView data={metrics.clients} />}
      </div>

      <UpgradeModal
        isOpen={isStarter}
        onClose={() => window.history.back()}
        featureName="Revenue Analytics"
        requiredPlan="Growth"
        modalType="feature"
        actionType="self-serve"
        customDescription="The platform data warehouse and executive telemetry dashboards are restricted to the Growth tier. Upgrade to unlock historical business intelligence."
      />
    </>
  );
}

function OperationsView() {
  const { data, loading, error } = useEnterpriseMetrics();

  if (loading)
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Platform Telemetry</h2>
          <p className="text-sm text-slate-400">
            Live operational data for dynamic Enterprise execution engines.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SparklineCard
          title="Active Workflows"
          value={data.activeWorkflows}
          icon={Zap}
          data={data.workflowSparkline}
          color="#3B82F6"
        />
        <SparklineCard
          title="AI Blueprint Tokens Generated"
          value={data.aiGenerations}
          icon={Brain}
          data={data.aiSparkline}
          color="#8B5CF6"
        />
        <SparklineCard
          title="Pending Offline Syncs"
          value={data.offlineSyncQueueDepth}
          icon={Activity}
          data={Array.from({ length: 6 }, () => ({ value: Math.random() * 5 }))} // Random sparkline for empty queues
          color="#F59E0B"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Card glass className="p-6 border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              Fleet Infrastructure
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-slate-400">Deployed App Instances</span>
              <span className="text-white font-bold">
                {data.mobileDevices} active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">External Webhook Synced</span>
              <span className="text-emerald-400 font-bold">
                {data.syncJobs} running
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OverviewView({ metrics }: { metrics: any }) {
  const { conversion, revenue, projects, support, clients } = metrics;

  const kpis = [
    {
      label: "Total Leads",
      value: conversion.totalLeads.toLocaleString(),
      change: `${conversion.qualifiedLeads} qualified`,
      icon: Users,
      color: "#3B82F6",
      link: "/app/leads",
    },
    {
      label: "Active Projects",
      value: projects.activeProjects.toLocaleString(),
      change: `${projects.atRiskProjects} at risk`,
      icon: Package,
      color: "#10B981",
      link: "/app/projects",
    },
    {
      label: "Monthly Recurring Revenue",
      value: `$${revenue.mrr.toLocaleString()}`,
      change: `$${revenue.arr.toLocaleString()} ARR`,
      icon: DollarSign,
      color: "#F59E0B",
      link: "/app/billing",
    },
    {
      label: "Open Support Tickets",
      value: support.openTickets.toLocaleString(),
      change: `${support.resolvedTickets} resolved`,
      icon: AlertCircle,
      color: "#EF4444",
      link: "/app/support",
    },
    {
      label: "Active Clients",
      value: clients.activeClients.toLocaleString(),
      change: `${clients.retentionRate.toFixed(1)}% retention`,
      icon: Building2,
      color: "#8B5CF6",
      link: "/app/clients",
    },
    {
      label: "Conversion Rate",
      value: `${conversion.overallConversionRate.toFixed(1)}%`,
      change: `${conversion.proposalsAccepted} won`,
      icon: Target,
      color: "#10B981",
      link: "/app/conversions",
    },
    {
      label: "Template Installs",
      value: metrics.templates?.totalInstalls?.toString() || "0",
      change: `${metrics.templates?.recentInstalls || 0} active deployments`,
      icon: LayoutTemplate,
      color: "#8B5CF6",
      link: "/app/templates",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={kpi.link}
              className="block transition-transform hover:-translate-y-1"
            >
              <Card glass className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    <kpi.icon
                      className="w-5 h-5"
                      style={{ color: kpi.color }}
                    />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-white mb-1">
                  {kpi.value}
                </p>
                <p className="text-xs text-slate-500">{kpi.change}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Insights Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-white">Pipeline Health</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Pipeline Value</p>
              <p className="text-3xl font-bold text-white">
                ${(conversion.projectedRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-[#10B981]">
                {conversion.overallConversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-lg font-bold text-white">
              Delivery Performance
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Project Completion</p>
              <p className="text-3xl font-bold text-white">
                {projects.completionRate.toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Avg. Project Length</p>
              <p className="text-3xl font-bold text-indigo-500">
                {projects.avgProjectDuration.toFixed(0)}d
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SalesView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Link
          to="/app/leads"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-indigo-500/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-400 text-sm">Total Leads</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.totalLeads}</p>
          </Card>
        </Link>

        <Link
          to="/app/leads?status=qualified"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Qualified</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.qualifiedLeads}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/conversions"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#F59E0B]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-slate-400 text-sm">Conversion Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.overallConversionRate.toFixed(1)}%
            </p>
          </Card>
        </Link>

        <Link
          to="/app/pipeline"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Pipeline Value</p>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(data.projectedRevenue / 1000).toFixed(0)}K
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Conversion Funnel
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Total Leads</span>
                <span className="text-white font-bold">{data.totalLeads}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Proposals Sent</span>
                <span className="text-white font-bold">
                  {data.proposalsSent}
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="h-full bg-[#8B5CF6] rounded-full"
                  style={{ width: `${data.leadToProposalRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">
                  Proposals Accepted
                </span>
                <span className="text-white font-bold">
                  {data.proposalsAccepted}
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="h-full bg-[#10B981] rounded-full"
                  style={{ width: `${data.proposalAcceptanceRate}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lead to Proposal</span>
              <span className="text-white font-bold">
                {data.leadToProposalRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proposal Acceptance</span>
              <span className="text-white font-bold">
                {data.proposalAcceptanceRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Overall Conversion</span>
              <span className="text-white font-bold">
                {data.overallConversionRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Qualified Leads</span>
              <span className="text-white font-bold">
                {data.qualifiedLeads}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DeliveryView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Link
          to="/app/projects?status=in_progress"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-indigo-500/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Package className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-400 text-sm">Active Projects</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.activeProjects}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/projects?status=needs_attention"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#EF4444]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              <p className="text-slate-400 text-sm">At Risk</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.projectsAtRisk}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/projects?status=completed"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Completed</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.completedProjects}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/projects"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#F59E0B]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-slate-400 text-sm">Avg. Duration</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.averageCompletion.toFixed(0)}d
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Projects by Status
          </h3>
          <DonutChart
            data={data.projectsByStatus.map((item: any) => ({
              label: item.status.replace("_", " "),
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Projects by Phase
          </h3>
          <SimpleBarChart
            data={data.projectsByPhase.map((item: any) => ({
              label: item.phase.replace("_", " "),
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Projects by Service Type
          </h3>
          <SimpleBarChart
            data={data.projectsByServiceType.map((item: any) => ({
              label: item.service_type.replace("_", " "),
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Health Status</h3>
          <DonutChart
            data={data.projectsByHealthStatus.map((item: any) => ({
              label: item.health_status,
              value: item.count,
              color:
                item.health_status === "green"
                  ? "#10B981"
                  : item.health_status === "yellow"
                    ? "#F59E0B"
                    : "#EF4444",
            }))}
          />
        </Card>
      </div>

      <Card glass className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Milestone Completion
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white font-bold">
              {data.milestoneCompletionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-[#10B981] rounded-full"
              style={{ width: `${data.milestoneCompletionRate}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function BillingView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Link
          to="/app/billing"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">MRR</p>
            </div>
            <p className="text-3xl font-bold text-white">
              ${data.totalMRR.toLocaleString()}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/billing?tab=subscriptions"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-indigo-500/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-400 text-sm">Active Subscriptions</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.activeSubscriptions}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/billing?status=paid"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Paid Invoices</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.invoicesPaid}</p>
          </Card>
        </Link>

        <Link
          to="/app/billing?status=outstanding"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#F59E0B]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-slate-400 text-sm">Outstanding</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.invoicesOutstanding}
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Mix</h3>
          <DonutChart
            data={[
              {
                label: "Platform Revenue",
                value: Math.round(data.platformRevenue),
                color: "#3B82F6",
              },
              {
                label: "Project Revenue",
                value: Math.round(data.projectRevenue),
                color: "#10B981",
              },
            ]}
            centerText={`$${((data.platformRevenue + data.projectRevenue) / 1000).toFixed(0)}K`}
            centerSubtext="Total"
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Subscriptions by Plan
          </h3>
          <SimpleBarChart
            data={data.subscriptionsByPlan.map((item: any) => ({
              label: item.plan,
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Subscription Status
          </h3>
          <DonutChart
            data={data.subscriptionsByStatus.map((item: any) => ({
              label: item.status,
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Key Metrics</h3>
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-white">
                ${data.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Avg. Project Value</p>
              <p className="text-3xl font-bold text-indigo-500">
                ${data.averageProjectValue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SupportView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Link
          to="/app/support?status=open"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#EF4444]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              <p className="text-slate-400 text-sm">Open Tickets</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.openTickets}</p>
          </Card>
        </Link>

        <Link
          to="/app/support?status=resolved"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Resolved</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.resolvedTickets}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/support"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#F59E0B]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-slate-400 text-sm">Avg. Resolution</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.averageResolutionTime.toFixed(0)}h
            </p>
          </Card>
        </Link>

        <Link
          to="/app/support"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-indigo-500/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-400 text-sm">This Week</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.ticketsThisWeek}
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Tickets by Priority
          </h3>
          <DonutChart
            data={data.ticketsByPriority.map((item: any) => ({
              label: item.priority,
              value: item.count,
              color:
                item.priority === "urgent"
                  ? "#EF4444"
                  : item.priority === "high"
                    ? "#F59E0B"
                    : item.priority === "medium"
                      ? "#3B82F6"
                      : "#10B981",
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Tickets by Category
          </h3>
          <SimpleBarChart
            data={data.ticketsByCategory.map((item: any) => ({
              label: item.category.replace("_", " "),
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Tickets by Status
          </h3>
          <SimpleBarChart
            data={data.ticketsByStatus.map((item: any) => ({
              label: item.status.replace("_", " "),
              value: item.count,
            }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">This Week</p>
              <p className="text-2xl font-bold text-white">
                {data.ticketsThisWeek} tickets
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold text-white">
                {data.ticketsThisMonth} tickets
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClientsView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Link
          to="/app/clients"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-indigo-500/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <p className="text-slate-400 text-sm">Total Clients</p>
            </div>
            <p className="text-3xl font-bold text-white">{data.totalClients}</p>
          </Card>
        </Link>

        <Link
          to="/app/clients?status=active"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#10B981]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <p className="text-slate-400 text-sm">Active</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.activeClients}
            </p>
          </Card>
        </Link>

        <Link
          to="/app/client-success"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#EC4899]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="w-5 h-5 text-[#EC4899]" />
              <p className="text-slate-400 text-sm">Retention Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.retentionRate.toFixed(1)}%
            </p>
          </Card>
        </Link>

        <Link
          to="/app/clients"
          className="block transition-transform hover:-translate-y-1"
        >
          <Card
            glass
            className="p-6 hover:border-[#F59E0B]/50 transition-colors h-full"
          >
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-slate-400 text-sm">Avg. Client Value</p>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(data.averageClientValue / 1000).toFixed(0)}K
            </p>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Client Type Distribution
          </h3>
          <DonutChart
            data={data.clientsByType.map((item: any) => ({
              label: item.type,
              value: item.count,
            }))}
            centerText={data.totalClients.toString()}
            centerSubtext="Clients"
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Clients by Industry
          </h3>
          <SimpleBarChart
            data={data.clientsByIndustry
              .sort((a: any, b: any) => b.count - a.count)
              .slice(0, 8)
              .map((item: any) => ({
                label: item.industry,
                value: item.count,
              }))}
          />
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Onboarding Status
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Completed</span>
                <span className="text-white font-bold">
                  {data.onboardingCompleted}
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="h-full bg-[#10B981] rounded-full"
                  style={{
                    width: `${(data.onboardingCompleted / data.totalClients) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">In Progress</span>
                <span className="text-white font-bold">
                  {data.onboardingInProgress}
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${(data.onboardingInProgress / data.totalClients) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card glass className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Client Segments</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="text-slate-300">Enterprise</span>
              </div>
              <span className="text-xl font-bold text-white">
                {data.enterpriseClients}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="text-slate-300">Active</span>
              </div>
              <span className="text-xl font-bold text-white">
                {data.activeClients}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
