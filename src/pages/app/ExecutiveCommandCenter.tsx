import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Building2,
  Target,
  Package,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Zap,
  Heart,
  CreditCard,
  Activity,
  MessageSquare,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Brain,
  Radar,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import DonutChart from '../../components/analytics/DonutChart';
import { ForecastCard, ForecastSummary } from '../../components/predictions/ForecastCard';
import { RiskIndicator, CompactRiskIndicator } from '../../components/predictions/RiskIndicator';
import { ConversionBadge } from '../../components/predictions/PredictionBadge';
import { InsightList, InsightSummary } from '../../components/ai/InsightCard';
import { EmergingTrendCard } from '../../components/market/EmergingTrendCard';
import { OpportunityScoreCard } from '../../components/opportunities/OpportunityScoreCard';
import { DataQualityBadge, UncertaintyNotice } from '../../components/intelligence/ConfidenceBadge';
import { executiveService } from '../../lib/db/executive';
import { predictiveAnalytics } from '../../lib/predictiveAnalytics';
import { aiDecisionEngine, type AIInsight } from '../../lib/aiDecisionEngine';
import { marketSignalService } from '../../lib/market';
import { opportunityAnalyzer } from '../../lib/opportunities';
import { intelligenceOrchestrator } from '../../lib/intelligenceOrchestrator';
import { useAuth } from '../../contexts/AuthContext';
import type { EmergingTrend } from '../../lib/market/types';
import type { ScoredOpportunity } from '../../lib/opportunities/types';
import type {
  ExecutiveKPIs,
  SalesSnapshot,
  DeliverySnapshot,
  ClientHealthSnapshot,
  BillingSnapshot,
  OperationalAlert,
  RecentActivity,
} from '../../lib/db/executive';

