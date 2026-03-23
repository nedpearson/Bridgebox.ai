import { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import {
  TRIGGER_CONFIGS,
  ACTION_CONFIGS,
  type TriggerType,
  type ActionType,
  type TriggerConfig,
  type ActionConfig,
} from '../../lib/db/automations';

interface RuleBuilderProps {
  initialTrigger?: TriggerType;
  initialTriggerConditions?: Record<string, any>;
  initialAction?: ActionType;
  initialActionConfig?: Record<string, any>;
  onChange?: (data: {
    trigger_type: TriggerType | null;
    trigger_conditions: Record<string, any>;
    action_type: ActionType | null;
    action_config: Record<string, any>;
  }) => void;
}

export default function RuleBuilder({
  initialTrigger,
  initialTriggerConditions = {},
  initialAction,
  initialActionConfig = {},
  onChange,
}: RuleBuilderProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(initialTrigger || null);
  const [triggerConditions, setTriggerConditions] = useState<Record<string, any>>(initialTriggerConditions);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(initialAction || null);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>(initialActionConfig);

  const handleTriggerChange = (trigger: TriggerType) => {
    setSelectedTrigger(trigger);
    setTriggerConditions({});
    notifyChange(trigger, {}, selectedAction, actionConfig);
  };

  const handleTriggerConditionChange = (field: string, value: any) => {
    const newConditions = { ...triggerConditions, [field]: value };
    setTriggerConditions(newConditions);
    notifyChange(selectedTrigger, newConditions, selectedAction, actionConfig);
  };

  const handleActionChange = (action: ActionType) => {
    setSelectedAction(action);
    setActionConfig({});
    notifyChange(selectedTrigger, triggerConditions, action, {});
  };

  const handleActionConfigChange = (key: string, value: any) => {
    const newConfig = { ...actionConfig, [key]: value };
    setActionConfig(newConfig);
    notifyChange(selectedTrigger, triggerConditions, selectedAction, newConfig);
  };

  const notifyChange = (
    trigger: TriggerType | null,
    conditions: Record<string, any>,
    action: ActionType | null,
    config: Record<string, any>
  ) => {
    if (onChange) {
      onChange({
        trigger_type: trigger,
        trigger_conditions: conditions,
        action_type: action,
        action_config: config,
      });
    }
  };

  const triggerConfig = selectedTrigger ? TRIGGER_CONFIGS.find((t) => t.type === selectedTrigger) : null;
  const actionConfigData = selectedAction ? ACTION_CONFIGS.find((a) => a.type === selectedAction) : null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">When this happens...</h3>
            <p className="text-sm text-slate-400">Select a trigger event</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Trigger Event</label>
            <select
              value={selectedTrigger || ''}
              onChange={(e) => handleTriggerChange(e.target.value as TriggerType)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a trigger...</option>
              {TRIGGER_CONFIGS.map((trigger) => (
                <option key={trigger.type} value={trigger.type}>
                  {trigger.label}
                </option>
              ))}
            </select>
          </div>

          {triggerConfig && triggerConfig.conditions.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-slate-300 mb-4">Conditions (optional)</p>
              <div className="space-y-3">
                {triggerConfig.conditions.map((condition) => (
                  <div key={condition.field}>
                    <label className="block text-sm text-slate-400 mb-1">{condition.label}</label>
                    {condition.type === 'select' && condition.options ? (
                      <select
                        value={triggerConditions[condition.field] || ''}
                        onChange={(e) => handleTriggerConditionChange(condition.field, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any</option>
                        {condition.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : condition.type === 'number' ? (
                      <input
                        type="number"
                        value={triggerConditions[condition.field] || ''}
                        onChange={(e) => handleTriggerConditionChange(condition.field, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter value"
                      />
                    ) : (
                      <input
                        type="text"
                        value={triggerConditions[condition.field] || ''}
                        onChange={(e) => handleTriggerConditionChange(condition.field, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter value"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Do this...</h3>
            <p className="text-sm text-slate-400">Select an action to perform</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
            <select
              value={selectedAction || ''}
              onChange={(e) => handleActionChange(e.target.value as ActionType)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select an action...</option>
              {ACTION_CONFIGS.map((action) => (
                <option key={action.type} value={action.type}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>

          {actionConfigData && actionConfigData.fields.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-slate-300 mb-4">Action Configuration</p>
              <div className="space-y-3">
                {actionConfigData.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-slate-400 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'select' && field.options ? (
                      <select
                        value={actionConfig[field.key] || ''}
                        onChange={(e) => handleActionConfigChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={field.required}
                      >
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={actionConfig[field.key] || ''}
                        onChange={(e) => handleActionConfigChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        required={field.required}
                      />
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={actionConfig[field.key] || ''}
                        onChange={(e) => handleActionConfigChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={field.required}
                      />
                    ) : (
                      <input
                        type="text"
                        value={actionConfig[field.key] || ''}
                        onChange={(e) => handleActionConfigChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
