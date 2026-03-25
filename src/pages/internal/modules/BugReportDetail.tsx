import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devQaAiApi, InternalBugReport } from '../../../lib/devQaAi';
import { Loader2, ArrowLeft, Bug, ShieldAlert, BadgeCheck, XCircle, Info, Activity } from 'lucide-react';

export default function BugReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bug, setBug] = useState<InternalBugReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (bugId: string) => {
    try {
      setLoading(true);
      const data = await devQaAiApi.getBugReport(bugId);
      setBug(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusStr: any) => {
    if (!bug) return;
    try {
      setLoading(true);
      const updated = await devQaAiApi.updateBugReport(bug.id, { 
        status: statusStr,
        approved_for_build: statusStr === 'approved' || statusStr === 'confirmed'
      });
      setBug(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bug) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!bug) return <div className="p-8 text-white bg-slate-900 rounded-lg text-center">Report isolated or deleted.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button 
            onClick={() => navigate('/app/internal/recording-center/bug-reports')}
            className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider">
                {bug.product_area || 'Global Workspace'}
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider ${
                bug.status === 'confirmed' || bug.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                bug.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {bug.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">{bug.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{bug.summary}</p>
          </div>
        </div>

        {/* Global Action Terminal */}
        <div className="flex space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
           <button
             onClick={() => handleUpdateStatus('rejected')}
             className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700"
           >
             <XCircle className="w-4 h-4 mr-2" />
             Reject Trace
           </button>
           <button
             onClick={() => handleUpdateStatus('confirmed')}
             className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors font-medium text-sm"
           >
             <BadgeCheck className="w-4 h-4 mr-2" />
             Confirm Bug Trace
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Vector Stack */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center text-rose-400 mb-4 font-medium">
              <Activity className="w-5 h-5 mr-2" />
              Reproduction Traceability
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Observed Logic Fault</span>
                  <p className="text-slate-300 p-3 bg-slate-800 rounded border border-slate-700">{bug.observed_behavior || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Expected Architecture</span>
                  <p className="text-green-500 p-3 bg-green-500/10 rounded border border-green-500/20">{bug.expected_behavior || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Action Flow / Reproduction Steps</span>
                <pre className="text-slate-300 font-sans p-3 bg-slate-800 rounded border border-slate-700 whitespace-pre-wrap">{bug.reproduction_steps || 'N/A'}</pre>
              </div>

              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Determined Root Cause Hypothesis</span>
                <p className="text-amber-400 p-3 bg-amber-500/10 rounded border border-amber-500/20 italic">{bug.root_cause_hypothesis || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info / Audit Sidecar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <div className="flex items-center text-slate-300 mb-4 font-medium">
                <Info className="w-5 h-5 mr-2 text-rose-400" />
                Severity Vectors
             </div>
             
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Source Map Link</span>
                  <span className="text-blue-400 font-mono text-xs cursor-pointer hover:underline">{bug.linked_support_ticket_id?.slice(0,8) || bug.source_id.slice(0,8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Determined Priority</span>
                  <span className="text-orange-400 uppercase tracking-wider text-xs font-bold">{bug.priority}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Determined Severity</span>
                  <span className="text-red-400 uppercase tracking-wider text-xs font-bold">{bug.severity}</span>
                </div>
             </div>
          </div>
          
          {bug.similar_bug_refs && bug.similar_bug_refs.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
              <div className="flex items-center text-orange-400 mb-2 font-medium">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Cluster Detection
              </div>
              <p className="text-xs text-orange-300">
                The generative pipeline isolated <strong>{bug.similar_bug_refs.length} identical signatures</strong>. Potential massive scale regression in {bug.product_area}.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