export default function ExecutiveCommandCenter() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [sales, setSales] = useState<SalesSnapshot | null>(null);
  const [delivery, setDelivery] = useState<DeliverySnapshot | null>(null);
  const [clientHealth, setClientHealth] = useState<ClientHealthSnapshot | null>(null);
  const [billing, setBilling] = useState<BillingSnapshot | null>(null);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [marketTrends, setMarketTrends] = useState<EmergingTrend[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<ScoredOpportunity[]>([]);

  useEffect(() => {
    loadExecutiveData();
  }, [currentOrganization]);

  const loadExecutiveData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashboardData, predictionsData, insights, trendsData, oppsData] = await Promise.all([
        executiveService.getExecutiveDashboard(),
        predictiveAnalytics.generateExecutivePredictions(currentOrganization?.id),
        aiDecisionEngine.getDashboardInsights(8),
        marketSignalService.getTopEmergingSignals(currentOrganization?.id || '', 3),
        opportunityAnalyzer.getRankedOpportunities(currentOrganization?.id || '', { limit: 3, min_score: 70 }),
      ]);

      setKpis(dashboardData.kpis);
      setSales(dashboardData.sales);
      setDelivery(dashboardData.delivery);
      setClientHealth(dashboardData.clientHealth);
      setBilling(dashboardData.billing);
      setAlerts(dashboardData.alerts);
      setActivity(dashboardData.activity);
      setPredictions(predictionsData);
      setAiInsights(insights);
      setMarketTrends(trendsData.trends);
      setTopOpportunities(oppsData.opportunities || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive dashboard');
    } finally {
      setLoading(false);
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
    <>
      <AppHeader
        title="Executive Command Center"
        subtitle="Strategic visibility across sales, delivery, client health, and financial performance"
      />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <UncertaintyNotice
          type="insight"
          message="AI insights are generated from your business data. Recommendations should be reviewed by your team and validated against your business context before taking action."
        />

        {aiInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Strategic Insights</h2>
                  <p className="text-sm text-slate-400">Top priorities and recommendations</p>
                </div>
              </div>
              <Link
                to="/app/copilot"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All in Copilot
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <InsightSummary insights={aiInsights} />

            <div className="grid md:grid-cols-2 gap-6">
              <InsightList insights={aiInsights.slice(0, 4)} compact={true} />
            </div>
          </motion.div>
        )}

        {/* Executive KPI Row */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          <KPICard
            icon={DollarSign}
            label="MRR"
            value={`$${kpis!.mrr.toLocaleString()}`}
            color="#10B981"
            link="/app/billing"
          />
          <KPICard
            icon={Building2}
            label="Active Clients"
            value={kpis!.activeClients.toString()}
            color="#3B82F6"
            link="/app/clients"
          />
          <KPICard
            icon={Target}
            label="Open Opportunities"
            value={kpis!.openOpportunities.toString()}
            color="#F59E0B"
            link="/app/pipeline"
          />
          <KPICard
            icon={Package}
            label="Active Projects"
            value={kpis!.activeProjects.toString()}
            color="#8B5CF6"
            link="/app/projects"
          />
          <KPICard
            icon={AlertCircle}
            label="Support Health"
            value={kpis!.supportHealth.open.toString()}
            subtext={`${kpis!.supportHealth.urgent} urgent`}
            color={kpis!.supportHealth.urgent > 0 ? '#EF4444' : '#10B981'}
            link="/app/support"
          />
          <KPICard
            icon={CheckCircle2}
            label="Onboarding"
            value={`${kpis!.onboardingCompletion.toFixed(0)}%`}
            color="#10B981"
            link="/app/clients"
          />
        </div>

        {/* Predictive Insights */}
        {predictions && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Predictive Insights</h2>
                <p className="text-sm text-slate-400">Forward-looking analytics and forecasts</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <ForecastSummary forecasts={predictions.revenueForecast} />

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">High-Value Opportunities</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {predictions.summary.totalHighValueLeads}
                </div>
                <div className="text-sm text-slate-400 mb-4">
                  ${(predictions.summary.potentialRevenue / 1000).toFixed(0)}K potential value
                </div>
                {predictions.highValueLeads.slice(0, 3).map((lead: any) => (
                  <div key={lead.leadId} className="mb-3 pb-3 border-b border-slate-700 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <ConversionBadge likelihood={lead.conversionLikelihood} />
                      <span className="text-sm font-medium text-white">
                        ${(lead.estimatedDealValue / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{lead.daysToClose} days to close</p>
                  </div>
                ))}
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">Risk Summary</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">Projects at Risk</span>
                      <span className="text-lg font-bold text-orange-400">
                        {predictions.summary.projectsAtRisk}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">Clients at Risk</span>
                      <span className="text-lg font-bold text-red-400">
                        {predictions.summary.clientsAtRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {predictions.criticalProjects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Critical Project Risks</h3>
                <div className="grid lg:grid-cols-2 gap-4">
                  {predictions.criticalProjects.slice(0, 4).map((project: any) => (
                    <RiskIndicator
                      key={project.projectId}
                      level={project.riskLevel}
                      title={`Project at ${project.riskLevel} risk`}
                      description={`${project.delayProbability}% probability of delay`}
                      factors={project.riskFactors.slice(0, 3)}
                      actions={project.recommendations.slice(0, 2)}
                    />
                  ))}
                </div>
              </div>
            )}

            {predictions.atRiskClients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">At-Risk Clients</h3>
                <div className="grid lg:grid-cols-2 gap-4">
                  {predictions.atRiskClients.slice(0, 4).map((client: any) => (
                    <RiskIndicator
                      key={client.clientId}
                      level={client.churnRisk}
                      title="Client Churn Risk"
                      description={`${client.churnProbability}% churn probability`}
                      factors={client.riskFactors.slice(0, 3)}
                      actions={client.retentionActions.slice(0, 2)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sales Snapshot */}
          <Card glass className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="text-lg font-bold text-white">Sales Snapshot</h3>
              </div>
              <Link
                to="/app/pipeline"
                className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                View Details →
              </Link>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Pipeline Value</p>
                <p className="text-3xl font-bold text-white">
                  ${(sales!.pipelineValue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Pending Proposals</p>
                  <p className="text-xl font-bold text-white">{sales!.proposalsPending}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Win Rate</p>
                  <p className="text-xl font-bold text-[#10B981]">
                    {sales!.winRate.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-3">Top Service Types</p>
                <div className="space-y-2">
                  {sales!.topServiceTypes.slice(0, 3).map((type, index) => (
                    <div key={type.service_type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">
                        {type.service_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-medium text-white">{type.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Snapshot */}
          <Card glass className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="text-lg font-bold text-white">Delivery Snapshot</h3>
              </div>
              <Link
                to="/app/delivery"
                className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
              >
                View Details →
              </Link>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">At Risk</p>
                  <p className="text-xl font-bold text-[#EF4444]">
                    {delivery!.projectsAtRisk}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Upcoming Milestones</p>
                  <p className="text-xl font-bold text-white">
                    {delivery!.upcomingMilestones.length}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-3">Delivery Workload</p>
                <div className="space-y-2">
                  <WorkloadBar
                    label="Discovery"
                    value={delivery!.deliveryWorkload.discovery}
                    color="#3B82F6"
                  />
                  <WorkloadBar
                    label="Development"
                    value={delivery!.deliveryWorkload.development}
                    color="#10B981"
                  />
                  <WorkloadBar
                    label="Testing"
                    value={delivery!.deliveryWorkload.testing}
                    color="#F59E0B"
                  />
                  <WorkloadBar
                    label="Deployment"
                    value={delivery!.deliveryWorkload.deployment}
                    color="#8B5CF6"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Client Health Snapshot */}
          <Card glass className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-[#EC4899]" />
                <h3 className="text-lg font-bold text-white">Client Health</h3>
              </div>
              <Link
                to="/app/clients"
                className="text-sm text-[#EC4899] hover:text-[#DB2777] transition-colors"
              >
                View Details →
              </Link>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Active Accounts</p>
                  <p className="text-xl font-bold text-white">
                    {clientHealth!.activeAccounts}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Retention</p>
                  <p className="text-xl font-bold text-[#10B981]">
                    {clientHealth!.retentionRate.toFixed(0)}%
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">Incomplete Onboarding</span>
                  <span className="text-white font-bold">
                    {clientHealth!.onboardingIncomplete}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">Support Escalations</span>
                  <span className="text-[#EF4444] font-bold">
                    {clientHealth!.supportEscalations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Risk Accounts</span>
                  <span className="text-[#F59E0B] font-bold">
                    {clientHealth!.riskAccounts}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Billing Snapshot */}
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold text-white">Billing Snapshot</h3>
              </div>
              <Link
                to="/app/billing"
                className="text-sm text-[#10B981] hover:text-[#059669] transition-colors"
              >
                View Details →
              </Link>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-white">
                    ${(billing!.totalRevenue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Invoices Due</p>
                  <p className="text-xl font-bold text-[#F59E0B]">{billing!.invoicesDue}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Outstanding</p>
                  <p className="text-xl font-bold text-[#EF4444]">
                    {billing!.outstandingIssues}
                  </p>
                </div>
              </div>
              <div>
                <DonutChart
                  data={[
                    {
                      label: 'Platform Revenue',
                      value: Math.round(billing!.recurringRevenue),
                      color: '#3B82F6',
                    },
                    {
                      label: 'Custom Revenue',
                      value: Math.round(billing!.customRevenue),
                      color: '#10B981',
                    },
                  ]}
                  size={140}
                />
              </div>
            </div>
          </Card>

          {/* Operations & Alerts */}
          <Card glass className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="text-lg font-bold text-white">Operations & Alerts</h3>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-2 opacity-50" />
                  <p className="text-slate-400 text-sm">All systems operational</p>
                </div>
              ) : (
                alerts.slice(0, 8).map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.link}
                    className="block p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              alert.severity === 'critical'
                                ? 'bg-[#EF4444]'
                                : alert.severity === 'high'
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#3B82F6]'
                            }`}
                          />
                          <p className="text-sm font-medium text-white">{alert.title}</p>
                        </div>
                        <p className="text-xs text-slate-400">{alert.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Market Signals */}
        {marketTrends.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Radar className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-lg font-bold text-white">Emerging Market Signals</h3>
              </div>
              <Link
                to="/app/market-signals"
                className="text-sm text-[#10B981] hover:text-[#059669] transition-colors"
              >
                View All Signals →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {marketTrends.map((trend, index) => (
                <EmergingTrendCard key={index} trend={trend} />
              ))}
            </div>
          </div>
        )}

        {/* Top Opportunities */}
        {topOpportunities.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="text-lg font-bold text-white">Top Growth Opportunities</h3>
              </div>
              <Link
                to="/app/opportunities"
                className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors"
              >
                View All Opportunities →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {topOpportunities.map((opp) => (
                <OpportunityScoreCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card glass className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activity.slice(0, 9).map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ActivityIcon icon={item.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  link,
}: {
  icon: any;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  link: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={link}>
        <Card glass className="p-6 hover:border-slate-600 transition-all group">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </Card>
      </Link>
    </motion.div>
  );
}

function WorkloadBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-medium text-white">{value}</span>
      </div>
      <div className="w-full bg-slate-800/50 rounded-full h-1.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((value / 10) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ActivityIcon({ icon }: { icon: string }) {
  const iconMap: Record<string, any> = {
    Users,
    CheckCircle2,
    Package,
    MessageSquare,
    DollarSign,
  };

  const IconComponent = iconMap[icon] || Activity;
  return <IconComponent className="w-4 h-4 text-[#3B82F6]" />;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
