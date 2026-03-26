import { useState, useEffect } from 'react';
import { auditService, AuditLog } from '../../../lib/db/audit';
import { Shield, Search, Filter } from 'lucide-react';

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data } = await auditService.getGlobalLogs(100);
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
            Global Audit Ledger
          </h2>
          <p className="text-sm text-slate-400 mt-1">Immutable ledger of all client events across the multi-tenant landscape.</p>
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
                <th className="p-4 font-medium">Organization</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Resource</th>
                <th className="p-4 font-medium">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                     {new Date(ev.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-indigo-400 font-medium">
                    {ev.org_name || ev.organization_id.split('-')[0] + '...'}
                  </td>
                  <td className="p-4 text-sm text-white font-mono uppercase">
                    {ev.action_type}
                  </td>
                   <td className="p-4 text-sm text-slate-300">
                    {ev.resource_type} {ev.resource_id ? `(${ev.resource_id.split('-')[0]}...)` : ''}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {ev.user_email || ev.user_name || 'System / Auto'}
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
