import { motion } from 'framer-motion';
import { TrendingUp, Users, FolderKanban, DollarSign, Clock, CheckCircle2, Target, FileText, PieChart, ArrowRight } from 'lucide-react';
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
import { useBranding } from '../../hooks/useBranding';

export default function AppOverview() {
  const { currentOrganization } = useAuth();
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const branding = useBranding();

  useEffect(() => {
    checkOnboardingStatus();
  }, [currentOrganization]);

  const checkOnboardingStatus = async () => {
    if (!currentOrganization?.id) return;

    try {
      const onboarding = await onboardingService.getOnboardingByOrganization(
        currentOrganization.id
      );
      setShowOnboardingBanner(!onboarding || onboarding.status !== 'completed');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
  };
  const kpis = [
    {
      title: 'Pipeline Value',
      value: 2305000,
      icon: Target,
      prefix: '$',
      trend: { value: 24, direction: 'up' as const },
    },
    {
      title: 'Active Clients',
      value: 47,
      icon: Users,
      trend: { value: 12, direction: 'up' as const },
    },
    {
      title: 'Active Projects',
      value: 34,
      icon: FolderKanban,
      trend: { value: 5, direction: 'up' as const },
    },
    {
      title: 'Closed Won This Month',
      value: 625000,
      icon: TrendingUp,
      prefix: '$',
      trend: { value: 32, direction: 'up' as const },
    },
  ];

  const salesKpis = [
    { label: 'Active Leads', value: 23, icon: Users, color: 'text-[#3B82F6]' },
    { label: 'Proposals Out', value: 8, icon: FileText, color: 'text-yellow-500' },
    { label: 'Avg Deal Size', value: 245000, icon: DollarSign, color: 'text-[#10B981]', prefix: '$' },
  ];

  const recentProjects = [
    {
      name: 'Enterprise Dashboard',
      client: 'TechCorp Industries',
      type: 'dashboard',
      status: 'In Progress',
      progress: 65,
    },
    {
      name: 'Mobile Inventory App',
      client: 'Logistics Plus',
      type: 'mobile_app',
      status: 'Testing',
      progress: 85,
    },
    {
      name: 'CRM Integration',
      client: 'Global Sales Co',
      type: 'integration',
      status: 'Deployed',
      progress: 100,
    },
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
            <KPICard key={index} {...kpi} />
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
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
              );
            })}
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Projects</h2>
              <button className="text-[#3B82F6] text-sm font-medium hover:text-[#3B82F6]/80 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                      <p className="text-slate-400 text-sm">{project.client}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={project.type} variant="info" />
                      <StatusBadge status={project.status} variant="info" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Progress</span>
                      <span className="text-white text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
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
              <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <Users className="w-8 h-8 text-[#3B82F6] mb-3" />
                <p className="text-white font-medium">Add Client</p>
                <p className="text-slate-400 text-xs mt-1">Onboard new client</p>
              </button>
              <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <FolderKanban className="w-8 h-8 text-[#10B981] mb-3" />
                <p className="text-white font-medium">New Project</p>
                <p className="text-slate-400 text-xs mt-1">Start a new project</p>
              </button>
              <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <Clock className="w-8 h-8 text-yellow-500 mb-3" />
                <p className="text-white font-medium">Time Entry</p>
                <p className="text-slate-400 text-xs mt-1">Log project hours</p>
              </button>
              <button className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 text-left transition-all duration-200 hover:border-[#3B82F6]/50">
                <CheckCircle2 className="w-8 h-8 text-purple-500 mb-3" />
                <p className="text-white font-medium">Tasks</p>
                <p className="text-slate-400 text-xs mt-1">View pending tasks</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
