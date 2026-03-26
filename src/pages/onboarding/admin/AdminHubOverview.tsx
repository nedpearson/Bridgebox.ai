import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Zap, Cpu, CheckCircle } from 'lucide-react';

export default function AdminHubOverview() {
    const { session } = useOutletContext<any>() || {}; // Fallback for pure rendering

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
             <div className="mb-6">
                 <h2 className="text-2xl font-bold text-white mb-2">{session?.session_title || 'Executive Overview'}</h2>
                 <p className="text-slate-400">Review the autonomous AI system ingestion for the active client onboarding profile natively.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                     <div className="flex items-center mb-4">
                         <Database className="w-5 h-5 text-indigo-400 mr-3" />
                         <h3 className="text-white font-medium text-sm tracking-wide">Expected Table Maps</h3>
                     </div>
                     <p className="text-3xl font-bold text-white">4</p>
                 </div>
                 
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                     <div className="flex items-center mb-4">
                         <Zap className="w-5 h-5 text-amber-500 mr-3" />
                         <h3 className="text-white font-medium text-sm tracking-wide">Automations</h3>
                     </div>
                     <p className="text-3xl font-bold text-white">12</p>
                 </div>

                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                     <div className="flex items-center mb-4">
                         <Cpu className="w-5 h-5 text-emerald-500 mr-3" />
                         <h3 className="text-white font-medium text-sm tracking-wide">Integration Bridges</h3>
                     </div>
                     <p className="text-3xl font-bold text-white">2</p>
                 </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-800">
                     <h3 className="text-white font-medium">Implementation Phases</h3>
                 </div>
                 <div className="p-6 space-y-4">
                     <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                         <div className="flex items-center">
                             <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                             <div>
                                 <p className="text-white text-sm font-medium">Phase 1: Relational Core Scaffold</p>
                                 <p className="text-xs text-slate-400">Generates pure PostgREST definitions enforcing Row Level Security.</p>
                             </div>
                         </div>
                         <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">Ready</span>
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                         <div className="flex items-center">
                             <div className="w-5 h-5 rounded-full border-2 border-slate-700 mr-3" />
                             <div>
                                 <p className="text-white text-sm font-medium">Phase 2: React Component Mappings</p>
                                 <p className="text-xs text-slate-400">Engineers the Frontend logic executing the CRUD architecture.</p>
                             </div>
                         </div>
                         <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">Pending Phase 1</span>
                     </div>
                 </div>
             </div>
        </div>
    );
}
