import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutTemplate, Network, Rocket, Box, Search, DollarSign, Puzzle, Plus, Download, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const mockTemplates = [
  { id: '1', name: 'Legal Practice OS', category: 'Industry Pack', price: 250, isPremium: true, status: 'Active' },
  { id: '2', name: 'Document Extraction Copilot', category: 'AI Agent', price: 99, isPremium: true, status: 'Active' },
];

const mockIntegrations = [
  { id: 'Stripe', name: 'Stripe Payments', category: 'Finance', price: '$15/mo', status: 'Active' },
  { id: 'QBO', name: 'QuickBooks Online', category: 'Accounting', price: '$49/mo', status: 'Restricted' },
];

const mockDeployments = [
  { id: 'dep_102', target: 'Bridal Industry Cohort', template: 'Inventory Sync v2.4', progress: 45, status: 'Migrating' },
];

export default function EcosystemHub() {
  const [activeTab, setActiveTab] = useState<'Templates' | 'Integrations' | 'Deployments'>('Templates');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Ecosystem & Modularity</h1>
           <p className="text-sm text-slate-400">Manage the Bridgebox Application Store, configure integration payloads, and execute multi-tenant deployments.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'Templates' && <Button className="bg-[#3B82F6] hover:bg-[#2563EB]"><Plus className="w-4 h-4 mr-2"/> Publish Template</Button>}
           {activeTab === 'Deployments' && <Button className="bg-[#10B981] hover:bg-[#059669] text-white border-transparent"><Rocket className="w-4 h-4 mr-2"/> Init Rollout</Button>}
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10 mt-6">
        {['Templates', 'Integrations', 'Deployments'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`px-5 py-3 font-semibold text-sm transition-colors relative flex items-center ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             {tab === 'Templates' && <LayoutTemplate className="w-4 h-4 mr-2" />}
             {tab === 'Integrations' && <Puzzle className="w-4 h-4 mr-2" />}
             {tab === 'Deployments' && <Rocket className="w-4 h-4 mr-2" />}
             {tab}
             {activeTab === tab && (
                <motion.div layoutId="ecosystem-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
             )}
           </button>
        ))}
      </div>

      <div className="pt-4">
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
               {activeTab === 'Templates' && <TemplatesView />}
               {activeTab === 'Integrations' && <IntegrationsView />}
               {activeTab === 'Deployments' && <DeploymentsView />}
            </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}

function TemplatesView() {
   return (
      <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden">
         <div className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
             <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search Application Store..." className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 focus:border-[#3B82F6]/50 text-sm text-white" />
             </div>
             <Button variant="outline" className="h-8 text-xs"><Download className="w-3.5 h-3.5 mr-1.5" />Preview Live Store</Button>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-900/30 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Blueprint Title</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Pricing Logic</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {mockTemplates.map((tpl) => (
                 <tr key={tpl.id} className="hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-6 py-4 font-semibold text-white">{tpl.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{tpl.category}</td>
                    <td className="px-6 py-4">
                       <span className="text-white font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-xs">+${tpl.price}/mo</span>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </Card>
   )
}

function IntegrationsView() {
   return (
      <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden">
         <div className="p-4 border-b border-white/5 bg-slate-900/60">
            <h3 className="text-sm font-bold text-white tracking-wide">Third-Party API Connections</h3>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-900/30 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Integration Component</th>
                  <th className="px-6 py-4">Monetization Sync</th>
                  <th className="px-6 py-4">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {mockIntegrations.map((pack) => (
                 <tr key={pack.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-semibold text-white">{pack.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">{pack.price}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{pack.status}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </Card>
   )
}

function DeploymentsView() {
   return (
      <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden">
         <div className="p-4 border-b border-white/5 bg-slate-900/60">
            <h3 className="text-sm font-bold text-white tracking-wide">Automated Cohort Rollouts</h3>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-900/30 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Target Cohort</th>
                  <th className="px-6 py-4">Deployment Payload</th>
                  <th className="px-6 py-4 w-64">Completion Matrix</th>
                  <th className="px-6 py-4">State</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {mockDeployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-white/[0.02]">
                     <td className="px-6 py-4 font-semibold text-white">{dep.target}</td>
                     <td className="px-6 py-4 text-sm text-[#3B82F6] font-mono">{dep.template}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 w-full">
                           <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden border border-white/5">
                              <div className="h-full rounded-full bg-[#3B82F6] transition-all duration-1000" style={{ width: `${dep.progress}%` }} />
                           </div>
                           <span className="text-xs font-bold text-[#3B82F6]">{dep.progress}%</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="inline-flex items-center text-xs font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded border border-[#3B82F6]/20">
                           <ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> Migrating
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </Card>
   )
}
