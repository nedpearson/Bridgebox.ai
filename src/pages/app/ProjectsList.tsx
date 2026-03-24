import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, FolderKanban } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { projectsService } from '../../lib/db/projects';
import ProjectModal from '../../components/app/ProjectModal';

export default function ProjectsList() {
  const { currentOrganization } = useAuth();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    loadProjects();
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (statusFilter !== 'all') {
        newParams.set('status', statusFilter);
      } else {
        newParams.delete('status');
      }
      return newParams;
    }, { replace: true });
  }, [statusFilter, setSearchParams]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (currentOrganization?.id) filters.organization_id = currentOrganization.id;
      
      const data = await projectsService.getAllProjects(filters);
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await projectsService.searchProjects(query, currentOrganization?.id);
        setProjects(data || []);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      loadProjects();
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

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      dashboard: 'Dashboard',
      mobile_app: 'Mobile App',
      web_app: 'Web App',
      integration: 'Integration',
      consulting: 'Consulting',
      other: 'Other',
    };
    return map[type] || type;
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
        title="Projects"
        subtitle="Track and manage all client projects"
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-white rounded-lg transition-colors focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="testing">Testing</option>
            <option value="deployed">Deployed</option>
            <option value="completed">Completed</option>
          </select>

          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/app/projects/${project.id}`}>
                  <Card glass className="p-6 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer h-full">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                          {project.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{project.organizations?.name || 'No client'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <StatusBadge status={getTypeLabel(project.type)} variant="info" />
                      <StatusBadge status={project.status} variant={getStatusVariant(project.status)} />
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      {project.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {project.start_date && (
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Start Date</p>
                            <p className="text-white text-sm">
                              {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        )}
                        {project.target_completion_date && (
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Target Date</p>
                            <p className="text-white text-sm">
                              {new Date(project.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>

                      {project.profiles && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Project Manager</p>
                          <p className="text-white text-sm">{project.profiles.full_name || 'Unassigned'}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={loadProjects}
      />
    </>
  );
}
