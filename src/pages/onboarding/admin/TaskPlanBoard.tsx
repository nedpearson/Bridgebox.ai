import React, { useState, useEffect } from 'react';
import { Columns, List, CheckSquare, GitCommit, Settings, Layers, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface BuildTask {
    id: string;
    title: string;
    description: string;
    task_category: string;
    status: string;
}

export default function TaskPlanBoard() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
    const [tasks, setTasks] = useState<BuildTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTasks() {
            if (!sessionId) return;
            const { data } = await supabase
                .from('onboarding_build_tasks')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });
            
            if (data) {
                setTasks(data);
            }
            setLoading(false);
        }
        loadTasks();

        // Subscribe to real-time status updates from the Orchestrator
        const channel = supabase.channel('build_tasks_updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'onboarding_build_tasks',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                setTasks(current => current.map(t => t.id === payload.new.id ? { ...t, status: payload.new.status } : t));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    return (
        <div className="h-full flex flex-col max-w-7xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Implementation Tasks</h2>
                    <p className="text-slate-400">Manage the AI-generated structural tasks required to finalize the onboarding scope.</p>
                </div>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Columns className="w-4 h-4 mr-2" /> Kanban
                    </button>
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <List className="w-4 h-4 mr-2" /> Table
                    </button>
                </div>
            </div>

            {/* Dynamic Realtime Kanban Rendering */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        <p>No actionable execution constraints detected. AI is waiting for directives.</p>
                    </div>
                ) : (
                    <div className="flex space-x-6 min-w-max h-full">
                        {/* Column: Pending */}
                        <div className="w-80 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-white font-medium text-sm uppercase tracking-wider">Queue: Pending</h3>
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">{tasks.filter(t => t.status === 'pending').length}</span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {tasks.filter(t => t.status === 'pending').map(task => (
                                    <div key={task.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                                        <div className="flex justify-between mb-3">
                                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold tracking-wider rounded border border-amber-500/20">
                                                <Layers className="w-3 h-3 inline mr-1"/> {task.task_category.replace('_', ' ')}
                                            </span>
                                            <span className="w-2 h-2 rounded-full bg-slate-600 my-auto" />
                                        </div>
                                        <h4 className="text-white text-sm font-medium mb-1 truncate">{task.title}</h4>
                                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column: Executing */}
                        <div className="w-80 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-white font-medium text-sm uppercase tracking-wider">Queue: Executing</h3>
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">{tasks.filter(t => t.status === 'in_progress').length}</span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {tasks.filter(t => t.status === 'in_progress').map(task => (
                                    <div key={task.id} className="bg-slate-950 p-4 rounded-xl border border-indigo-500/50 transition-colors cursor-pointer group shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                        <div className="flex justify-between mb-3">
                                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold tracking-wider rounded border border-indigo-500/20">
                                                <Loader2 className="w-3 h-3 inline mr-1 animate-spin"/> Executing Natively
                                            </span>
                                        </div>
                                        <h4 className="text-white text-sm font-medium mb-1 truncate">{task.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column: Completed */}
                        <div className="w-80 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="text-white font-medium text-sm uppercase tracking-wider">Queue: Deployed</h3>
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">{tasks.filter(t => t.status === 'completed').length}</span>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {tasks.filter(t => t.status === 'completed').map(task => (
                                    <div key={task.id} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 transition-colors cursor-pointer group">
                                        <div className="flex justify-between mb-3">
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-500/20">
                                                <CheckSquare className="w-3 h-3 inline mr-1"/> Verified
                                            </span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 my-auto shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        </div>
                                        <h4 className="text-white text-sm font-medium mb-1 truncate line-through opacity-70">{task.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
