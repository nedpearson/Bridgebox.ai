import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Play, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { workflowService } from '../../lib/db/workflows';
import type { Workflow, WorkflowStep, WorkflowCategory, WorkflowTriggerType, WorkflowStepType } from '../../types/workflow';
import { useAuth } from '../../contexts/AuthContext';

const TRIGGER_OPTIONS: { value: WorkflowTriggerType; label: string }[] = [
  { value: 'lead_created', label: 'Lead Created' },
  { value: 'proposal_approved', label: 'Proposal Approved' },
  { value: 'onboarding_completed', label: 'Onboarding Completed' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'support_ticket_created', label: 'Support Ticket Created' },
  { value: 'invoice_overdue', label: 'Invoice Overdue' },
];

const CATEGORY_OPTIONS: { value: WorkflowCategory; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'project', label: 'Project' },
  { value: 'billing', label: 'Billing' },
  { value: 'support', label: 'Support' },
  { value: 'custom', label: 'Custom' },
];

export function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkflowCategory>('custom');
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>('lead_created');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (id) {
      loadWorkflow();
    }
  }, [id]);

  const loadWorkflow = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const workflow = await workflowService.getWorkflowWithSteps(id);
      if (workflow) {
        setName(workflow.name);
        setDescription(workflow.description || '');
        setCategory(workflow.category);
        setTriggerType(workflow.trigger_type);
        setSteps(workflow.steps);
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization?.id) return;
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      setSaving(true);

      if (id) {
        await workflowService.updateWorkflow(id, {
          name,
          description,
          category,
          trigger_type: triggerType,
        });
      } else {
        const workflow = await workflowService.createWorkflow({
          organization_id: currentOrganization.id,
          name,
          description,
          category,
          trigger_type: triggerType,
          is_active: false,
        });

        navigate(`/app/workflows/${workflow.id}`);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      alert('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

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
        title={id ? 'Edit Workflow' : 'New Workflow'}
        subtitle="Configure triggers, conditions, and actions"
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/app/workflows')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1" />
          <Button
            variant="secondary"
            onClick={() => navigate('/app/workflows')}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., High-Value Lead Processing"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkflowCategory)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trigger
                  </label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as WorkflowTriggerType)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {TRIGGER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Workflow Steps</h2>
              <Button size="sm" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="mb-2">No steps added yet</p>
                <p className="text-sm">Visual workflow builder coming soon</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white mb-1">
                          {index + 1}. {step.step_name}
                        </div>
                        <div className="text-sm text-slate-400">
                          Type: {step.step_type}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
