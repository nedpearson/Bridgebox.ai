import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import RuleBuilder from '../../components/automations/RuleBuilder';
import { automationService, type TriggerType, type ActionType } from '../../lib/db/automations';
import { useAuth } from '../../contexts/AuthContext';

export default function AutomationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [triggerConditions, setTriggerConditions] = useState<Record<string, any>>({});
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleRuleChange = (data: {
    trigger_type: TriggerType | null;
    trigger_conditions: Record<string, any>;
    action_type: ActionType | null;
    action_config: Record<string, any>;
  }) => {
    setTriggerType(data.trigger_type);
    setTriggerConditions(data.trigger_conditions);
    setActionType(data.action_type);
    setActionConfig(data.action_config);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this automation');
      return;
    }

    if (!triggerType) {
      setError('Please select a trigger event');
      return;
    }

    if (!actionType) {
      setError('Please select an action');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await automationService.createRule({
        name: name.trim(),
        description: description.trim() || null,
        trigger_type: triggerType,
        trigger_conditions: triggerConditions,
        action_type: actionType,
        action_config: actionConfig,
        is_active: true,
        created_by: user?.id || null,
      });

      navigate('/app/automations');
    } catch (err) {
      console.error('Failed to create automation:', err);
      setError('Failed to create automation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader title="New Automation" />

      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/automations')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Automation Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Auto-create project from approved proposal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe what this automation does..."
              />
            </div>
          </div>
        </Card>

        <RuleBuilder onChange={handleRuleChange} />

        <div className="flex items-center justify-between pt-4">
          <Button variant="secondary" onClick={() => navigate('/app/automations')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            <Save className="w-5 h-5" />
            {saving ? 'Creating...' : 'Create Automation'}
          </Button>
        </div>
      </div>
    </>
  );
}
