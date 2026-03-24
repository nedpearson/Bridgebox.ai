import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Mail, Phone, Globe, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { organizationsService } from '../../lib/db/organizations';
import { projectsService } from '../../lib/db/projects';

import { useState, useEffect } from 'react';

export default function ClientDetail() {

  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [clientData, activeProjects] = await Promise.all([
        organizationsService.getOrganizationById(id),
        projectsService.getProjectsByOrganization(id),
      ]);
      setClient(clientData);
      setProjects(activeProjects || []);
      
      // We can fetch tickets or audit logs for recent activity if needed. For now it's empty realistically.
      setRecentActivity([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load client details');
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

  if (error || !client) {
    return <ErrorState message={error || 'Client not found'} />;
  }

  return (
    <>
      <AppHeader title={client.name} />

      <div className="p-8 space-y-6">
        <Link
          to="/app/clients"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{client.name}</h2>
                <StatusBadge status={client.status} variant="success" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{client.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{client.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{client.website}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm">Onboarded {client.onboarded}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div>
                <p className="text-2xl font-bold text-[#10B981]">{client.health_score}</p>
                <p className="text-slate-500 text-xs">Health Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">${client.mrr.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">MRR</p>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card glass className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Active Projects</h3>
                <button className="text-[#3B82F6] text-sm font-medium hover:text-[#3B82F6]/80 transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{project.name}</h4>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={project.type || 'project'} variant="info" />
                          <StatusBadge status={project.status || 'active'} variant="info" />
                        </div>
                      </div>
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
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No Recent Activity"
                  description="No recorded activity for this client yet."
                />
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
                    >
                      <p className="text-slate-300">{activity.event}</p>
                      <p className="text-slate-500 text-sm">{activity.date}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
