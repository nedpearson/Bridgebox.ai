import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, Users, CheckCircle2, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { projectsService } from '../../lib/db/projects';
import { useAuth } from '../../contexts/AuthContext';
import { organizationsService } from '../../lib/db/organizations';

export default function ClientProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const myOrgs = await organizationsService.getMyOrganizations();
      const primaryOrg = myOrgs?.[0];

      if (primaryOrg) {
        const data = await projectsService.getProjectsByOrganization(primaryOrg.id);
        setProjects(data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'deployed':
      case 'completed':
        return 'success';
      case 'testing':
        return 'warning';
      case 'in_progress':
        return 'info';
      default:
        return 'default';
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

  const mockProjects: any[] = [
    {
      id: '1',
      name: 'Enterprise Analytics Dashboard',
      description: 'Real-time analytics platform with custom reporting and data visualization',
      type: 'dashboard',
      status: 'in_progress',
      progress_percentage: 65,
      target_launch_date: 'May 15, 2024',
      staging_url: 'https://staging-analytics.example.com',
      client_id: '1',
      created_at: '2024-02-01',
      updated_at: '2024-03-20',
      milestones: [
        {
          id: '1',
          project_id: '1',
          name: 'Discovery & Planning',
          status: 'completed',
          completion_date: 'Feb 15, 2024',
          order: 1,
          created_at: '2024-02-01',
          updated_at: '2024-02-15',
        },
        {
          id: '2',
          project_id: '1',
          name: 'UI/UX Design',
          status: 'completed',
          completion_date: 'Mar 5, 2024',
          order: 2,
          created_at: '2024-02-01',
          updated_at: '2024-03-05',
        },
        {
          id: '3',
          project_id: '1',
          name: 'Core Development',
          status: 'in_progress',
          order: 3,
          created_at: '2024-02-01',
          updated_at: '2024-03-20',
        },
        {
          id: '4',
          project_id: '1',
          name: 'Testing & QA',
          status: 'pending',
          order: 4,
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
        },
        {
          id: '5',
          project_id: '1',
          name: 'Deployment',
          status: 'pending',
          order: 5,
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
        },
      ],
    },
    {
      id: '2',
      name: 'Mobile Field Service App',
      description: 'iOS and Android application for field technicians with offline capabilities',
      type: 'mobile_app',
      status: 'testing',
      progress_percentage: 85,
      target_launch_date: 'Apr 30, 2024',
      client_id: '1',
      created_at: '2024-01-15',
      updated_at: '2024-03-22',
      milestones: [
        {
          id: '6',
          project_id: '2',
          name: 'Requirements Gathering',
          status: 'completed',
          completion_date: 'Jan 25, 2024',
          order: 1,
          created_at: '2024-01-15',
          updated_at: '2024-01-25',
        },
        {
          id: '7',
          project_id: '2',
          name: 'Development Sprint 1',
          status: 'completed',
          completion_date: 'Feb 20, 2024',
          order: 2,
          created_at: '2024-01-15',
          updated_at: '2024-02-20',
        },
        {
          id: '8',
          project_id: '2',
          name: 'Development Sprint 2',
          status: 'completed',
          completion_date: 'Mar 15, 2024',
          order: 3,
          created_at: '2024-01-15',
          updated_at: '2024-03-15',
        },
        {
          id: '9',
          project_id: '2',
          name: 'Beta Testing',
          status: 'in_progress',
          order: 4,
          created_at: '2024-01-15',
          updated_at: '2024-03-22',
        },
        {
          id: '10',
          project_id: '2',
          name: 'App Store Launch',
          status: 'pending',
          order: 5,
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
        },
      ],
    },
    {
      id: '3',
      name: 'CRM Integration',
      description: 'Salesforce integration with custom middleware and real-time sync',
      type: 'integration',
      status: 'deployed',
      progress_percentage: 100,
      actual_launch_date: 'Mar 1, 2024',
      production_url: 'https://crm-sync.example.com',
      client_id: '1',
      created_at: '2024-01-01',
      updated_at: '2024-03-01',
      milestones: [
        {
          id: '11',
          project_id: '3',
          name: 'Integration Setup',
          status: 'completed',
          completion_date: 'Jan 15, 2024',
          order: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-15',
        },
        {
          id: '12',
          project_id: '3',
          name: 'Data Migration',
          status: 'completed',
          completion_date: 'Feb 5, 2024',
          order: 2,
          created_at: '2024-01-01',
          updated_at: '2024-02-05',
        },
        {
          id: '13',
          project_id: '3',
          name: 'Go Live',
          status: 'completed',
          completion_date: 'Mar 1, 2024',
          order: 3,
          created_at: '2024-01-01',
          updated_at: '2024-03-01',
        },
      ],
    },
  ];

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-[#10B981]" />;
      case 'in_progress':
        return <div className="w-5 h-5 rounded-full bg-[#3B82F6] animate-pulse" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-slate-400">Track progress and milestones for your active projects</p>
        </div>

        <div className="space-y-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                      <StatusBadge status={project.status} variant="info" />
                    </div>
                    <p className="text-slate-400 mb-4">{project.description}</p>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={project.type} variant="info" />
                      {project.target_launch_date && (
                        <div className="flex items-center space-x-2 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Target: {project.target_launch_date}</span>
                        </div>
                      )}
                      {project.actual_launch_date && (
                        <div className="flex items-center space-x-2 text-[#10B981] text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Launched: {project.actual_launch_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white mb-1">{project.progress_percentage}%</p>
                    <p className="text-slate-500 text-sm">Complete</p>
                  </div>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-3 mb-6">
                  <div
                    className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>

                {project.milestones && project.milestones.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Project Milestones</span>
                    </h3>
                    <div className="relative">
                      <div className="absolute left-[10px] top-0 bottom-0 w-0.5 bg-slate-700" />
                      <div className="space-y-4">
                        {project.milestones.map((milestone, idx) => (
                          <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-start space-x-4 relative"
                          >
                            <div className="relative z-10 flex-shrink-0">
                              {getMilestoneIcon(milestone.status)}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-white font-medium">{milestone.name}</h4>
                                <StatusBadge
                                  status={milestone.status}
                                  variant={
                                    milestone.status === 'completed'
                                      ? 'success'
                                      : milestone.status === 'in_progress'
                                      ? 'warning'
                                      : 'default'
                                  }
                                />
                              </div>
                              {milestone.description && (
                                <p className="text-slate-400 text-sm mb-1">{milestone.description}</p>
                              )}
                              {milestone.completion_date && (
                                <p className="text-slate-500 text-xs">
                                  Completed: {milestone.completion_date}
                                </p>
                              )}
                              {milestone.target_date && !milestone.completion_date && (
                                <p className="text-slate-500 text-xs">Target: {milestone.target_date}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                  {project.staging_url && (
                    <a
                      href={project.staging_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <span>View Staging</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.production_url && (
                    <a
                      href={project.production_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <span>View Live Site</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
