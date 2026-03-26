import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SplitWorkspaceLayout from '../../components/onboarding/layout/SplitWorkspaceLayout';
import { ListChecks, Briefcase, Zap, Settings, Search, LayoutTemplate, Target, CheckCircle2 } from 'lucide-react';
import AiIntelligencePane from '../../components/onboarding/AiIntelligencePane';

export default function ClientIntakeWorkspace() {
    const { session, setSession } = useOutletContext<any>();
    const [activeTab, setActiveTab] = useState(0);

    // Mock tabs mapped to the Phase 1 spec explicitly.
    const tabs = [
        { id: 'overview', icon: <Briefcase className="w-4 h-4" />, label: 'Business Overview' },
        { id: 'operations', icon: <ListChecks className="w-4 h-4" />, label: 'Daily Operations' },
        { id: 'tools', icon: <Settings className="w-4 h-4" />, label: 'Current Tools' },
        { id: 'integrations', icon: <Zap className="w-4 h-4" />, label: 'Integrations Needed' },
        { id: 'goals', icon: <Target className="w-4 h-4" />, label: 'Workflow Goals' },
        { id: 'dashboards', icon: <LayoutTemplate className="w-4 h-4" />, label: 'Dashboards' },
        { id: 'features', icon: <Search className="w-4 h-4" />, label: 'Feature Requests' },
        { id: 'success', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Success Definition' },
    ];

    const ClientFormPayload = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
             <div className="mb-8">
                 <h2 className="text-2xl font-bold text-white mb-2">Architect Your Workflow</h2>
                 <p className="text-slate-400">Describe your business operations and we will automatically map the underlying databases, tasks, and system integrations needed to automate your firm.</p>
             </div>

             <div className="flex overflow-x-auto space-x-2 pb-2 mb-6 hide-scrollbar">
                 {tabs.map((tab, idx) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(idx)}
                        className={`flex items-center flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                     >
                         <span className="mr-2">{tab.icon}</span> {tab.label}
                     </button>
                 ))}
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
                 {/* Internal mappings for specific tabs */}
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-slate-300 mb-2">What does your business do, and who do you serve?</label>
                         <textarea 
                            rows={8}
                            placeholder="e.g. We are a family law firm exclusively handling high-net-worth divorce cases across 3 states..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                         />
                     </div>
                 </div>
             </div>
        </div>
    );

    const AIInferencePayload = () => (
        <div className="h-full relative">
            {/* Borrowing the existing intelligence pane from prior work as a foundation */}
            <AiIntelligencePane rawContext={session?.raw_input?.full_context || ''} />
        </div>
    );

    return (
        <SplitWorkspaceLayout 
            leftWidth="1/2"
            leftPanel={<ClientFormPayload />} 
            rightPanel={<AIInferencePayload />} 
        />
    );
}
