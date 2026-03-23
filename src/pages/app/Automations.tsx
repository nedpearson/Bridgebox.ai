import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  automationService,
  TRIGGER_CONFIGS,
  ACTION_CONFIGS,
  type AutomationRule,
} from '../../lib/db/automations';

export default function Automations() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState({
    total_rules: 0,
    active_rules: 0,
    recent_success: 0,
    recent_failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, statsData] = await Promise.all([
        automationService.getAllRules(),
        automationService.getStats(),
      ]);
      setRules(rulesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId: string, currentState: boolean) => {
    try {
      await automationService.toggleRule(ruleId, !currentState);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      await automationService.deleteRule(ruleId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const getTriggerLabel = (type: string) => {
    return TRIGGER_CONFIGS.find((t) => t.type === type)?.label || type;
  };

  const getActionLabel = (type: string) => {
    return ACTION_CONFIGS.find((a) => a.type === type)?.label || type;
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Automations" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  const statCards = [
    {
      label: 'Total Rules',
      value: stats.total_rules,
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Active Rules',
      value: stats.active_rules,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Recent Success',
      value: stats.recent_success,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Recent Failures',
      value: stats.recent_failed,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <>
      <AppHeader
        title="Automations"
        action={
          <Link to="/app/automations/new">
            <Button variant="primary">
              <Plus className="w-5 h-5" />
              New Automation
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Automation Rules</h2>
              <p className="text-sm text-slate-400">
                Automate workflows and triggers across Bridgebox operations
              </p>
            </div>
          </div>

          {rules.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No automation rules"
              description="Create your first automation rule to streamline operations"
              action={
                <Link to="/app/automations/new">
                  <Button variant="primary">
                    <Plus className="w-5 h-5" />
                    Create First Automation
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            rule.is_active
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {rule.description && (
                        <p className="text-sm text-slate-400 mb-4">{rule.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-300">{getTriggerLabel(rule.trigger_type)}</span>
                        </div>
                        <span className="text-slate-500">→</span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <Zap className="w-4 h-4 text-green-400" />
                          <span className="text-green-300">{getActionLabel(rule.action_type)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(rule.id, rule.is_active)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                      >
                        {rule.is_active ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        title="Delete rule"
                      >
                        <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
