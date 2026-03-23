import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  FileText,
  Link2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Card from '../Card';
import Badge from '../Badge';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { enterpriseIntegration } from '../../lib/enterpriseIntegration';

interface DashboardStats {
  activeConnectors: number;
  totalConnectors: number;
  activeWorkflows: number;
  totalWorkflows: number;
  documentsProcessed: number;
  enabledFeatures: number;
}

interface DashboardHealth {
  connectors: 'healthy' | 'warning' | 'error' | 'info';
  workflows: 'healthy' | 'warning' | 'error' | 'info';
  overall: 'healthy' | 'warning' | 'error' | 'info';
}

export default function EnterpriseDashboard() {
  const { currentOrganization } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<DashboardHealth | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) {
      loadDashboard();
    }
  }, [currentOrganization]);

  const loadDashboard = async () => {
    if (!currentOrganization) return;

    try {
      const dashboard = await enterpriseIntegration.getOrganizationDashboard(
        currentOrganization.id,
        'professional'
      );

      setStats(dashboard.stats);
      setHealth(dashboard.health);
      setFeatures(dashboard.features);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats || !health) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Link2}
          label="Active Connectors"
          value={stats.activeConnectors}
          total={stats.totalConnectors}
          color="blue"
          trend={health.connectors}
        />

        <StatCard
          icon={Zap}
          label="Active Workflows"
          value={stats.activeWorkflows}
          total={stats.totalWorkflows}
          color="green"
          trend={health.workflows}
        />

        <StatCard
          icon={FileText}
          label="Documents Processed"
          value={stats.documentsProcessed}
          color="purple"
        />

        <StatCard
          icon={Activity}
          label="Enabled Features"
          value={stats.enabledFeatures}
          color="amber"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Health</h3>
          <HealthIndicator status={health.overall} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <HealthCard
            label="Connectors"
            status={health.connectors}
            description={
              health.connectors === 'healthy'
                ? 'All connectors operational'
                : 'No active connectors'
            }
          />
          <HealthCard
            label="Workflows"
            status={health.workflows}
            description={
              health.workflows === 'healthy'
                ? 'Automation running smoothly'
                : 'No active workflows'
            }
          />
          <HealthCard
            label="Overall"
            status={health.overall}
            description={
              health.overall === 'healthy'
                ? 'All systems operational'
                : 'Some systems inactive'
            }
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
        <div className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <Badge key={feature} color="blue">
              {formatFeatureName(feature)}
            </Badge>
          ))}
          {features.length === 0 && (
            <p className="text-slate-400 text-sm">No features enabled</p>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">
          Integration Status
        </h3>
        <div className="space-y-3">
          <IntegrationRow
            name="Data Pipeline"
            status={stats.activeConnectors > 0 ? 'active' : 'inactive'}
            description="Syncing data from connected sources"
          />
          <IntegrationRow
            name="Workflow Automation"
            status={stats.activeWorkflows > 0 ? 'active' : 'inactive'}
            description="Automated processes and triggers"
          />
          <IntegrationRow
            name="Document Intelligence"
            status={stats.documentsProcessed > 0 ? 'active' : 'inactive'}
            description="AI-powered document processing"
          />
          <IntegrationRow
            name="Mobile Sync"
            status="active"
            description="Real-time mobile synchronization"
          />
        </div>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  total?: number;
  color: 'blue' | 'green' | 'purple' | 'amber';
  trend?: 'healthy' | 'warning' | 'error' | 'info';
}

function StatCard({ icon: Icon, label, value, total, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && <HealthIndicator status={trend} size="sm" />}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-3xl font-bold text-white">{value}</div>
          {total !== undefined && (
            <div className="text-lg text-slate-400">/ {total}</div>
          )}
        </div>

        <div className="text-sm text-slate-400">{label}</div>
      </Card>
    </motion.div>
  );
}

interface HealthIndicatorProps {
  status: 'healthy' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

function HealthIndicator({ status, size = 'md' }: HealthIndicatorProps) {
  const sizeClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const config = {
    healthy: { color: 'bg-green-500', icon: CheckCircle, text: 'Healthy' },
    warning: { color: 'bg-amber-500', icon: AlertCircle, text: 'Warning' },
    error: { color: 'bg-red-500', icon: AlertCircle, text: 'Error' },
    info: { color: 'bg-blue-500', icon: Activity, text: 'Info' },
  };

  const { color, icon: Icon, text } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses} ${color} rounded-full animate-pulse`} />
      {size === 'md' && (
        <span className="text-sm font-medium text-slate-300">{text}</span>
      )}
    </div>
  );
}

interface HealthCardProps {
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'info';
  description: string;
}

function HealthCard({ label, status, description }: HealthCardProps) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{label}</h4>
        <HealthIndicator status={status} size="sm" />
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

interface IntegrationRowProps {
  name: string;
  status: 'active' | 'inactive';
  description: string;
}

function IntegrationRow({ name, status, description }: IntegrationRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-sm font-medium text-white">{name}</h4>
          <Badge color={status === 'active' ? 'green' : 'slate'} className="text-xs">
            {status}
          </Badge>
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <TrendingUp
        className={`w-5 h-5 ${
          status === 'active' ? 'text-green-400' : 'text-slate-500'
        }`}
      />
    </div>
  );
}

function formatFeatureName(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
