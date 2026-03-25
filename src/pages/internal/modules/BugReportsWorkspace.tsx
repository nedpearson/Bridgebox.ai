import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { devQaAiApi, InternalBugReport } from '../../../lib/devQaAi';
import { Loader2, Bug, Search, Filter, Sparkles, ShieldCheck, AlertOctagon, Server } from 'lucide-react';

export default function BugReportsWorkspace() {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState<InternalBugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'draft_generated' | 'approved' | 'all'>('draft_generated');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await devQaAiApi.getAllBugReports();
      setBugs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  };

  const filtered = bugs.filter(b => {
    if (activeTab === 'draft_generated' && b.status !== 'draft_generated' && b.status !== 'under_review') return false;
    if (activeTab === 'approved' && b.status !== 'approved' && b.status !== 'confirmed') return false;
    return true;
  });

  return (
    <div className="space-y-8">
      
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <Bug className="w-8 h-8 text-rose-500" />
            <span>AI Bug Reports Inbox</span>
          </h1>
          <p className="text-slate-400">
            Evaluative interface isolating anomaly footprints extracted from Tenant Support scopes.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-800">
        {[
          { id: 'draft_generated', label: 'Triage Pending', icon: Sparkles },
          { id: 'approved', label: 'Confirmed Diagnostics', icon: ShieldCheck },
          { id: 'all', label: 'Global Backlog', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-rose-500 text-rose-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-16 text-center">
          <Bug className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Pipeline Nominal</h3>
          <p className="text-slate-500">No anomalous traces currently awaiting operational review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bug) => (
            <div 
              key={bug.id}
              onClick={() => navigate(`/app/internal/recording-center/bug-reports/${bug.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-xl p-5 cursor-pointer transition-colors group flex flex-col relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityStyle(bug.severity)}`}>
                  {bug.severity}
                </span>
                <span className="text-slate-500 text-xs flex items-center bg-slate-800 px-2 py-1 rounded">
                   <Sparkles className="w-3 h-3 text-rose-400 mr-1" />
                   {bug.confidence_score || 'N/A'}% CF
                </span>
              </div>
              
              <h3 className="text-white font-medium mb-2 group-hover:text-rose-400 transition-colors line-clamp-2">
                {bug.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {bug.summary}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                 <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 capitalize">
                   {bug.status.replace(/_/g, ' ')}
                 </span>
                 <span className="font-mono text-slate-400">
                   {new Date(bug.created_at).toLocaleDateString()}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
