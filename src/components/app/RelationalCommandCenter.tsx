import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckCircle2, File, Mail, GitMerge, Network } from 'lucide-react';
import { EntityType } from '../../lib/db/entityLinks';
import RelationalTasksBoard from './RelationalTasksBoard';
import RelationalWorkflowsBoard from './RelationalWorkflowsBoard';
import RelationalDocumentsBoard from './RelationalDocumentsBoard';
import RelationalCommunicationsBoard from './RelationalCommunicationsBoard';
import RelationalNetworkBoard from './RelationalNetworkBoard';
import { usePlatformIntelligence } from '../../hooks/usePlatformIntelligence';

interface RelationalCommandCenterProps {
  entityType: EntityType;
  entityId: string;
  children: React.ReactNode; 
}

type CommandCenterTab = 'overview' | 'tasks' | 'documents' | 'communications' | 'workflows' | 'network';

export default function RelationalCommandCenter({ entityType, entityId, children }: RelationalCommandCenterProps) {
  const [activeTab, setActiveTab] = useState<CommandCenterTab>('overview');

  usePlatformIntelligence({
    id: `context_grid:${entityType}:${entityId}`,
    name: `Relational Command Center - ${entityType}`,
    type: 'module',
    description: `User is viewing a unified topological boundary for a ${entityType}. They can seamlessly traverse to linked Tasks, Documents, Comms, Workflows, or view the N-Degree Network.`,
    relatedNodes: [],
    visibility: { roles: ['super_admin', 'tenant_admin', 'manager', 'agent'] },
    actions: [
      { id: 'cmd_k', type: 'modal', name: 'Command Palette', description: 'Use the Command Palette (Cmd+K) to globally create new Tasks, Projects, and Clients' },
      { id: 'network_link', type: 'navigation', name: 'Network Topology', description: 'Navigate to the Network tab to seamlessly link N-degree N-tier topological entities together' },
      { id: 'nba_review', type: 'navigation', name: 'Next Best Actions', description: 'Review the Next Best Actions and Blockers panel on the Overview tab to intelligently orchestrate the platform.' },
      { id: 'upload_file', type: 'mutation', name: 'Relational Uploads', description: 'Upload relational files bounded natively to this context via the Documents tab' },
      { id: 'log_interaction', type: 'mutation', name: 'Interaction Trace', description: 'Log phone calls, emails, and physical interactions on the Comms tab to create persistent system traces' }
    ]
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'communications', label: 'Comms', icon: Mail },
    { id: 'workflows', label: 'Workflows', icon: GitMerge },
    { id: 'network', label: 'Network', icon: Network },
  ] as const;

  return (
    <div className="space-y-2">
      <div className="px-8 mt-2">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CommandCenterTab)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/5' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 pb-8 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && children}
            
            {activeTab === 'tasks' && (
              <div className="bg-slate-900/50 rounded-xl p-6">
                <RelationalTasksBoard entityType={entityType} entityId={entityId} />
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div className="bg-slate-900/50 rounded-xl p-6">
                <RelationalDocumentsBoard entityType={entityType} entityId={entityId} />
              </div>
            )}
            
            {activeTab === 'communications' && (
              <div className="bg-slate-900/50 rounded-xl p-6">
                <RelationalCommunicationsBoard entityType={entityType} entityId={entityId} />
              </div>
            )}
            
            {activeTab === 'workflows' && (
              <div className="bg-slate-900/50 rounded-xl p-6">
                <RelationalWorkflowsBoard entityType={entityType} entityId={entityId} />
              </div>
            )}
            
            {activeTab === 'network' && (
              <div className="bg-slate-900/50 rounded-xl p-6">
                <RelationalNetworkBoard entityType={entityType} entityId={entityId} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
