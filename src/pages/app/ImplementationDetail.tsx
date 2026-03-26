// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  CheckCircle2,
  Circle,
  Server,
  Globe,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import DeploymentPhaseBadge from '../../components/implementation/DeploymentPhaseBadge';
import LaunchStatusBadge from '../../components/implementation/LaunchStatusBadge';
import DeploymentReadinessBadge from '../../components/implementation/DeploymentReadinessBadge';
import EnvironmentStatusBadge from '../../components/implementation/EnvironmentStatusBadge';
import {
  implementationService,
  ImplementationDetail as ImplementationDetailType,
  ChecklistCategory,
} from '../../lib/db/implementation';

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  infrastructure: 'Infrastructure',
  integration: 'Integration',
  migration: 'Data Migration',
  qa: 'Quality Assurance',
  approval: 'Approvals & Sign-off',
  launch: 'Launch & Handoff',
};

const CATEGORY_ICONS: Record<ChecklistCategory, any> = {
  infrastructure: Server,
  integration: Globe,
  migration: Clock,
  qa: CheckCircle2,
  approval: CheckCircle2,
  launch: Rocket,
};

export default function ImplementationDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [implementation, setImplementation] = useState<ImplementationDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingChecklist, setSavingChecklist] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadImplementation();
    }
  }, [projectId]);

  const loadImplementation = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError('');
      const data = await implementationService.getImplementationByProjectId(projectId);

      if (!data) {
        const impl = await implementationService.createImplementation(projectId);
        await implementationService.initializeDefaultChecklist(impl.id);
        const fullData = await implementationService.getImplementationByProjectId(projectId);
        setImplementation(fullData);
      } else {
        setImplementation(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load implementation details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
    if (!implementation) return;

    try {
      setSavingChecklist(true);
      await implementationService.toggleChecklistItem(itemId, completed);

      setImplementation({
        ...implementation,
        checklists: implementation.checklists.map((item) =>
          item.id === itemId
            ? { ...item, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
            : item
        ),
      });
    } catch (err: any) {
      alert('Failed to update checklist item');
    } finally {
      setSavingChecklist(false);
    }
  };

  const getCategoryProgress = (category: ChecklistCategory): number => {
    if (!implementation) return 0;
    const categoryItems = implementation.checklists.filter((item) => item.category === category);
    if (categoryItems.length === 0) return 0;
    const completed = categoryItems.filter((item) => item.is_completed).length;
    return (completed / categoryItems.length) * 100;
  };

  const getOverallProgress = (): number => {
    if (!implementation || implementation.checklists.length === 0) return 0;
    const completed = implementation.checklists.filter((item) => item.is_completed).length;
    return (completed / implementation.checklists.length) * 100;
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Implementation Detail" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader title="Implementation Detail" />
        <ErrorState message={error} onRetry={loadImplementation} />
      </>
    );
  }

  if (!implementation) {
    return (
      <>
        <AppHeader title="Implementation Detail" />
        <ErrorState message="Implementation not found" />
      </>
    );
  }

  const overallProgress = getOverallProgress();

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="px-4 md:px-8 py-6">
          <Link
            to="/app/implementation"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Implementations</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Rocket className="w-6 h-6 text-indigo-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {implementation.project?.name}
                </h1>
              </div>
              <p className="text-slate-400">{implementation.project?.organization?.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DeploymentPhaseBadge phase={implementation.deployment_phase} />
              <DeploymentReadinessBadge readiness={implementation.deployment_readiness} />
              <LaunchStatusBadge status={implementation.launch_status} />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-white font-bold">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-[#10B981]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card glass className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-white">Staging Environment</h3>
            </div>
            {implementation.environments.find((e) => e.environment_type === 'staging') ? (
              <div className="space-y-3">
                <EnvironmentStatusBadge
                  status={implementation.environments.find((e) => e.environment_type === 'staging')!.status}
                />
                {implementation.staging_url && (
                  <a
                    href={implementation.staging_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    <span>{implementation.staging_url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not configured</p>
            )}
          </Card>

          <Card glass className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-[#10B981]" />
              <h3 className="text-lg font-bold text-white">Production Environment</h3>
            </div>
            {implementation.environments.find((e) => e.environment_type === 'production') ? (
              <div className="space-y-3">
                <EnvironmentStatusBadge
                  status={implementation.environments.find((e) => e.environment_type === 'production')!.status}
                />
                {implementation.production_url && (
                  <a
                    href={implementation.production_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-[#10B981] hover:text-[#059669] transition-colors"
                  >
                    <span>{implementation.production_url}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not configured</p>
            )}
          </Card>

          {implementation.go_live_date && (
            <Card glass className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Go-Live Date</h3>
              </div>
              <p className="text-lg text-white font-bold">
                {new Date(implementation.go_live_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </Card>
          )}
        </div>

        {implementation.risks.filter((r) => r.status !== 'resolved').length > 0 && (
          <Card glass className="p-6 border-yellow-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Active Risks & Blockers</h3>
            </div>
            <div className="space-y-3">
              {implementation.risks
                .filter((r) => r.status !== 'resolved')
                .map((risk) => (
                  <div key={risk.id} className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{risk.title}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          risk.severity === 'critical'
                            ? 'bg-red-500/10 text-red-400'
                            : risk.severity === 'high'
                            ? 'bg-orange-500/10 text-orange-400'
                            : risk.severity === 'medium'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    {risk.description && (
                      <p className="text-sm text-slate-400">{risk.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Deployment Checklist</h2>

          {(Object.keys(CATEGORY_LABELS) as ChecklistCategory[]).map((category) => {
            const categoryItems = implementation.checklists.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            const Icon = CATEGORY_ICONS[category];
            const progress = getCategoryProgress(category);

            return (
              <Card key={category} glass className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-bold text-white">{CATEGORY_LABELS[category]}</h3>
                  </div>
                  <span className="text-sm text-slate-400">{Math.round(progress)}% complete</span>
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                          item.is_completed
                            ? 'bg-green-500/5 border border-green-500/20'
                            : 'bg-slate-800/30 border border-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleChecklistItem(item.id, !item.is_completed)}
                          disabled={savingChecklist}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {item.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              item.is_completed ? 'text-slate-400 line-through' : 'text-white'
                            }`}
                          >
                            {item.item_title}
                          </p>
                          {item.item_description && (
                            <p className="text-xs text-slate-500 mt-1">{item.item_description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
