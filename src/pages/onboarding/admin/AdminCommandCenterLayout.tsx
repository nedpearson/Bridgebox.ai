import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { Settings, Workflow, CheckSquare, Zap, LayoutTemplate, Cpu, Terminal, Shield, Activity, Search, ShieldCheck, Loader2, CheckCircle2, Network } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { BuildOrchestratorAgent } from '../../../lib/ai/agents/BuildOrchestratorAgent';
import { supabase } from '../../../lib/supabase';

export default function AdminCommandCenterLayout() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { currentOrganization, user } = useAuth();
    const [executing, setExecuting] = useState(false);
    const [executionComplete, setExecutionComplete] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);

    useEffect(() => {
        if (!sessionId) return;
        supabase.from('bb_onboarding_sessions').select('*').eq('id', sessionId).single().then(({ data }) => setSessionData(data));
    }, [sessionId]);

    const handleExecuteBuild = async () => {
        if (!sessionId || !currentOrganization || !user || executing) return;
        
        try {
            setExecuting(true);
            await BuildOrchestratorAgent.executeBuildQueue(sessionId, currentOrganization.id, user.id);
            setExecutionComplete(true);
        } catch (e) {
            console.error("Execution failed", e);
        } finally {
            setExecuting(false);
        }
    };
    
    const adminTabs = [
        { path: '', label: 'Overview', icon: <Search className="w-4 h-4" />, exact: true },
        { path: 'workflows', label: 'Workflows', icon: <Workflow className="w-4 h-4" /> },
        { path: 'tasks', label: 'Implementation Tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { path: 'integrations', label: 'Integrations', icon: <Zap className="w-4 h-4" /> },
        { path: 'webhooks', label: 'Data Normalizer', icon: <Network className="w-4 h-4" /> },
        { path: 'dashboards', label: 'Dashboard Design', icon: <LayoutTemplate className="w-4 h-4" /> },
        { path: 'features', label: 'Feature Ingestion', icon: <Cpu className="w-4 h-4" /> },
        { path: 'prompts', label: 'Antigravity Prompts', icon: <Terminal className="w-4 h-4" /> },
        { path: 'progress', label: 'Progress Roadmap', icon: <Activity className="w-4 h-4" /> }
    ];

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
            {/* Left Rail: Admin Navigation */}
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900 lg:overflow-y-auto shrink-0 flex flex-col pt-4 lg:pt-6">
                <div className="px-6 mb-6">
                    <h3 className="text-white font-semibold text-sm flex items-center mb-1.5">
                        <Settings className="w-4 h-4 mr-2 text-indigo-400" /> Executive Hub
                    </h3>
                    <p className="text-xs text-indigo-300/80 font-medium truncate" title={sessionData?.session_title || ''}>
                        {sessionData?.session_title || 'Loading Context...'}
                    </p>
                </div>
                
                <nav className="flex overflow-x-auto lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 px-4 lg:px-3 pb-4 lg:pb-0 hide-scrollbar mt-2 lg:mt-0">
                    {adminTabs.map(tab => (
                        <NavLink
                            key={tab.path}
                            to={`./${tab.path}`}
                            end={tab.exact}
                            className={({ isActive }) => `
                                flex items-center whitespace-nowrap px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${isActive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}
                            `}
                        >
                            <span className="mr-3">{tab.icon}</span> {tab.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Main Center Area: React Router Outlet */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950">
                <Outlet context={{ session: sessionData }} />
            </div>

            {/* Right Rail: Executions & Build Scope */}
            <div className="w-80 border-l border-slate-800 bg-slate-900/50 overflow-y-auto shrink-0 p-6 hidden xl:block">
                <h3 className="text-white font-semibold text-sm mb-6 flex items-center">
                   <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Build Orchestration
                </h3>

                <div className="space-y-4">
                     <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                         <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Implementation Readiness</h4>
                         <div className="flex items-end mb-2">
                             <span className="text-3xl font-bold text-white leading-none">85</span>
                             <span className="text-sm font-medium text-slate-400 ml-1 leading-relaxed">%</span>
                         </div>
                         <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                             <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                         </div>
                     </div>

                     <button 
                         onClick={handleExecuteBuild}
                         disabled={executing || executionComplete}
                         className={`w-full py-2.5 text-white flex justify-center items-center text-sm font-medium rounded-lg transition-colors border ${
                             executionComplete 
                                 ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500' 
                                 : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500'
                         } ${executing ? 'opacity-75 cursor-not-allowed' : ''}`}
                     >
                         {executing ? (
                             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing Build...</>
                         ) : executionComplete ? (
                             <><CheckCircle2 className="w-4 h-4 mr-2" /> Ecosystem Deployed</>
                         ) : (
                             'Approve Build Scope'
                         )}
                     </button>
                     
                     <div className="grid grid-cols-2 gap-2 mt-2">
                        <button className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 text-center">
                            Queue Prompts
                        </button>
                        <button className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700 text-center">
                            Mark Ready
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
}
