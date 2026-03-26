import React, { useEffect, useState } from 'react';
import { Network, Search, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { schemaNormalizer, WebhookPayload } from '../../../lib/ai/services/schemaNormalizer';

export default function IntegrationIngestionLog() {
  const { currentOrganization, user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchWebhooks();
    }
  }, [currentOrganization?.id]);

  const fetchWebhooks = async () => {
    if (!currentOrganization?.id) return;
    try {
      const data = await schemaNormalizer.getPendingWebhooks(currentOrganization.id);
      setWebhooks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (webhook: WebhookPayload) => {
    if (!user?.id) return;
    setProcessingId(webhook.id);
    const success = await schemaNormalizer.physicallyCommitPayload(webhook, user.id);
    if (success) {
      setWebhooks(prev => prev.filter(w => w.id !== webhook.id));
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await schemaNormalizer.physicallyCommitPayload({ id, status: 'rejected' } as any, user!.id).catch(() => {});
    setWebhooks(prev => prev.filter(w => w.id !== id));
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Network className="w-6 h-6 mr-2 text-indigo-400" />
            Integration OS Staging Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review and approve AI-normalized payloads captured from external software connections (Zapier, Make, APIs).
          </p>
        </div>
      </div>

      {webhooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center text-slate-400">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-500/50 mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">Stack Normalizer Idle</h3>
          <p className="text-sm max-w-sm mx-auto">No pending webhooks or integration packets detected. External data will appear here for schema mapping approval securely.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="rounded-xl border border-slate-700 bg-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${webhook.source === 'zapier' ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'} border border-slate-700`}>
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white capitalize">{webhook.source} Webhook Hooked</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{webhook.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                    webhook.status === 'processing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    webhook.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {webhook.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin mr-1"/>}
                    {webhook.status}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-x divide-slate-700">
                {/* Raw Ingestion Payload */}
                <div className="p-4 bg-slate-900/50">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                    <Search className="w-3 h-3 mr-1" /> Raw Payload JSON
                  </h5>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                    {JSON.stringify(webhook.raw_payload, null, 2)}
                  </pre>
                </div>

                {/* AI Mapped Payload */}
                <div className="p-4 bg-indigo-950/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <Sparkles className="w-24 h-24 text-indigo-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                     <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center">
                       <Sparkles className="w-3 h-3 mr-1" /> AI Target Mapping: <span className="text-white ml-2 capitalize bg-indigo-500/20 px-2 py-0.5 rounded">{webhook.mapped_entity_type || 'Unknown'}</span>
                     </h5>
                  </div>
                  
                  {webhook.error_log ? (
                     <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="font-mono">{webhook.error_log}</span>
                     </div>
                  ) : webhook.mapped_entity_payload ? (
                     <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-indigo-500/30 overflow-x-auto relative z-10">
                        {JSON.stringify(webhook.mapped_entity_payload, null, 2)}
                     </pre>
                  ) : (
                    <div className="text-xs text-slate-500 italic flex items-center p-3">
                       <Loader2 className="w-3 h-3 animate-spin mr-2" />
                       Intelligence engine is structuring payload...
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end space-x-2 relative z-10 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(webhook.id)}
                      disabled={processingId === webhook.id}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors rounded shadow-sm flex items-center border border-slate-700"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Discard
                    </button>
                    <button
                      onClick={() => handleApprove(webhook)}
                      disabled={processingId === webhook.id || !webhook.mapped_entity_payload}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors border border-indigo-400/50 shadow-md shadow-indigo-500/20 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === webhook.id ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      Approve Link & Map to Relational Core
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
