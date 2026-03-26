import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Play, ArrowLeft, Plus, Trash2, Sparkles, Bot, Loader2 } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import RelationalCommandCenter from '../../components/app/RelationalCommandCenter';
import RelationalMetricsCard from '../../components/app/RelationalMetricsCard';
import NextBestActionPanel from '../../components/app/NextBestActionPanel';
import BlockersPanel from '../../components/app/BlockersPanel';
import TimelineActivity from '../../components/app/TimelineActivity';
import { workflowService } from '../../lib/db/workflows';
import { aiService } from '../../lib/ai/services/aiService';
import type { Workflow, WorkflowStep, WorkflowCategory, WorkflowTriggerType, WorkflowStepType } from '../../types/workflow';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeModal from '../../components/app/UpgradeModal';

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
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { profile } = useAuth();

  const handleGenerateWorkflow = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await aiService.generateWorkflow(aiPrompt);
      if (response.success && response.data) {
        setSteps(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to generate workflow');
      }
    } catch (err) {
      console.error('AI Generation Failed:', err);
      alert('Failed to interpret workflow constraints. Please modify your prompt and retry.');
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  useEffect(() => {
    const isStarter = currentOrganization?.billing_plan === 'Starter';
    if (isStarter && profile?.role !== 'super_admin' && profile?.role !== 'internal_staff') {
       setIsUpgradeModalOpen(true);
       setLoading(false);
       return;
    }
    if (id) {
      loadWorkflow();
    }
  }, [id, currentOrganization, profile]);

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

  const renderEditor = () => (
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
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            AI Workflow Macros
          </h2>
        </div>
        <div className="flex items-start gap-4">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your automation... (e.g. 'When a lead is created, wait 2 days and send a welcome email')"
            className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-[100px]"
          />
          <button
            onClick={handleGenerateWorkflow}
            disabled={isGenerating || !aiPrompt.trim()}
            className="flex flex-col items-center justify-center gap-2 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-lg text-white font-medium transition-colors disabled:opacity-50 whitespace-nowrap h-[100px]"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>Generate<br/>Graph</span>
          </button>
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
  );

  const renderContent = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
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
              <LoadingSpinner size="sm" />
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

      {id ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BlockersPanel entityType="workflow" entityId={id} />
            <RelationalMetricsCard entityType="workflow" entityId={id} />
            <NextBestActionPanel entityType="workflow" entityData={{ id, name, category, status: 'active', triggerType }} />
            {renderEditor()}
          </div>
          <div className="space-y-6">
            <TimelineActivity entityType="workflow" entityId={id} />
          </div>
        </div>
      ) : (
        renderEditor()
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title={id ? 'Edit Workflow' : 'New Workflow'}
        subtitle="Configure triggers, conditions, and actions"
      />

      {id ? (
        <RelationalCommandCenter entityType="workflow" entityId={id}>
          {renderContent()}
        </RelationalCommandCenter>
      ) : (
        renderContent()
      )}

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => window.history.back()}
        featureName="Workflow Intelligence"
        requiredPlan="Growth"
        modalType="feature"
        actionType="self-serve"
        customDescription="Building custom automation graphs and AI macro nodes requires moving to the Growth tier. Upgrade to unlock this."
      />
    </div>
  );
}
