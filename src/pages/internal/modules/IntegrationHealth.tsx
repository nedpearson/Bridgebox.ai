import { useState, useEffect } from 'react';
import { commandCenterApi, InternalIntegrationEvent } from '../../../lib/commandCenter';
import { Link2, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import IntegrationIngestionLog from '../../../components/connectors/IntegrationIngestionLog';

export default function IntegrationHealth() {
  const [events, setEvents] = useState<InternalIntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await commandCenterApi.listIntegrationEvents();
      // Group by provider to show latest status per provider logically
      const latestMap = new Map<string, InternalIntegrationEvent>();
      data.forEach(ev => {
        if (!latestMap.has(ev.provider)) {
          latestMap.set(ev.provider, ev);
        }
      });
      setEvents(Array.from(latestMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'healthy': return <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-500/20 w-fit"><CheckCircle2 className="w-4 h-4" /> Healthy</span>;
      case 'degraded': return <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-semibold border border-amber-500/20 w-fit"><AlertTriangle className="w-4 h-4" /> Degraded</span>;
      case 'failing': return <span className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold border border-red-500/20 w-fit"><XCircle className="w-4 h-4" /> Failing</span>;
      case 'disconnected': return <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 text-slate-400 rounded-lg text-sm font-semibold border border-slate-500/20 w-fit"><ShieldAlert className="w-4 h-4" /> Disconnected</span>;
      default: return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Link2 className="w-6 h-6 text-emerald-400" />
            Integration Health
          </h2>
          <p className="text-sm text-slate-400 mt-1">Status of third-party API connections (Stripe, Resend, Supabase, LLMs).</p>
        </div>
        <button onClick={loadEvents} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
          Ping Services
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-slate-400" />
                  {ev.provider}
                </h3>
                {getStatusDisplay(ev.status)}
              </div>
              
              {ev.failure_summary && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-mono">
                  {ev.failure_summary}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/50 mt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Last Sync: {ev.last_sync_at ? new Date(ev.last_sync_at).toLocaleString() : 'Never'}</span>
              <span>Env: {ev.environment_source || 'Unknown'}</span>
            </div>
          </div>
        ))}

        {events.length === 0 && !loading && (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-slate-500 bg-slate-900 rounded-xl border border-dashed border-slate-800">
            No integration telemetry available.
          </div>
        )}
      </div>

      <div className="pt-8 mt-8 border-t border-slate-800">
         <IntegrationIngestionLog />
      </div>
    </div>
  );
}
