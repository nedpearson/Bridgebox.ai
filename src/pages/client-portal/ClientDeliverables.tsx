import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, CheckCircle2, Clock, Eye, Package } from 'lucide-react';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

import { projectsService } from '../../lib/db/projects';
import { organizationsService } from '../../lib/db/organizations';
import { storageService } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientDeliverables() {
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeliverables();
  }, [user]);

  const loadDeliverables = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const myOrgs = await organizationsService.getMyOrganizations();
      const primaryOrg = myOrgs?.[0];

      if (primaryOrg) {
        const projects = await projectsService.getProjectsByOrganization(primaryOrg.id);
        const allDeliverables: any[] = [];

        for (const project of projects || []) {
          const projectDeliverables = await projectsService.getProjectDeliverables(project.id);
          allDeliverables.push(...(projectDeliverables || []));
        }

        const deliverablesWithFiles = await Promise.all(
          allDeliverables.map(async (d) => {
            if (d.file_path) {
              try {
                const url = await storageService.getFileUrl('deliverables', d.file_path);
                return { ...d, url };
              } catch (err) {
                return d;
              }
            }
            return d;
          })
        );

        setDeliverables(deliverablesWithFiles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deliverables');
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



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />;
      case 'review':
        return <Eye className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'delivered':
        return 'info';
      case 'review':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Deliverables</h1>
          <p className="text-slate-400">Access completed work, documentation, and project assets</p>
        </div>

        {deliverables.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No deliverables yet"
            description="Completed work and project assets will appear here"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {deliverables.map((deliverable, index) => (
            <motion.div
              key={deliverable.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card glass className="p-6 hover:border-[#3B82F6]/30 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">{getStatusIcon(deliverable.status)}</div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{deliverable.name}</h3>
                          <p className="text-slate-400 text-sm mb-3">{deliverable.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={deliverable.deliverable_type} variant="info" />
                            <StatusBadge
                              status={deliverable.status}
                              variant={getStatusVariant(deliverable.status)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm">
                            {deliverable.delivered_date && (
                              <span className="text-slate-400">
                                Delivered: <span className="text-white">{deliverable.delivered_date}</span>
                              </span>
                            )}
                            {deliverable.approved_date && (
                              <span className="text-[#10B981]">
                                Approved: {deliverable.approved_date}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {(deliverable.url || deliverable.file_path) && (
                              <a
                                href={deliverable.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={deliverable.file_name}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                {deliverable.file_path ? (
                                  <>
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                  </>
                                ) : (
                                  <>
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View</span>
                                  </>
                                )}
                              </a>
                            )}
                            {deliverable.status === 'review' && (
                              <button className="flex items-center space-x-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium rounded-lg transition-colors">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {deliverable.notes && (
                          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <p className="text-slate-300 text-sm">{deliverable.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
