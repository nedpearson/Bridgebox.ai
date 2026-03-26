import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Database, DollarSign, Mail, TrendingUp } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import ConnectorCard from '../../components/connectors/ConnectorCard';
import ProviderCard from '../../components/connectors/ProviderCard';
import WorkspaceChatIntegrations from '../../components/connectors/WorkspaceChatIntegrations';
import { connectorService } from '../../lib/connectors';
import type { Connector, ConnectorProvider } from '../../lib/connectors/types';
import { useAuth } from '../../contexts/AuthContext';
import UpgradeModal from '../../components/app/UpgradeModal';

type ViewMode = 'connected' | 'available';
type CategoryFilter = 'all' | 'business_systems' | 'commerce_financial' | 'communication' | 'market_data';

export default function Integrations() {
  const { user, currentOrganization } = useAuth();
  const [view, setView] = useState<ViewMode>('connected');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [providers, setProviders] = useState<ConnectorProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Upsell State
  const [showUpgradeAuth, setShowUpgradeAuth] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const categories = [
    { id: 'all' as const, label: 'All', icon: Filter },
    { id: 'business_systems' as const, label: 'Business', icon: Database },
    { id: 'commerce_financial' as const, label: 'Finance', icon: DollarSign },
    { id: 'communication' as const, label: 'Communication', icon: Mail },
    { id: 'market_data' as const, label: 'Market Data', icon: TrendingUp },
  ];

  useEffect(() => {
    loadData();
  }, [currentOrganization]);

  const loadData = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const [connectorsData, providersData] = await Promise.all([
        connectorService.getConnectorsByOrganization(currentOrganization.id),
        connectorService.getAllProviders(),
      ]);
      setConnectors(connectorsData);
      setProviders(providersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: ConnectorProvider) => {
    if (!currentOrganization?.id) return;
    
    // Feature Gate 
    const isEnterprise = currentOrganization?.is_enterprise_client || false;
    const plan = currentOrganization?.billing_plan || 'free';
    
    if (!isEnterprise && plan !== 'professional' && plan !== 'enterprise' && !currentOrganization.name.startsWith('[DEMO]')) {
       setUpgradeFeature(provider.displayName + ' Integration');
       setShowUpgradeAuth(true);
       return;
    }

    try {
      const connector = await connectorService.createConnector(
        currentOrganization.id,
        provider.id
      );
      await connectorService.connectConnector(connector.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to connect integration');
    }
  };

  const handleSync = async (connector: Connector) => {
    try {
      setSyncing(connector.id);
      await connectorService.syncConnector(connector.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to sync connector');
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (connector: Connector) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      await connectorService.disconnectConnector(connector.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect integration');
    }
  };

  const handleDelete = async (connector: Connector) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return;

    try {
      await connectorService.deleteConnector(connector.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete integration');
    }
  };

  const filteredConnectors = connectors.filter((c) => {
    if (category !== 'all' && c.category !== category) return false;
    if (searchQuery && !c.providerName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredProviders = providers.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (searchQuery && !p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const connectedProviderIds = new Set(connectors.map((c) => c.providerId));

  if (loading) {
    return (
      <div>
        <AppHeader
          title="Integrations"
          subtitle="Connect external data sources and business systems"
        />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AppHeader
          title="Integrations"
          subtitle="Connect external data sources and business systems"
        />
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        title="Integrations"
        subtitle="Connect external data sources and business systems"
      />

      <WorkspaceChatIntegrations />

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setView('connected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'connected'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connected ({connectors.length})
            </button>
            <button
              onClick={() => setView('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'available'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available ({providers.length})
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'connected' && (
        <div>
          {filteredConnectors.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Connected Integrations</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery || category !== 'all'
                    ? 'No integrations match your filters'
                    : 'Connect your first integration to start syncing data'}
                </p>
                <button
                  onClick={() => setView('available')}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                >
                  Browse Available Integrations
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnectors.map((connector) => (
                <motion.div
                  key={connector.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ConnectorCard
                    connector={connector}
                    onSync={handleSync}
                    onDisconnect={handleDisconnect}
                    onDelete={handleDelete}
                    isLoading={syncing === connector.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'available' && (
        <div>
          {filteredProviders.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-bold text-white mb-2">No Integrations Found</h3>
              <p className="text-slate-400">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProviderCard
                    provider={provider}
                    onConnect={handleConnect}
                    isConnected={connectedProviderIds.has(provider.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <UpgradeModal 
        isOpen={showUpgradeAuth}
        onClose={() => setShowUpgradeAuth(false)}
        featureName={upgradeFeature}
        requiredPlan="Professional"
        customDescription={`Third-party API bridging for ${upgradeFeature} requires a premium data pipeline. Upgrade to Professional to instantly sync bidirectional data without manual entry.`}
      />
    </div>
  );
}
