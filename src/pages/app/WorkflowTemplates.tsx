import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { workflowService } from '../../lib/db/workflows';
import type { WorkflowTemplate, WorkflowCategory } from '../../types/workflow';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORY_COLORS: Record<WorkflowCategory, string> = {
  lead: 'blue',
  project: 'green',
  billing: 'amber',
  support: 'red',
  custom: 'slate',
};

export function WorkflowTemplates() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganizations();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<WorkflowCategory | 'all'>('all');
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    if (!currentOrganization?.id) return;

    try {
      setCreating(template.id);
      const workflow = await workflowService.createFromTemplate(
        template.id,
        currentOrganization.id,
        `${template.name} (Copy)`
      );
      navigate(`/app/workflows/${workflow.id}`);
    } catch (err) {
      console.error('Failed to create workflow from template:', err);
      alert('Failed to create workflow from template');
      setCreating(null);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    filterCategory === 'all' || template.category === filterCategory
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Workflow Templates"
        subtitle="Pre-built workflows for common scenarios"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/app/workflows')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="lead">Lead</option>
            <option value="project">Project</option>
            <option value="billing">Billing</option>
            <option value="support">Support</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {filteredTemplates.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No templates available"
            message="Check back soon for pre-built workflow templates"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    {template.icon && (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {template.name}
                      </h3>
                      <Badge color={CATEGORY_COLORS[template.category]}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-slate-400 mb-4 flex-1">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-500">
                      Used {template.times_used} times
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      disabled={creating === template.id}
                    >
                      {creating === template.id ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Use Template'
                      )}
                    </Button>
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
