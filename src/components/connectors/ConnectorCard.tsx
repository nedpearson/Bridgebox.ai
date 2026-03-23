import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Power, ExternalLink, Clock } from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import ConnectorStatusBadge from './ConnectorStatusBadge';
import type { Connector } from '../../lib/connectors/types';

interface ConnectorCardProps {
  connector: Connector;
  onSync?: (connector: Connector) => void;
  onDisconnect?: (connector: Connector) => void;
  onDelete?: (connector: Connector) => void;
  isLoading?: boolean;
}

export default function ConnectorCard({
  connector,
  onSync,
  onDisconnect,
  onDelete,
  isLoading = false,
}: ConnectorCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {connector.providerName}
          </h3>
          <ConnectorStatusBadge status={connector.status} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Type:</span>
          <span className="text-slate-300 capitalize">
            {connector.type.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Category:</span>
          <span className="text-slate-300 capitalize">
            {connector.category.replace('_', ' ')}
          </span>
        </div>

        {connector.lastSyncAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Last Sync:</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(connector.lastSyncAt)}
            </span>
          </div>
        )}

        {connector.recordCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Records:</span>
            <span className="text-slate-300">{connector.recordCount.toLocaleString()}</span>
          </div>
        )}

        {connector.syncCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Syncs:</span>
            <span className="text-slate-300">{connector.syncCount}</span>
          </div>
        )}

        {connector.lastSyncError && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
            {connector.lastSyncError}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {connector.status === 'connected' && onSync && (
          <Button
            onClick={() => onSync(connector)}
            disabled={isLoading}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        )}

        {connector.status === 'connected' && onDisconnect && (
          <Button
            onClick={() => onDisconnect(connector)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            <Power className="w-4 h-4" />
          </Button>
        )}

        {onDelete && (
          <Button
            onClick={() => onDelete(connector)}
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
