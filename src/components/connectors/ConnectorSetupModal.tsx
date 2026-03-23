import { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../Button';
import type { ConnectorProvider } from '../../lib/connectors/types';

interface ConnectorSetupModalProps {
  provider: ConnectorProvider;
  onClose: () => void;
  onConnect: (credentials: Record<string, any>, config: Record<string, any>) => Promise<void>;
}

export function ConnectorSetupModal({ provider, onClose, onConnect }: ConnectorSetupModalProps) {
  const [credentials, setCredentials] = useState<Record<string, any>>({});
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      await onConnect(credentials, config);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, schema: any) => {
    const isCredential = ['apiKey', 'accessToken', 'refreshToken', 'secret', 'password', 'authValue'].includes(key);
    const value = isCredential ? credentials[key] : config[key];
    const onChange = isCredential ? handleFieldChange : handleConfigChange;

    switch (schema.type) {
      case 'password':
        return (
          <input
            type="password"
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={schema.required}
            placeholder={schema.description}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={schema.required}
            placeholder={schema.description}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={schema.required}
          >
            <option value="">Select...</option>
            {schema.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || schema.defaultValue || false}
              onChange={(e) => onChange(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">{schema.description}</span>
          </label>
        );

      case 'array':
        return (
          <div className="space-y-2">
            {schema.options?.map((option: string) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value?.includes(option) || false}
                  onChange={(e) => {
                    const current = value || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    onChange(key, updated);
                  }}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{option.split('/').pop()}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={schema.required}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {provider.icon_url && (
              <img src={provider.icon_url} alt={provider.name} className="w-8 h-8" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Connect {provider.name}</h2>
              <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Connection Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(provider.config_schema || {}).map(([key, schema]: [string, any]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  {schema.label}
                  {schema.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(key, schema)}
                {schema.description && schema.type !== 'boolean' && (
                  <p className="text-xs text-slate-500 mt-1">{schema.description}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
