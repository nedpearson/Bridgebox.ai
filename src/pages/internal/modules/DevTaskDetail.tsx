import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { devTasksAiApi, InternalDevTask } from '../../../lib/devTasksAi';
import { devQaAiApi } from '../../../lib/devQaAi';
import { Loader2, ArrowLeft, Terminal, ShieldAlert, BadgeCheck, Copy, Bug, TestTube2, Info, XCircle, RefreshCw } from 'lucide-react';

export default function DevTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<InternalDevTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [promptContent, setPromptContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) loadTask(id);
  }, [id]);

  const loadTask = async (taskId: string) => {
    try {
      setLoading(true);
      const data = await devTasksAiApi.getTaskById(taskId);
      setTask(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!task) return;
    try {
      setLoading(true);
      const updated = await devTasksAiApi.updateTask(task.id, { 
        status: 'approved', 
        approved_for_build: true 
      });
      setTask(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!task) return;
    if (!window.confirm("Reject this AI-generated task? It will be archived.")) return;
    try {
      setLoading(true);
      const updated = await devTasksAiApi.updateTask(task.id, { 
        status: 'rejected', 
        approved_for_build: false 
      });
      setTask(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    alert("Initiating secure re-extraction of AI Task vectors based on Origin Linkage. This operation typically takes 15 seconds.");
  };

  const handleGenerateBugReport = async () => {
    if (!task) return;
    try {
      setIsProcessing(true);
      const bug = await devQaAiApi.generateBugReportFromSource(task, 'internal_dev_task');
      navigate(`/app/internal/recording-center/bug-reports/${bug.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQaTest = async () => {
    if (!task) return;
    try {
      setIsProcessing(true);
      const qa = await devQaAiApi.generateQaTestCaseFromSource(task, 'internal_dev_task');
      navigate(`/app/internal/recording-center/qa-test-cases/${qa.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPrompt = async () => {
    if (!task) return;
    try {
      setExporting(true);
      const prompt = await devTasksAiApi.exportToAntigravityPrompt(task.id);
      setPromptContent(prompt);
      await loadTask(task.id); // Refresh status to catch 'sent_to_antigravity'
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const copyPrompt = () => {
    if (promptContent) {
      navigator.clipboard.writeText(promptContent);
      alert('Antigravity Builder Prompt copied to clipboard!');
    }
  };

  if (loading && !task) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-white bg-slate-900 rounded-lg text-center">
        Dev Task not found or securely purged.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button 
            onClick={() => navigate('/app/internal/recording-center/dev-tasks')}
            className="p-2 border border-slate-700 bg-slate-800 rounded-lg hover:bg-slate-700 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider">
                {task.product_area || 'Global Workspace'}
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider ${
                task.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                task.status === 'sent_to_antigravity' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                'bg-slate-800 text-slate-400'
              }`}>
                {task.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-2">{task.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{task.summary}</p>
          </div>
        </div>

        {/* Global Action Terminal */}
        <div className="flex space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          {task.status === 'draft_generated' || task.status === 'under_review' ? (
             <div className="flex space-x-2">
               <button
                 onClick={handleReject}
                 className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700"
               >
                 <XCircle className="w-4 h-4 mr-2" />
                 Reject
               </button>
               <button
                 onClick={handleRegenerate}
                 className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors font-medium text-sm border border-slate-700"
               >
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Regenerate
               </button>
               <button
                 onClick={handleApprove}
                 className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm"
               >
                 <BadgeCheck className="w-4 h-4 mr-2" />
                 Approve Implementation
               </button>
             </div>
          ) : (
             <div className="flex space-x-2">
               <button
                 onClick={handleExportPrompt}
                 disabled={exporting}
                 className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
               >
                 {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Terminal className="w-4 h-4 mr-2" /> }
                 {promptContent ? 'Regenerate Prompt' : 'Export Antigravity Prompt'}
               </button>
               <div className="w-px h-6 bg-slate-800 mx-2 self-center"></div>
               <button
                 onClick={handleGenerateBugReport}
                 disabled={isProcessing}
                 className="flex items-center px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg transition-colors font-medium text-sm border border-rose-600/30"
               >
                 {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bug className="w-4 h-4 mr-2" />}
                 AI Bug Trace
               </button>
               <button
                 onClick={handleGenerateQaTest}
                 disabled={isProcessing}
                 className="flex items-center px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-colors font-medium text-sm border border-indigo-600/30"
               >
                 {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube2 className="w-4 h-4 mr-2" />}
                 AI QA Pack
               </button>
             </div>
          )}
        </div>
      </div>

      {/* Prompt Output Terminal (If Exported) */}
      {promptContent && (
        <div className="bg-[#0D1117] border border-fuchsia-500/50 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center text-fuchsia-400 font-mono text-xs">
              <Terminal className="w-4 h-4 mr-2" />
              antigravity-build-prompt.md
            </div>
            <button 
              onClick={copyPrompt}
              className="p-1.5 hover:bg-fuchsia-500/20 rounded text-fuchsia-300 transition-colors tooltip"
              title="Copy payload to Clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
            {promptContent}
          </div>
        </div>
      )}

      {/* Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Vector Stack */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center text-rose-400 mb-4 font-medium">
              <Bug className="w-5 h-5 mr-2" />
              Problem Definition Loop
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Problem Statement</span>
                <p className="text-slate-300 p-3 bg-slate-800 rounded border border-slate-700">{task.problem_statement || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Observed</span>
                  <p className="text-slate-300 p-3 bg-slate-800 rounded border border-slate-700">{task.observed_behavior || 'N/A'}</p>
                </div>
                <div>
                  <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Expected</span>
                  <p className="text-green-500 p-3 bg-green-500/10 rounded border border-green-500/20">{task.expected_behavior || 'N/A'}</p>
                </div>
              </div>
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Root Cause Hypothesis (AI Assessment)</span>
                <p className="text-amber-400 p-3 bg-amber-500/10 rounded border border-amber-500/20 italic">{task.root_cause_hypothesis || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center text-indigo-400 mb-4 font-medium">
              <TestTube2 className="w-5 h-5 mr-2" />
              Proposed CI/CD Checkpoints
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Acceptance Criteria</span>
                <pre className="text-slate-300 font-sans p-3 bg-slate-800 rounded border border-slate-700 whitespace-pre-wrap">{task.proposed_acceptance_criteria || 'N/A'}</pre>
              </div>
              <div>
                <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Implementation Scope Vectors</span>
                <pre className="text-slate-300 font-sans p-3 bg-slate-800 rounded border border-slate-700 whitespace-pre-wrap">{task.proposed_implementation_notes || 'N/A'}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Info / Audit Sidecar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <div className="flex items-center text-slate-300 mb-4 font-medium">
                <Info className="w-5 h-5 mr-2 text-blue-400" />
                Operational Telemetry
             </div>
             
             <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Source Type</span>
                  <span className="text-white font-mono">{task.source_type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Source Linkage ID</span>
                  <span className="text-blue-400 font-mono text-xs">{task.linked_support_ticket_id || task.source_id.slice(0,8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">Priority</span>
                  <span className="text-orange-400 uppercase tracking-wider text-xs font-bold">{task.priority}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-500">AI Triage CF</span>
                  <span className="text-fuchsia-400 font-mono">{task.confidence_score}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500">Generation Timestamp</span>
                  <span className="text-slate-300">{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
          
          {task.similar_task_refs && task.similar_task_refs.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">
              <div className="flex items-center text-orange-400 mb-2 font-medium">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Duplicate Candidates
              </div>
              <p className="text-xs text-orange-300">
                The generative pipeline isolated {task.similar_task_refs.length} identical signatures querying similar problem clusters within <strong>{task.product_area}</strong>. Proceed cautiously before merging.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
