import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mic, Square, Play, Upload, MessageSquare, Map, Zap, GitCommit, GitPullRequest, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WorkflowCaptureWorkspace() {
    const { session } = useOutletContext<any>();
    const [isRecording, setIsRecording] = useState(false);
    const [hasTranscript, setHasTranscript] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    const handleRecordToggle = () => {
        if (!isRecording) {
            setIsRecording(true);
            setHasTranscript(false);
        } else {
            setIsRecording(false);
            setTranscript("Okay, so when a new client calls in, the receptionist creates a lead in the system. Then the attorney reviews it and either approves or rejects. If approved, we send a retainer agreement via email. Once signed, we automatically generate a case file and schedule the initial deposition.");
            setHasTranscript(true);
        }
    };

    const handleExtract = async () => {
        setIsExtracting(true);
        // Simulate background AI extraction
        await new Promise(r => setTimeout(r, 1500));
        setIsExtracting(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
            {/* Column 1: Voice Dictation & Transcript (Left) */}
            <div className="w-full lg:w-[350px] p-6 border-r border-white/5 overflow-y-auto bg-slate-900/40 shrink-0">
                <h2 className="text-white font-semibold text-lg mb-6 flex items-center">
                    <Mic className="w-5 h-5 mr-2 text-indigo-400" />
                    Workflow Dictation
                </h2>

                <div className="space-y-6">
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-4">
                        <button
                            onClick={handleRecordToggle}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                        >
                            {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <p className="text-sm font-medium text-slate-300">
                            {isRecording ? 'Listening...' : 'Tap to Record Workflow'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-xs font-semibold text-slate-500 tracking-wider">OR</span>
                        <div className="h-px bg-slate-800 flex-1" />
                    </div>

                    <button className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg border border-slate-800 transition-colors">
                        <Upload className="w-4 h-4 mr-2" /> Upload Audio File
                    </button>

                    {hasTranscript && (
                        <div className="pt-6 border-t border-slate-800 animate-fade-in">
                            <h3 className="text-sm font-medium text-white flex items-center mb-3">
                                <MessageSquare className="w-4 h-4 mr-2 text-indigo-400" />
                                Live Transcript
                            </h3>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                rows={8}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500"
                            />
                            
                            <button
                                onClick={handleExtract}
                                disabled={isExtracting}
                                className="w-full mt-4 flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {isExtracting ? <div className="mr-2"><LoadingSpinner size="sm" /></div> : <Map className="w-4 h-4 mr-2" />}
                                {isExtracting ? 'Extracting Logic...' : 'Extract Operational Map'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Column 2: Extracted Workflow Map (Center) */}
            <div className="flex-1 p-6 border-r border-white/5 overflow-y-auto bg-slate-900/20">
                <h3 className="text-white font-medium mb-6">Extracted Procedural Operations</h3>
                
                {isExtracting ? (
                   <div className="h-64 flex items-center justify-center flex-col text-slate-500">
                       <div className="mb-4"><LoadingSpinner size="md" /></div>
                       <p className="text-sm">Synthesizing entity handoffs and dependencies...</p>
                   </div>
                ) : !hasTranscript || isRecording ? (
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 border-dashed text-slate-500 text-sm text-center max-w-md mx-auto mt-12">
                        Record or upload a workflow description to visualize the step-by-step logic graph.
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
                        {/* Rendered Graph Nodes */}
                        <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-indigo-500/30">
                            
                            <div className="relative bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm">
                                <span className="absolute -left-5 top-4 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-semibold text-white">Create Lead</h4>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">Receptionist</span>
                                </div>
                                <p className="text-xs text-slate-400">Triggered by inbound client call.</p>
                            </div>

                            <div className="relative bg-slate-900 rounded-xl p-4 border border-amber-500/30 shadow-sm">
                                <span className="absolute -left-5 top-4 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-slate-950" />
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-semibold text-white">Attorney Review Status</h4>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">Attorney</span>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Path A: Approval</span>
                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">Path B: Rejection</span>
                                </div>
                            </div>

                            <div className="relative bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-sm">
                                <span className="absolute -left-[21px] top-4 text-emerald-500 bg-slate-950"><GitCommit className="w-5 h-5" /></span>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-semibold text-white">Automated Retainer Generation</h4>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 rounded flex items-center"><Zap className="w-3 h-3 mr-1"/> System</span>
                                </div>
                                <p className="text-xs text-slate-400">Generates document and dispatches via DocuSign webhook.</p>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Column 3: AI Automations (Right) */}
            <div className="w-full lg:w-[350px] p-6 overflow-y-auto bg-slate-950 shrink-0">
                <h3 className="text-white font-medium mb-6">Automation Opportunities</h3>

                {!hasTranscript || isRecording ? null : isExtracting ? (
                   <div className="h-48 flex items-center justify-center text-slate-500">
                       <LoadingSpinner size="md" />
                   </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <h4 className="flex items-center text-sm font-semibold text-indigo-400 mb-2">
                                <GitPullRequest className="w-4 h-4 mr-2" /> Webhook Integration
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                You mentioned sending a retainer agreement. Bridgebox can natively integrate with DocuSign to dispatch this immediately upon approval.
                            </p>
                            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center">
                                Add to Implementation Plan <Plus className="w-3 h-3 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
