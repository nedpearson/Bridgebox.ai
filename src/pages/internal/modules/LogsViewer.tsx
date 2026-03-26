import { useState, useEffect } from 'react';
import { commandCenterApi, InternalLog } from '../../../lib/commandCenter';
import { Terminal, AlertTriangle, Info, AlertCircle, ShieldAlert } from 'lucide-react';

export default function LogsViewer() {
  const [logs, setLogs] = useState<InternalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [filterSeverity]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await commandCenterApi.listLogs(100, filterSeverity !== 'all' ? { severity: filterSeverity } : undefined);
      setLogs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'critical': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default: return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-indigo-500" />
            System Logs
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time system, API, and background worker event logs.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filterSeverity} 
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={loadLogs} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono">Loading telemetry...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono border-t border-slate-800">
            No logs matched the current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-[70vh] overflow-y-auto font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/50 transition-colors group">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-800/50 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">{new Date(log.created_at).toISOString()}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs">[{log.type}]</span>
                        {log.module && <span className="text-slate-400 text-xs">{log.module}</span>}
                      </div>
                      <span className="text-slate-600 text-xs hidden group-hover:block transition-opacity opacity-50">ID: {log.id.split('-')[0]}</span>
                    </div>
                    <div className="text-slate-200 mt-2 whitespace-pre-wrap">{log.message}</div>
                    
                    {Object.keys(log.metadata || {}).length > 0 && (
                      <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 overflow-x-auto">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
