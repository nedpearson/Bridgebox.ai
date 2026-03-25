import { useState, useEffect } from 'react';
import { commandCenterApi } from '../../lib/commandCenter';
import { internalRecordingsApi } from '../../lib/internalRecordings';
import { Link } from 'react-router-dom';
import { Building2, Terminal, Video, Activity, ShieldCheck, Flame } from 'lucide-react';

export default function CommandCenterDashboard() {
  const [stats, setStats] = useState({
    logs: 0,
    jobs: 0,
    errors: 0,
    recordings: 0,
    notes: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [logs, jobs, recs, notes] = await Promise.all([
          commandCenterApi.listLogs(100),
          commandCenterApi.listJobs(100),
          internalRecordingsApi.listRecordings(),
          commandCenterApi.listNotes()
        ]);
        
        setStats({
          logs: logs.length,
          errors: logs.filter(l => l.severity === 'error' || l.severity === 'critical').length,
          jobs: jobs.filter(j => j.status === 'failed').length,
          recordings: recs.length,
          notes: notes.length
        });
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-8 h-8 text-[#3B82F6]" />
          Command Center Overview
        </h2>
        <p className="text-slate-400 mt-2">Super Admin operational flight deck. All telemetry and debugging surfaces are isolated from tenant spaces.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link to="/app/internal/recording-center/errors" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-red-500/50 transition-colors group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
               <Flame className="w-6 h-6" />
             </div>
             <span className="text-3xl font-bold text-white">{stats.errors + stats.jobs}</span>
           </div>
           <h3 className="text-slate-300 font-semibold">Active Errors</h3>
           <p className="text-sm text-slate-500 mt-1">Unhandled exceptions & failed jobs</p>
        </Link>
        
        <Link to="/app/internal/recording-center/capture" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
               <Video className="w-6 h-6" />
             </div>
             <span className="text-3xl font-bold text-white">{stats.recordings}</span>
           </div>
           <h3 className="text-slate-300 font-semibold">Internal Recordings</h3>
           <p className="text-sm text-slate-500 mt-1">Bug captures and product demos</p>
        </Link>

        <Link to="/app/internal/recording-center/logs" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
               <Terminal className="w-6 h-6" />
             </div>
             <span className="text-3xl font-bold text-white">{stats.logs}</span>
           </div>
           <h3 className="text-slate-300 font-semibold">System Logs</h3>
           <p className="text-sm text-slate-500 mt-1">Recent 100 system events</p>
        </Link>

        <Link to="/app/internal/recording-center/audit" className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-indigo-500/50 transition-colors group">
           <div className="flex items-center justify-between mb-4">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <span className="text-3xl font-bold text-white">Secure</span>
           </div>
           <h3 className="text-slate-300 font-semibold">Audit Ledger</h3>
           <p className="text-sm text-slate-500 mt-1">Monitoring admin access vectors</p>
        </Link>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <Activity className="w-5 h-5 text-emerald-400" />
             Quick Actions
           </h3>
           <div className="space-y-3">
             <Link to="/app/internal/recording-center/capture" className="block p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 text-slate-300 font-medium">Record new diagnostic session</Link>
             <Link to="/app/internal/recording-center/notes" className="block p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 text-slate-300 font-medium">Draft build or release note</Link>
             <Link to="/app/internal/recording-center/diagnostics" className="block p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 text-slate-300 font-medium">Search internal routing maps</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
