import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheck, Map, Boxes, Database, Eye, Edit2 } from 'lucide-react';

export default function BlueprintReviewWorkspace() {
    const { session } = useOutletContext<any>();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

    const openSourceTraceDrawer = (entityId: string) => {
        setSelectedEntityId(entityId);
        setDrawerOpen(true);
    };

    return (
        <div className="h-full relative overflow-hidden bg-slate-950 flex">
            {/* Main Center Payload - AI Blueprint Formatted */}
            <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${drawerOpen ? 'lg:pr-96' : ''}`}>
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    <div className="mb-8">
                        <h2 className="flex items-center text-2xl font-bold text-white mb-2">
                           <ShieldCheck className="w-7 h-7 text-emerald-500 mr-3" />
                           Platform Implementation Blueprint
                        </h2>
                        <p className="text-slate-400">Review the AI-generated structured outputs before mapping them into the final Bridgebox architecture constraints.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Card 1 */}
                         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group">
                             <h4 className="flex items-center text-white font-medium mb-3">
                                 <Database className="w-5 h-5 mr-2 text-indigo-400" /> Detected Structural Entities
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                 <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg">Retainers</span>
                                 <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg">Opposing Counsel</span>
                                 <span className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg">Billable Rates</span>
                             </div>
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                 <button onClick={() => openSourceTraceDrawer('entities')} className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md">
                                     <Eye className="w-4 h-4" />
                                 </button>
                                 <button className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-md">
                                     <Edit2 className="w-4 h-4" />
                                 </button>
                             </div>
                         </div>

                         {/* Card 2 */}
                         <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative group">
                             <h4 className="flex items-center text-white font-medium mb-3">
                                 <Map className="w-5 h-5 mr-2 text-indigo-400" /> Operational Workflows
                             </h4>
                             <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                 3 Core multi-stage workflows detected mapping to standard lead conversion and case staging pipelines.
                             </p>
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                 <button onClick={() => openSourceTraceDrawer('workflows')} className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md">
                                     <Eye className="w-4 h-4" />
                                 </button>
                             </div>
                         </div>
                    </div>

                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl relative group">
                         <h4 className="flex items-center text-amber-500 font-medium mb-3">
                             <Boxes className="w-5 h-5 mr-2" /> Risks / Missing Information
                         </h4>
                         <p className="text-sm text-amber-400/80 leading-relaxed">
                             We could not explicitly identify the billing software you use for processing physical credit cards. Without this integration, invoices may require manual reconciliation.
                         </p>
                    </div>

                </div>
            </div>

            {/* Source Trace Drawer (Right Overlay) */}
            <div className={`absolute top-0 right-0 bottom-0 w-80 lg:w-96 bg-slate-900 border-l border-white/5 transform transition-transform duration-300 z-30 shadow-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950">
                        <h3 className="text-white font-semibold flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-indigo-400" /> Source Traceability
                        </h3>
                        <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">AI Context Used</h4>
                             {selectedEntityId === 'entities' && (
                                 <p className="text-sm text-slate-300 leading-relaxed font-mono">
                                     "...We handle high-net worth divorce cases, which usually involve long term <span className="text-indigo-400 bg-indigo-500/10 font-bold px-1 rounded">retainers</span> and complex <span className="text-indigo-400 bg-indigo-500/10 font-bold px-1 rounded">billable rates</span> split between opposing counsel..."
                                 </p>
                             )}
                             {selectedEntityId === 'workflows' && (
                                 <p className="text-sm text-slate-300 leading-relaxed font-mono">
                                     "...The receptionist books the <span className="text-emerald-400 bg-emerald-500/10 font-bold px-1 rounded">initial consultation</span>, and then the attorney has to manually move them into a active case state and send the onboarding forms..."
                                 </p>
                             )}
                             <p className="text-xs text-slate-500 italic mt-4">Source: Client Intake Workspace (Tab 1)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
