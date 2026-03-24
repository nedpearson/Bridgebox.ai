import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import Button from '../Button';
import { projectsService } from '../../lib/db/projects';
import { organizationsService } from '../../lib/db/organizations';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProjectModal({ isOpen, onClose, onSuccess }: ProjectModalProps) {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web_app',
    organization_id: currentOrganization?.type === 'client' ? currentOrganization.id : '',
    start_date: '',
    target_launch_date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (currentOrganization?.type === 'internal') {
        loadOrganizations();
      } else {
        setFormData(prev => ({
          ...prev,
          organization_id: currentOrganization?.id || ''
        }));
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentOrganization]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const orgs = await organizationsService.getAllClientOrganizations();
      setOrganizations(orgs || []);
      if (orgs && orgs.length > 0 && !formData.organization_id) {
        setFormData(prev => ({ ...prev, organization_id: orgs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.organization_id) {
      setError('Client organization is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const project = await projectsService.createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        status: 'planning',
        organization_id: formData.organization_id,
        start_date: formData.start_date || undefined,
        target_launch_date: formData.target_launch_date || undefined,
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      navigate(`/app/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0F1419] border border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0F1419]/95 backdrop-blur-xl border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Create New Project</h2>
                <p className="text-sm text-slate-400">Set up a new workspace for delivery</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {currentOrganization?.type === 'internal' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Client Organization
                      </label>
                      <select
                        required
                        value={formData.organization_id}
                        onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                        disabled={loadingOrgs}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                      >
                        <option value="">Select a client...</option>
                        {organizations.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                      placeholder="e.g. Q3 Analytics Dashboard"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                    >
                      <option value="web_app">Web Application</option>
                      <option value="mobile_app">Mobile Application</option>
                      <option value="dashboard">Analytics & Dashboard</option>
                      <option value="integration">System Integration</option>
                      <option value="consulting">Consulting / Discovery</option>
                      <option value="other">Other Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all resize-none"
                      placeholder="High-level project goals and requirements..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Target Completion
                      </label>
                      <input
                        type="date"
                        value={formData.target_launch_date}
                        onChange={(e) => setFormData({ ...formData, target_launch_date: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
