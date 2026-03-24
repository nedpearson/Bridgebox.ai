import { motion } from 'framer-motion';
import { TrendingUp, Users, FolderKanban, DollarSign, Clock, CheckCircle2, Target, FileText, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import KPICard from '../../components/admin/KPICard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import OnboardingBanner from '../../components/app/OnboardingBanner';
import EnterpriseDashboard from '../../components/enterprise/EnterpriseDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { onboardingService } from '../../lib/db/onboarding';
import { analyticsService } from '../../lib/db/analytics';
import { projectsService } from '../../lib/db/projects';
import { useBranding } from '../../hooks/useBranding';
import LoadingSpinner from '../../components/LoadingSpinner';
export default function AppOverview() {
  const { currentOrganization } = useAuth();
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const branding = useBranding();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentOrganization]);

  const loadDashboardData = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const [onboarding, allAnalytics, recentProj] = await Promise.all([
        onboardingService.getOnboardingByOrganization(currentOrganization.id),
        analyticsService.getAllAnalytics(currentOrganization.id),
        projectsService.getAllProjects({ organization_id: currentOrganization.id }), // we'll slice the first 5
      ]);

      setShowOnboardingBanner(!onboarding || onboarding.status !== 'completed');
      setAnalytics(allAnalytics);
      setRecentProjects((recentProj || []).filter(p => p.organization_id === currentOrganization.id || !currentOrganization).slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
  const kpis = [
    {
      title: 'Pipeline Value',
      value: analytics?.sales?.pipelineValue || 0,
      icon: Target,
      prefix: '$',
      trend: { value: 0, direction: 'up' as const },
      link: '/app/pipeline',
    },
    {
      title: 'Active Clients',
      value: analytics?.clientHealth?.activeClients || 0,
      icon: Users,
      trend: { value: 0, direction: 'up' as const },
      link: '/app/clients',
    },
    {
      title: 'Active Projects',
      value: analytics?.delivery?.activeProjects || 0,
      icon: FolderKanban,
      trend: { value: 0, direction: 'up' as const },
      link: '/app/projects',
    },
    {
      title: 'Monthly Revenue',
      value: analytics?.billing?.totalRevenue || 0,
      icon: TrendingUp,
      prefix: '$',
      trend: { value: 0, direction: 'up' as const },
      link: '/app/billing',
    },
  ];

  const salesKpis = [
    { label: 'New Leads', value: analytics?.sales?.leadsByStatus?.find((s: any) => s.status === 'new')?.count || 0, icon: Users, color: 'text-[#3B82F6]', link: '/app/leads?status=new' },
    { label: 'Proposals Out', value: analytics?.sales?.proposalsSent || 0, icon: FileText, color: 'text-yellow-500', link: '/app/proposals?status=sent' },
    { label: 'Pipeline Val', value: analytics?.sales?.pipelineValue || 0, icon: DollarSign, color: 'text-[#10B981]', prefix: '$', link: '/app/pipeline' },
  ];

  return (
    <>
      <AppHeader
        title="Overview"
        subtitle="Welcome back. Here's what's happening with your projects."
      />

      <div className="p-8 space-y-8">
        {showOnboardingBanner && (
          <OnboardingBanner onDismiss={() => setShowOnboardingBanner(false)} />
        )}

        <Card className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/20">
          <h2 className="text-2xl font-bold text-white mb-2">
            {branding.companyName || 'Enterprise Platform'}
          </h2>
          <p className="text-slate-300">
            Unified AI-powered operations platform with connectors, workflows, and intelligence
          </p>
        </Card>

        <EnterpriseDashboard />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Link to={kpi.link} key={index} className="block transition-transform hover:-translate-y-1">
              <KPICard {...kpi} />
            </Link>
          ))}
        </div>

        <Card glass className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Sales Metrics</h2>
            <Link to="/app/conversions">
              <Button variant="outline">
                View Conversions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salesKpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Link to={kpi.link} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-[#3B82F6]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">{kpi.label}</p>
                        <p className={`text-2xl font-bold ${kpi.color}`}>
                          {kpi.prefix}{typeof kpi.value === 'number' && kpi.prefix === '$' ? (kpi.value / 1000).toFixed(0) + 'K' : kpi.value}
                        </p>
                      </div>
                      <Icon className={`w-10 h-10 ${kpi.color} opacity-20`} />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Projects</h2>
              <Link to="/app/projects" className="text-[#3B82F6] text-sm font-medium hover:text-[#3B82F6]/80 transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="text-slate-400 text-sm p-4 text-center">No projects yet</div>
              ) : recentProjects.map((project: any, index: number) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link to={`/app/projects/${project.id}`}>
                        <h3 className="text-white font-semibold mb-1 group-hover:text-[#3B82F6] transition-colors">{project.name}</h3>
                      </Link>
                      <p className="text-slate-400 text-sm">{project.organization?.name || 'Client'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={project.service_type_category || 'project'} variant="info" />
                      <StatusBadge status={project.status || 'draft'} variant="info" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Progress</span>
                      <span className="text-white text-sm font-medium">{project.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress_percentage || 0}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] h-2 rounded-full"
                        />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/app/clients" className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <Users className="w-8 h-8 text-[#3B82F6] mb-3" />
                <p className="text-white font-medium">Clients</p>
                <p className="text-slate-400 text-xs mt-1">Manage network</p>
              </Link>
              <Link to="/app/projects" className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <FolderKanban className="w-8 h-8 text-[#10B981] mb-3" />
                <p className="text-white font-medium">Projects</p>
                <p className="text-slate-400 text-xs mt-1">Active deliveries</p>
              </Link>
              <Link to="/app/billing" className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <Clock className="w-8 h-8 text-yellow-500 mb-3" />
                <p className="text-white font-medium">Billing</p>
                <p className="text-slate-400 text-xs mt-1">Invoices & revenue</p>
              </Link>
              <Link to="/app/support" className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <CheckCircle2 className="w-8 h-8 text-purple-500 mb-3" />
                <p className="text-white font-medium">Support</p>
                <p className="text-slate-400 text-xs mt-1">Pending tickets</p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
