import { useState, useEffect } from 'react';
import { commandCenterApi, InternalAiRun } from '../../../lib/commandCenter';
import { Brain, CheckCircle2, XCircle, Clock, RefreshCw, Zap } from 'lucide-react';

export default function AiPipelineMonitor() {
  const [runs, setRuns] = useState<InternalAiRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const data = await commandCenterApi.listAiRuns(50);
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed': return <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Completed</span>;
      case 'failed': return <span className="flex items-center gap-1 text-red-400"><XCircle className="w-4 h-4" /> Failed</span>;
      case 'processing': return <span className="flex items-center gap-1 text-blue-400"><RefreshCw className="w-4 h-4 animate-spin" /> Processing</span>;
      case 'pending': return <span className="flex items-center gap-1 text-slate-400"><Clock className="w-4 h-4" /> Pending</span>;
      default: return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-fuchsia-400" />
            AI Pipeline Monitor
          </h2>
          <p className="text-sm text-slate-400 mt-1">Track generative extraction, categorization, and transcription jobs.</p>
        </div>
        <button onClick={loadRuns} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
          Refresh List
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Run ID</th>
                <th className="p-4 font-medium">Provider</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Duration (ms)</th>
                <th className="p-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">{run.id.split('-')[0]}...</td>
                  <td className="p-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded-md w-fit">
                      <Zap className="w-3 h-3" />
                      {run.provider}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">{run.job_type}</td>
                  <td className="p-4 text-sm">{getStatusDisplay(run.output_status)}</td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {run.duration_ms ? `${run.duration_ms.toLocaleString()} ms` : '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                     {new Date(run.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {runs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">No AI runs logged in the pipeline.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
