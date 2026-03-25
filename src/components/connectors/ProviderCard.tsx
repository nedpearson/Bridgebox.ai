
import { Plus, ExternalLink, Star, Building2 } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import type { ConnectorProvider } from '../../lib/connectors/types';

interface ProviderCardProps {
  provider: ConnectorProvider;
  onConnect?: (provider: ConnectorProvider) => void;
  isConnected?: boolean;
  isLoading?: boolean;
}

export default function ProviderCard({
  provider,
  onConnect,
  isConnected = false,
  isLoading = false,
}: ProviderCardProps) {
  return (
    <Card className={`p-6 ${isConnected ? 'border-green-500/50 bg-green-500/5' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white">{provider.displayName}</h3>
            {provider.isPopular && (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
            {provider.isEnterprise && (
              <Building2 className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <p className="text-sm text-slate-400">{provider.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.features.slice(0, 4).map((feature, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300"
          >
            {feature}
          </span>
        ))}
        {provider.features.length > 4 && (
          <span className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-400">
            +{provider.features.length - 4} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button variant="secondary" size="sm" className="flex-1" disabled>
            <span className="text-green-400">Connected</span>
          </Button>
        ) : (
          onConnect && (
            <Button
              onClick={() => onConnect(provider)}
              disabled={isLoading || provider.status !== 'available'}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              {provider.status === 'beta' ? 'Connect (Beta)' :
               provider.status === 'coming_soon' ? 'Coming Soon' : 'Connect'}
            </Button>
          )
        )}

        {provider.documentationUrl && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open(provider.documentationUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {provider.status === 'beta' && (
        <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded">
            BETA
          </span>
          This integration is in beta
        </div>
      )}
      {provider.status === 'import_only' && (
        <div className="mt-3 text-xs text-purple-400 flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded">
            IMPORT ONLY
          </span>
          This integration supports importing data only
        </div>
      )}
    </Card>
  );
}
