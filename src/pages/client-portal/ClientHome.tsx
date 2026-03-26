import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Package, Headphones, Calendar, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import AiUsageWidget from '../../components/billing/AiUsageWidget';
import { useAuth } from '../../contexts/AuthContext';
import { projectsService } from '../../lib/db/projects';
import { organizationsService } from '../../lib/db/organizations';
import { supportService } from '../../lib/db/support';

export default function ClientHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [organization, setOrganization] = useState<any>(null);
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [recentDeliverables, setRecentDeliverables] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    openTickets: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const myOrgs = await organizationsService.getMyOrganizations();
      const primaryOrg = myOrgs?.[0];

      if (primaryOrg) {
        setOrganization(primaryOrg);

        const projects = await projectsService.getProjectsByOrganization(primaryOrg.id);
        setActiveProjects(projects?.filter((p: any) =>
          ['planning', 'in_progress', 'testing'].includes(p.status)
        ).slice(0, 3) || []);

        setStats({
          totalProjects: projects?.length || 0,
          activeProjects: projects?.filter((p: any) =>
            ['planning', 'in_progress', 'testing'].includes(p.status)
          ).length || 0,
          completedProjects: projects?.filter((p: any) =>
            ['completed', 'deployed'].includes(p.status)
          ).length || 0,
          openTickets: 0,
        });

        const tickets = await supportService.getAllTickets({ organization_id: primaryOrg.id });
        setRecentTickets(tickets?.filter((t: any) => t.status !== 'closed').slice(0, 3) || []);
        setStats(prev => ({ ...prev, openTickets: tickets?.filter((t: any) => t.status !== 'closed').length || 0 }));

        const allDeliverables: any[] = [];
        for (const project of projects || []) {
          const dlvs = await projectsService.getProjectDeliverables(project.id);
          allDeliverables.push(...(dlvs || []));
        }
        setRecentDeliverables(allDeliverables.slice(0, 3));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back{organization?.name ? `, ${organization.name}` : ''}</h1>
          <p className="text-slate-400">Here's what's happening with your projects</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Link to="/portal/projects">
            <Card glass className="p-6 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <FolderKanban className="w-8 h-8 text-indigo-500" />
                <span className="text-3xl font-bold text-white">{activeProjects.length}</span>
              </div>
              <p className="text-slate-400 text-sm">Active Projects</p>
            </Card>
          </Link>

          <Link to="/portal/projects">
            <Card glass className="p-6 hover:border-[#10B981]/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                <span className="text-3xl font-bold text-white">{stats.completedProjects}</span>
              </div>
              <p className="text-slate-400 text-sm">Completed Projects</p>
            </Card>
          </Link>

          <Link to="/portal/support?status=open">
            <Card glass className="p-6 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <Headphones className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold text-white">{stats.openTickets}</span>
              </div>
              <p className="text-slate-400 text-sm">Open Tickets</p>
            </Card>
          </Link>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FolderKanban className="w-8 h-8 text-indigo-500" />
              <span className="text-3xl font-bold text-white">{stats.totalProjects}</span>
            </div>
            <p className="text-slate-400 text-sm">Total Projects</p>
          </Card>
        </div>

        {/* AI Usage Widget */}
        {organization?.id && (
          <div className="mb-8">
            <AiUsageWidget organizationId={organization.id} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Active Projects</h2>
              <Link
                to="/portal/projects"
                className="text-indigo-500 text-sm font-medium hover:text-indigo-500/80 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to="/portal/projects">
                    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                          <p className="text-slate-400 text-sm mb-2">{project.description}</p>
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={project.type} variant="info" />
                            <StatusBadge status={project.status} variant="info" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-sm">Progress</span>
                          <span className="text-white text-sm font-medium">
                            {project.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-[#10B981] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress_percentage}%` }}
                          />
                        </div>
                        {project.target_launch_date && (
                          <div className="flex items-center space-x-2 mt-3 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Target: {project.target_launch_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Deliverables</h2>
              <Link
                to="/portal/deliverables"
                className="text-indigo-500 text-sm font-medium hover:text-indigo-500/80 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentDeliverables.length === 0 ? (
                <div className="text-slate-400 text-sm p-4 text-center">No recent deliverables</div>
              ) : recentDeliverables.map((deliverable, index) => (
                <motion.div
                  key={deliverable.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {deliverable.status === 'approved' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : deliverable.status === 'review' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Package className="w-4 h-4 text-indigo-500" />
                        )}
                        <h3 className="text-white font-medium">{deliverable.name}</h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={deliverable.type} variant="info" />
                        <StatusBadge
                          status={deliverable.status}
                          variant={
                            deliverable.status === 'approved'
                              ? 'success'
                              : deliverable.status === 'review'
                              ? 'warning'
                              : 'info'
                          }
                        />
                      </div>
                      <p className="text-slate-500 text-xs mt-2">{deliverable.deliveredDate}</p>
                    </div>
                    <button className="text-indigo-500 hover:text-indigo-500/80 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Support</h2>
              <Link
                to="/portal/support"
                className="text-indigo-500 text-sm font-medium hover:text-indigo-500/80 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <div className="text-slate-400 text-sm p-4 text-center">No recent tickets</div>
              ) : recentTickets.map((ticket, index) => (
                <Link to={`/portal/support/${ticket.id}`} key={ticket.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium flex-1 group-hover:text-indigo-500 transition-colors">{ticket.title}</h3>
                      <StatusBadge
                        status={ticket.status || 'open'}
                        variant={ticket.status === 'in_progress' ? 'warning' : 'info'}
                      />
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <StatusBadge status={ticket.priority || 'medium'} variant="default" />
                      <span className="text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>

          <Card glass className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Team</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">TM</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Account Manager</p>
                  <p className="text-white font-semibold">Support Team</p>
                  <p className="text-slate-400 text-sm">support@bridgebox.ai</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">TL</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Technical Lead</p>
                  <p className="text-white font-semibold">Technical Support</p>
                  <p className="text-slate-400 text-sm">tech@bridgebox.ai</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
