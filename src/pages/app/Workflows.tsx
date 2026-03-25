// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Play, Pause, Trash2, Copy, CreditCard as Edit, TrendingUp, Zap, CheckCircle, XCircle, Activity } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { workflowService } from '../../lib/db/workflows';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';
import type { Workflow, WorkflowStats, WorkflowCategory } from '../../types/workflow';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformIntelligence } from '../../hooks/usePlatformIntelligence';

const CATEGORY_COLORS: Record<WorkflowCategory, string> = {
  lead: 'blue',
  project: 'green',
  billing: 'amber',
  support: 'red',
  custom: 'slate',
};

const CATEGORY_LABELS: Record<WorkflowCategory, string> = {
  lead: 'Lead',
  project: 'Project',
  billing: 'Billing',
  support: 'Support',
  custom: 'Custom',
};

export function Workflows() {
  const { currentOrganization } = useAuth();
  const [searchParams] = useSearchParams();
  const contextId = searchParams.get('context');
  const contextType = searchParams.get('contextType') as EntityType | null;

  usePlatformIntelligence({
    id: 'page:workflows_list',
    name: 'Automations & Workflows List',
    type: 'page',
    description: 'Displays all logic chains executing across the platform, including current stats on lead engagement automations and project triggers.',
    relatedNodes: ['module:automations', 'entity:workflow'],
    visibility: { roles: ['super_admin', 'tenant_admin', 'manager'] },
    actions: [
      { id: 'create_workflow', name: 'Create Workflow', type: 'navigation', description: 'Opens the node-based workflow builder.' }
    ]
  });

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<WorkflowCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadWorkflows();
  }, [currentOrganization?.id, contextId, contextType]);

  const loadWorkflows = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      setError(null);
      const [workflowsData, statsData] = await Promise.all([
        workflowService.getWorkflows(currentOrganization.id),
        workflowService.getWorkflowStats(currentOrganization.id),
      ]);
      
      if (contextId && contextType) {
        const links = await entityLinkService.getLinkedEntities(contextType, contextId, 'workflow');
        const validWorkflowIds = new Set(links.map(link => link.target_id === contextId ? link.source_id : link.target_id));
        setWorkflows(workflowsData?.filter(w => validWorkflowIds.has(w.id)) || []);
      } else {
        setWorkflows(workflowsData || []);
      }
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (workflowId: string, currentStatus: boolean) => {
    try {
      await workflowService.toggleWorkflowStatus(workflowId, !currentStatus);
      loadWorkflows();
    } catch (err) {
      console.error('Failed to toggle workflow status:', err);
    }
  };

  const handleDelete = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowService.deleteWorkflow(workflowId);
      loadWorkflows();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    if (filterCategory !== 'all' && workflow.category !== filterCategory) return false;
    if (filterStatus === 'active' && !workflow.is_active) return false;
    if (filterStatus === 'inactive' && workflow.is_active) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ErrorState
          title="Failed to load workflows"
          message={error}
          action={{ label: 'Try Again', onClick: loadWorkflows }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Workflow Orchestration"
        subtitle="Automate multi-step business processes"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Total Workflows</span>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stats.active} active
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Executions (24h)</span>
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stats.executions_24h}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Last 24 hours
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Success Rate</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stats.success_rate}%</div>
                <div className="text-xs text-slate-500 mt-1">
                  Overall performance
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Active Now</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stats.active}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Running workflows
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Link to="/app/workflows/templates">
              <Button variant="secondary">
                Browse Templates
              </Button>
            </Link>
            <Link to="/app/workflows/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </Link>
          </div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No workflows found"
            description={
              workflows.length === 0
                ? 'Create your first workflow to automate your business processes'
                : 'No workflows match the selected filters'
            }
            action={
              workflows.length === 0
                ? (
                    <Button onClick={() => (window.location.href = '/app/workflows/new')}>
                      Create Workflow
                    </Button>
                  )
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {workflow.name}
                        </h3>
                        <Badge color={CATEGORY_COLORS[workflow.category]}>
                          {CATEGORY_LABELS[workflow.category]}
                        </Badge>
                        {workflow.is_active ? (
                          <Badge color="green">
                            <Play className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge color="slate">
                            <Pause className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-slate-400 mb-3">
                          {workflow.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span>Trigger: {workflow.trigger_type.replace(/_/g, ' ')}</span>
                        <span>Executions: {workflow.execution_count}</span>
                        {workflow.last_executed_at && (
                          <span>
                            Last run: {new Date(workflow.last_executed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(workflow.id, workflow.is_active)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        title={workflow.is_active ? 'Pause workflow' : 'Activate workflow'}
                      >
                        {workflow.is_active ? (
                          <Pause className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Play className="w-4 h-4 text-green-400" />
                        )}
                      </button>

                      <Link
                        to={`/app/workflows/${workflow.id}`}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </Link>

                      <Link
                        to={`/app/workflows/${workflow.id}/executions`}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Activity className="w-4 h-4 text-slate-400" />
                      </Link>

                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
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
