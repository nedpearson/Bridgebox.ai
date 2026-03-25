import { useState, useEffect } from 'react';
import { commandCenterApi, InternalAuditEvent } from '../../../lib/commandCenter';
import { Shield, Search, Filter } from 'lucide-react';

export default function AuditTrail() {
  const [events, setEvents] = useState<InternalAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await commandCenterApi.listAuditEvents(200);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            Internal Audit Trail
          </h2>
          <p className="text-sm text-slate-400 mt-1">Immutable ledger of Super Admin activities and tool access vectors.</p>
        </div>
        <button onClick={loadEvents} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
          Refresh Ledger
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Event Type</th>
                <th className="p-4 font-medium">Module Location</th>
                <th className="p-4 font-medium">Target Context</th>
                <th className="p-4 font-medium">Admin ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                     {new Date(ev.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-white font-medium">
                    {ev.event_type}
                  </td>
                  <td className="p-4 text-sm text-indigo-400 font-mono">
                    [{ev.module}]
                  </td>
                   <td className="p-4 text-sm text-slate-300">
                    {ev.target_type && ev.target_id 
                      ? `${ev.target_type}:${ev.target_id.split('-')[0]}...` 
                      : <span className="text-slate-600 italic">No target</span>}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {ev.actor_user_id.split('-')[0]}...
                  </td>
                </tr>
              ))}
              {events.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">No internal audit trails recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
