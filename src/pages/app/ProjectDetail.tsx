import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FolderKanban, Calendar, DollarSign, Users, ExternalLink, Rocket, Smartphone, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import IntegrationBadge from '../../components/connectors/IntegrationBadge';
import RelationalCommandCenter from '../../components/app/RelationalCommandCenter';
import RelationalMetricsCard from '../../components/app/RelationalMetricsCard';
import NextBestActionPanel from '../../components/app/NextBestActionPanel';
import BlockersPanel from '../../components/app/BlockersPanel';
import TimelineActivity from '../../components/app/TimelineActivity';
import GenerativeDraftingStudio from '../../components/documents/GenerativeDraftingStudio';
import { projectsService } from '../../lib/db/projects';
import { useState, useEffect } from 'react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!project || project.status === newStatus) return;
    try {
      await projectsService.updateProject(project.id, { status: newStatus });
      setProject({ ...project, status: newStatus });
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projectData, milestonesData] = await Promise.all([
        projectsService.getProjectById(id),
        projectsService.getProjectMilestones(id),
      ]);
      setProject(projectData);
      setMilestones(milestonesData || []);
      setTeamMembers([]);
      setRecentActivity([]);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
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

  if (error || !project) {
    return <ErrorState message={error || 'Project not found'} />;
  }

  return (
    <>
      <AppHeader title={project.name} />

      <RelationalCommandCenter entityType="project" entityId={project.id}>
        <div className="space-y-6">
          <Link
          to="/app/projects"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">{project.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={project.type} variant="info" />
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`border-none rounded-full px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer ${
                      project.status === 'completed' || project.status === 'deployed' ? 'text-[#10B981] bg-[#10B981]/10' :
                      project.status === 'cancelled' ? 'text-red-500 bg-red-500/10' :
                      project.status === 'in_progress' ? 'text-yellow-500 bg-yellow-500/10' :
                      'text-[#3B82F6] bg-[#3B82F6]/10'
                    }`}
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="deployed">Deployed</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {project.metadata?.provider_name && (
                    <IntegrationBadge 
                      providerName={project.metadata.provider_name}
                      externalId={project.metadata.external_id}
                      lastSynced={project.metadata.last_synced_at}
                      sourceUrl={project.metadata.source_url}
                    />
                  )}
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-6">{project.description}</p>

            <BlockersPanel entityType="project" entityId={project.id} />
            <RelationalMetricsCard entityType="project" entityId={project.id} />
            <NextBestActionPanel entityType="project" entityData={project} />

            <div className="space-y-4 mt-6 border-t border-slate-800 pt-6">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-slate-400 text-xs">Client</p>
                  <p className="text-white text-sm font-medium">{project.organizations?.name || 'Unknown Client'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-slate-400 text-xs">Timeline</p>
                  <p className="text-white text-sm font-medium">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'} - {project.target_completion_date ? new Date(project.target_completion_date).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-slate-400 text-xs">Contract Value</p>
                  <p className="text-white text-sm font-medium">
                    ${(project.budget || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                to={`/app/delivery/${id}`}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 rounded-lg text-[#3B82F6] transition-colors"
              >
                <Rocket className="w-4 h-4" />
                <span className="text-sm font-medium">Delivery Management</span>
              </Link>
              {project.staging_url && (
                <a
                  href={project.staging_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  <span className="text-sm font-medium">View Staging</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setShowQR(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 transition-colors mt-2"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Mobile QR Link</span>
              </button>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card glass className="p-0 border-indigo-500/20 shadow-indigo-500/10">
              <div className="p-6 border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white">Generative Charter & Drafting</h3>
              </div>
              <GenerativeDraftingStudio 
                 documentId={project.id} 
                 contextPayload={`Project Name: ${project.name}\nProject Target Goal: ${project.description}\nProject Status: ${project.status}`}
              />
            </Card>

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Project Progress</h3>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Overall Completion</span>
                  <span className="text-white text-lg font-bold">{project.progress_percentage || 0}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress_percentage || 0}%` }}
                    transition={{ duration: 1.5 }}
                    className="bg-gradient-to-r from-[#3B82F6] to-[#10B981] h-3 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {milestones.length === 0 ? (
                  <EmptyState
                    icon={FolderKanban}
                    title="No Milestones"
                    description="No milestones have been created for this project."
                  />
                ) : (
                  milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            milestone.status === 'completed'
                              ? 'bg-[#10B981] border-[#10B981]'
                              : 'border-slate-600'
                          }`}
                        >
                          {milestone.status === 'completed' && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={milestone.status === 'completed' ? 'text-white' : 'text-slate-400'}
                        >
                          {milestone.title}
                        </span>
                      </div>
                      <span className="text-slate-500 text-sm">{milestone.completion_date || milestone.target_date || 'TBD'}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Team Members</h3>
              {teamMembers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Team Members"
                  description="No team members assigned to this project yet."
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {member.profiles?.full_name ? member.profiles.full_name[0] : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{member.profiles?.full_name || 'User'}</p>
                        <p className="text-slate-400 text-xs truncate capitalize">{member.role?.replace('_', ' ')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
            <TimelineActivity entityType="project" entityId={project.id} />
          </div>
        </div>
        </div>
      </RelationalCommandCenter>

      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <Card glass className="p-8 border-indigo-500/30 shadow-2xl relative">
                <button
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Mobile Access</h3>
                  <p className="text-sm text-slate-400">Scan this QR code with any mobile device to instantly open the field agent view for this specific project.</p>
                </div>

                <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-inner mx-auto max-w-[240px]">
                  <QRCodeSVG 
                    value={`${window.location.origin}/mobile/projects/${project.id}`}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500 break-all">{`${window.location.origin}/mobile/projects/${project.id}`}</p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
