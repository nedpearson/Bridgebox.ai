// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Network, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { Button } from '../../components/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import { ConnectorCard } from '../../components/connectors/ConnectorCard';
import { ProviderCard } from '../../components/connectors/ProviderCard';
import { ConnectorSetupModal } from '../../components/connectors/ConnectorSetupModal';
import { connectorService } from '../../lib/connectors';
import { useAuth } from '../../contexts/AuthContext';
import type { ConnectorProvider } from '../../lib/connectors/types';

export default function IntegrationsOverview() {
  const { user, currentOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  const [connectors, setConnectors] = useState<any[]>([]);
  const [providers, setProviders] = useState<ConnectorProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ConnectorProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadData();
    }
  }, [currentOrganization]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [connectorsData, providersData] = await Promise.all([
        connectorService.getConnectorsByOrganization(currentOrganization!.id),
        connectorService.getAllProviders()
      ]);
      setConnectors(connectorsData);
      setProviders(providersData);
    } catch (error) {
      console.error('Failed to load connectors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (credentials: Record<string, any>, config: Record<string, any>) => {
    if (!selectedProvider || !currentOrganization) return;

    const connector = await connectorService.createConnector(
      currentOrganization.id,
      selectedProvider.id
    );

    await connectorService.connectConnector(connector.id, credentials);
    await loadData();
    setSelectedProvider(null);
  };

  const handleSync = async (connectorId: string) => {
    try {
      await connectorService.syncConnector(connectorId);
      await loadData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await connectorService.deleteConnector(connectorId);
      await loadData();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };
  const integrations = [
    {
      id: '1',
      name: 'Salesforce CRM',
      provider: 'Salesforce',
      client: 'Global Sales Co',
      type: 'api',
      status: 'active',
      last_sync: '5 minutes ago',
      sync_frequency: 'Real-time',
    },
    {
      id: '2',
      name: 'Stripe Payments',
      provider: 'Stripe',
      client: 'TechCorp Industries',
      type: 'webhook',
      status: 'active',
      last_sync: '2 hours ago',
      sync_frequency: 'On event',
    },
    {
      id: '3',
      name: 'Google Analytics',
      provider: 'Google',
      client: 'Marketing Dynamics',
      type: 'oauth',
      status: 'active',
      last_sync: '30 minutes ago',
      sync_frequency: 'Hourly',
    },
    {
      id: '4',
      name: 'PostgreSQL Database',
      provider: 'AWS RDS',
      client: 'Manufacturing Ltd',
      type: 'database',
      status: 'active',
      last_sync: '1 minute ago',
      sync_frequency: 'Continuous',
    },
    {
      id: '5',
      name: 'Slack Notifications',
      provider: 'Slack',
      client: 'TechCorp Industries',
      type: 'webhook',
      status: 'error',
      last_sync: '2 days ago',
      sync_frequency: 'On event',
    },
    {
      id: '6',
      name: 'AWS S3 Storage',
      provider: 'Amazon Web Services',
      client: 'Logistics Plus',
      type: 'file_sync',
      status: 'active',
      last_sync: '10 minutes ago',
      sync_frequency: 'Every 15 min',
    },
  ];

  const integrationStats = [
    { label: 'Active Integrations', value: 23, icon: CheckCircle2, color: 'text-[#10B981]' },
    { label: 'Pending Setup', value: 3, icon: Clock, color: 'text-yellow-500' },
    { label: 'Errors', value: 1, icon: AlertCircle, color: 'text-red-500' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'error':
        return 'error';
      case 'pending_setup':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle2;
      case 'error':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const activeConnectors = connectors.filter(c => c.status === 'active');
  const errorConnectors = connectors.filter(c => c.status === 'error');

  return (
    <>
      <AppHeader
        title="Integrations"
        subtitle="Connect external systems and sync data"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Integrations</p>
                <p className="text-3xl font-bold text-green-600">{activeConnectors.length}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-blue-600">{providers.length}</p>
              </div>
              <Network className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Errors</p>
                <p className="text-3xl font-bold text-red-600">{errorConnectors.length}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('connected')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'connected'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Connected ({connectors.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Available ({providers.length})
            </button>
          </div>
        </div>

        {activeTab === 'connected' && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Loading connectors...</p>
              </div>
            ) : connectors.length === 0 ? (
              <Card className="p-12 text-center">
                <Network className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No integrations connected
                </h3>
                <p className="text-slate-600 mb-6">
                  Get started by connecting your first integration
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  Browse Integrations
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectors.map((connector, index) => (
                  <motion.div
                    key={connector.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ConnectorCard
                      connector={connector}
                      onSync={() => handleSync(connector.id)}
                      onDisconnect={() => handleDisconnect(connector.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProviderCard
                    provider={provider}
                    onConnect={() => setSelectedProvider(provider)}
                    isConnected={connectors.some(c => c.provider_id === provider.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProvider && (
        <ConnectorSetupModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onConnect={handleConnect}
        />
      )}
    </>
  );
}
