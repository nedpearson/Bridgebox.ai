import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import KPICard from '../components/admin/KPICard';
import StatusBadge from '../components/admin/StatusBadge';
import Card from '../components/Card';

export default function AdminPreview() {
  const [activeSection, setActiveSection] = useState('Overview');

  const kpis = [
    {
      title: 'Active Clients',
      value: 47,
      icon: Briefcase,
      trend: { value: 12, direction: 'up' as const },
    },
    {
      title: 'Open Leads',
      value: 23,
      icon: Users,
      trend: { value: 8, direction: 'up' as const },
    },
    {
      title: 'Builds In Progress',
      value: 12,
      icon: FolderKanban,
      trend: { value: 3, direction: 'up' as const },
    },
    {
      title: 'Monthly Recurring Revenue',
      value: 187500,
      icon: DollarSign,
      prefix: '$',
      trend: { value: 18, direction: 'up' as const },
    },
    {
      title: 'Custom Projects Pipeline',
      value: 2400000,
      icon: TrendingUp,
      prefix: '$',
      trend: { value: 24, direction: 'up' as const },
    },
    {
      title: 'Support Health',
      value: '98.5%',
      icon: Activity,
      trend: { value: 2, direction: 'up' as const },
    },
  ];

  const leadPipeline = [
    { stage: 'New Inquiry', count: 8, color: 'bg-slate-500' },
    { stage: 'Qualified', count: 5, color: 'bg-indigo-500' },
    { stage: 'Proposal Sent', count: 6, color: 'bg-yellow-500' },
    { stage: 'In Build', count: 3, color: 'bg-orange-500' },
    { stage: 'Closed Won', count: 1, color: 'bg-[#10B981]' },
  ];

  const activeProjects = [
    {
      name: 'Enterprise Dashboard Platform',
      client: 'TechCorp Industries',
      type: 'dashboard',
      status: 'In Progress',
      progress: 65,
      variant: 'info' as const,
    },
    {
      name: 'Mobile Inventory App',
      client: 'Logistics Plus',
      type: 'mobile app',
      status: 'In Progress',
      progress: 40,
      variant: 'info' as const,
    },
    {
      name: 'CRM Integration Suite',
      client: 'Global Sales Co',
      type: 'integration',
      status: 'Testing',
      progress: 85,
      variant: 'warning' as const,
    },
    {
      name: 'Custom ERP System',
      client: 'Manufacturing Ltd',
      type: 'custom software',
      status: 'Planning',
      progress: 15,
      variant: 'default' as const,
    },
  ];

  const recentActivity = [
    { event: 'Demo requested', client: 'Acme Corp', time: '5 minutes ago', icon: Users },
    { event: 'Proposal created', client: 'Tech Startup Inc', time: '1 hour ago', icon: FolderKanban },
    { event: 'Client onboarded', client: 'Enterprise Solutions', time: '3 hours ago', icon: CheckCircle2 },
    { event: 'Integration synced', client: 'Data Systems Co', time: '5 hours ago', icon: Activity },
  ];

  const revenueSnapshot = [
    { label: 'MRR', value: '$187,500', change: '+18%' },
    { label: 'Project Revenue', value: '$425,000', change: '+32%' },
    { label: 'Upcoming Invoices', value: '$156,000', change: '' },
  ];

  const teamWorkload = [
    { name: 'Alex Martinez', role: 'Lead Developer', assignments: 3, capacity: 85 },
    { name: 'Sarah Chen', role: 'UI/UX Designer', assignments: 4, capacity: 92 },
    { name: 'Michael Roberts', role: 'Backend Engineer', assignments: 2, capacity: 65 },
    { name: 'Emily Watson', role: 'Project Manager', assignments: 6, capacity: 78 },
  ];

  const systemHealth = [
    { system: 'API Gateway', status: 'Online', uptime: '99.98%', variant: 'success' as const },
    { system: 'Database Cluster', status: 'Online', uptime: '99.95%', variant: 'success' as const },
    { system: 'Support Queue', status: '3 Active', uptime: '< 2h avg', variant: 'info' as const },
    { system: 'Deployment Pipeline', status: 'Running', uptime: '12 builds', variant: 'info' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="ml-64">
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-white">Bridgebox Command Center</h1>
            <p className="text-slate-400 text-sm mt-1">
              A unified control layer for clients, builds, integrations, dashboards, and operational intelligence.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Lead Pipeline</h2>
                <button className="text-indigo-500 text-sm font-medium hover:text-indigo-500/80 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {leadPipeline.map((stage, index) => (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="text-slate-300">{stage.stage}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-white font-bold text-lg">{stage.count}</span>
                      <div className="w-32 bg-slate-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${stage.color}`}
                          style={{ width: `${(stage.count / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Revenue Snapshot</h2>
                <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="space-y-6">
                {revenueSnapshot.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">{item.label}</span>
                      {item.change && (
                        <span className="text-[#10B981] text-sm font-medium">{item.change}</span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Active Projects</h2>
              <button className="text-indigo-500 text-sm font-medium hover:text-indigo-500/80 transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                      <p className="text-slate-400 text-sm">{project.client}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={project.type} variant="info" />
                      <StatusBadge status={project.status} variant={project.variant} />
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
                        className="bg-gradient-to-r from-indigo-500 to-[#10B981] h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                        <Icon className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.event}</p>
                        <p className="text-slate-400 text-sm">{activity.client}</p>
                        <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Team Workload</h2>
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div className="space-y-4">
                {teamWorkload.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-slate-400 text-sm">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">{member.assignments} active</p>
                        <p className="text-slate-400 text-xs">{member.capacity}% capacity</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.capacity}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-1.5 rounded-full ${
                          member.capacity > 85
                            ? 'bg-red-500'
                            : member.capacity > 70
                            ? 'bg-yellow-500'
                            : 'bg-[#10B981]'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">System Health</h2>
              <Activity className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemHealth.map((system, index) => (
                <motion.div
                  key={system.system}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-medium text-sm">{system.system}</h3>
                    <StatusBadge status={system.status} variant={system.variant} />
                  </div>
                  <p className="text-slate-400 text-xs">{system.uptime}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
