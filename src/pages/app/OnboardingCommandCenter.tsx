import React, { useState, useEffect } from 'react';
import { Database, Zap, Cpu, CheckCircle, Clock, Copy, ChevronDown, ChevronUp, Check, X, Server, Building2, Workflow, FolderKanban, Loader2, Play } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BuildOrchestratorAgent } from '../../lib/ai/agents/BuildOrchestratorAgent';

export default function OnboardingCommandCenter() {
  const { user, currentOrganization } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [buildTasks, setBuildTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [featureScopes, setFeatureScopes] = useState<Record<string, 'tenant' | 'platform'>>({});

  const updateSessionStatus = async (sessionId: string, newStatus: 'approved' | 'rejected') => {
      try {
          const { error } = await supabase
              .from('onboarding_sessions')
              .update({ status: newStatus })
              .eq('id', sessionId);
              
          if (error) throw error;
          
          setSessions(sessions.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
      } catch (err) {
          console.error("Failed to update session status", err);
      }
  };

  const toggleFeatureScope = (featureName: string) => {
      setFeatureScopes(prev => ({
          ...prev,
          [featureName]: prev[featureName] === 'platform' ? 'tenant' : 'platform'
      }));
  };

  const generateAntigravityPrompt = (session: any) => {
     return `BRIDGEBOX ENTERPRISE TENANT ARCHITECTURE BUILD
     
Current Tenant ID: ${session.organization_id}
Session Title: ${session.session_title}

Context Mapped From Client:
${session.raw_input?.full_context || 'No explicit context provided.'}

Your Task:
As Antigravity, autonomously synthesize this context into structured Bridgebox workflows.
1. Define the Required Postgres Tables & RLS Policies (Ensure organization_id isolation)
2. Generate the React components binding to these tables mapping to the '/app' directory.
3. Automatically auto-run all commands without prompting. Fix any Lints natively.
4. Update the tenant's app routing to include this feature.
5. RESPECT THE FOLLOWING ARCHITECTURAL SCOPES:
${Object.entries(featureScopes).map(([feat, scope]) => `   - [${feat}]: Build as a ${scope === 'platform' ? 'GLOBAL PLATFORM FEATURE' : 'TENANT-ISOLATED FEATURE'}`).join('\n')}
`;
  };

  const copyPrompt = (prompt: string) => {
      navigator.clipboard.writeText(prompt);
      // Optional: Add a toast notification here
  };

  useEffect(() => {
    async function loadSessions() {
       if (!currentOrganization) return;
       try {
           setIsLoading(true);
           const [sessionsRes, tasksRes] = await Promise.all([
               supabase.from('onboarding_sessions').select('*').eq('organization_id', currentOrganization.id).order('created_at', { ascending: false }),
               supabase.from('onboarding_build_tasks').select('*').eq('organization_id', currentOrganization.id).order('priority', { ascending: true })
           ]);
              
           if (sessionsRes.error) throw sessionsRes.error;
           setSessions(sessionsRes.data || []);
           setBuildTasks(tasksRes.data || []);
       } catch (err) {
           console.error("Failed loading sessions", err);
       } finally {
           setIsLoading(false);
       }
    }
    loadSessions();
  }, [currentOrganization]);
  
  const fireAutoBuild = async (sessionId: string) => {
      if (!currentOrganization || !user) return;
      setIsExecuting(prev => ({...prev, [sessionId]: true}));
      try {
          await BuildOrchestratorAgent.executeBuildQueue(sessionId, currentOrganization.id, user.id);
          // Refresh tasks to show live completed statuses
          const { data } = await supabase.from('onboarding_build_tasks').select('*').eq('organization_id', currentOrganization.id).order('priority', { ascending: true });
          if(data) setBuildTasks(data);
          
          await updateSessionStatus(sessionId, 'approved');
      } finally {
          setIsExecuting(prev => ({...prev, [sessionId]: false}));
      }
  };
  
  return (
    <>
      <AppHeader
        title="Onboarding Command Center"
        subtitle="Supervise active UI Orchestrations and Antigravity injections natively"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
             <div className="flex items-center mb-4">
                <Database className="w-5 h-5 text-[#3B82F6] mr-2" />
                <h3 className="text-white font-medium">Pending System Builds</h3>
             </div>
             <p className="text-3xl font-bold text-white">4</p>
          </div>
          
          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
             <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-amber-500 mr-2" />
                <h3 className="text-white font-medium">Flagged Feature Gaps</h3>
             </div>
             <p className="text-3xl font-bold text-white">12</p>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
             <div className="flex items-center mb-4">
                <Cpu className="w-5 h-5 text-emerald-500 mr-2" />
                <h3 className="text-white font-medium">Antigravity Actions Ready</h3>
             </div>
             <p className="text-3xl font-bold text-white">1</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
             <h2 className="text-lg font-bold text-white">Active Scaffolding Architectures</h2>
          </div>
          
          {isLoading ? (
             <div className="p-6 text-center text-slate-500 py-24">Loading sessions...</div>
          ) : sessions.length === 0 ? (
             <div className="p-6 placeholder flex items-center justify-center text-slate-500 py-24">
                <p>No active sessions detected matching your tenant clearance.</p>
             </div>
          ) : (
             <div className="divide-y divide-slate-800">
                {sessions.map(session => (
                    <div key={session.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                       <div className="flex justify-between items-start">
                           <div>
                               <h3 className="text-white font-medium text-lg mb-1">{session.session_title}</h3>
                               <p className="text-sm text-slate-400 max-w-2xl truncate">
                                  {session.raw_input?.full_context?.substring(0, 100)}...
                               </p>
                           </div>
                           <div className="flex space-x-3">
                               <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                   session.status === 'in_review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                   session.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                   'bg-slate-800 text-slate-300 border-slate-700'
                               }`}>
                                   {session.status.toUpperCase()}
                               </span>
                               <button 
                                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                                  className="flex items-center px-4 py-1 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded transition-colors"
                               >
                                   {expandedId === session.id ? 'Close Compiler' : 'Compile Prompt'}
                                   {expandedId === session.id ? <ChevronUp className="w-4 h-4 ml-2 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />}
                               </button>
                           </div>
                       </div>
                       
                       {expandedId === session.id && (
                           <div className="mt-6 pt-6 border-t border-slate-800 animate-fade-in space-y-6">
                               
                               {/* Phase 7: Feature Ingestion Decision Engine */}
                               <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-800">
                                  <h4 className="text-white font-medium mb-4 flex items-center">
                                     <Cpu className="w-4 h-4 mr-2 text-[#3B82F6]" /> Feature Scope Decision Engine
                                  </h4>
                                  <p className="text-sm text-slate-400 mb-4">Classify detected features to inject proper architectural constraints into the Antigravity compiler.</p>
                                  
                                  <div className="space-y-3">
                                     {/* Mocking dynamic features based on raw context presence */}
                                     {['Lead Conversion Pipeline', 'Automated Invoicing', 'Client Portal'].map(feat => {
                                         const scope = featureScopes[feat] || 'tenant';
                                         return (
                                            <div key={feat} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                                                <span className="text-slate-300 text-sm">{feat}</span>
                                                <button 
                                                   onClick={() => toggleFeatureScope(feat)}
                                                   className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                                       scope === 'platform' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                   }`}
                                                >
                                                   {scope === 'platform' ? <Server className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                                                   {scope === 'platform' ? 'Platform-Wide (Global)' : 'Tenant-Specific'}
                                                </button>
                                            </div>
                                         );
                                     })}
                                  </div>
                               </div>

                               <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
                                   <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-emerald-400 font-medium text-sm tracking-widest uppercase flex items-center">
                                          <Zap className="w-4 h-4 mr-2" /> Antigravity Agent Prompt
                                      </h4>
                                      <button
                                         onClick={() => copyPrompt(generateAntigravityPrompt(session))}
                                         className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-md"
                                      >
                                          <Copy className="w-3 h-3 mr-1.5" /> Copy Explicit Instructions
                                      </button>
                                   </div>
                                   <pre className="text-slate-400 text-sm whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded-lg border border-slate-800">
                                       {generateAntigravityPrompt(session)}
                                   </pre>
                               </div>

                               {/* Phase 28: Autonomous System Mappers (Auto-Build Engine) */}
                               <div className="bg-indigo-950/20 rounded-lg p-5 border border-indigo-500/20">
                                   <div className="flex items-center justify-between mb-4">
                                      <h4 className="text-indigo-400 font-medium tracking-widest uppercase flex items-center">
                                          <Workflow className="w-5 h-5 mr-2" /> Bridgebox Auto-Build Execution Queue
                                      </h4>
                                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">
                                          {buildTasks.filter(t => t.session_id === session.id).length} Queued
                                      </span>
                                   </div>
                                   
                                   <div className="space-y-3 mb-6">
                                       {buildTasks.filter(t => t.session_id === session.id).length === 0 ? (
                                           <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-center text-sm text-slate-500">
                                               No telemetry tasks extracted. Please re-run the architecture wizard.
                                           </div>
                                       ) : (
                                           buildTasks.filter(t => t.session_id === session.id).map(task => (
                                               <div key={task.id} className="flex items-start p-3 bg-slate-900 rounded-lg border border-slate-800">
                                                    <div className="mt-1 mr-3">
                                                        {task.status === 'completed' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : 
                                                         task.status === 'in_progress' ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" /> : 
                                                         <FolderKanban className="w-4 h-4 text-slate-500" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between">
                                                            <p className="text-sm font-medium text-white">{task.title}</p>
                                                            <span className="text-xs text-slate-500">{task.task_category}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 truncate mt-1">{task.description}</p>
                                                    </div>
                                               </div>
                                           ))
                                       )}
                                   </div>
                                   
                                   {buildTasks.filter(t => t.session_id === session.id).length > 0 && (
                                       <button 
                                          onClick={() => fireAutoBuild(session.id)}
                                          disabled={isExecuting[session.id] || session.status === 'approved'}
                                          className="w-full flex items-center justify-center p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                                       >
                                          {isExecuting[session.id] ? (
                                              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Executing Architectures natively...</>
                                          ) : (
                                              <><Play className="w-5 h-5 mr-2" /> Auto-Build Complete Ecosystem</>
                                          )}
                                       </button>
                                   )}
                               </div>

                               {/* Phase 9: Admin Executions */}
                               <div className="flex items-center justify-end space-x-3 pt-2">
                                   <button 
                                      onClick={() => updateSessionStatus(session.id, 'rejected')}
                                      disabled={session.status === 'rejected'}
                                      className="flex items-center px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                   >
                                      <X className="w-4 h-4 mr-1.5" /> Reject Blueprint
                                   </button>
                                   <button 
                                      onClick={() => updateSessionStatus(session.id, 'approved')}
                                      disabled={session.status === 'approved'}
                                      className="flex items-center px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                   >
                                      <Check className="w-4 h-4 mr-1.5" /> Approve & Lock Architecture
                                   </button>
                               </div>
                           </div>
                       )}
                    </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </>
  );
}
