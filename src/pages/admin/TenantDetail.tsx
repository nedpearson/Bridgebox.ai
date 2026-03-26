import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, ExternalLink, PlaySquare, ShieldAlert, Sparkles, Receipt, LayoutTemplate, Activity, Settings } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

// Refactored to 5 essential tabs instead of 10
const TABS = [
  { id: 'Overview', name: 'Overview & AI', icon: Activity },
  { id: 'Subscription', name: 'Subscriptions', icon: Receipt },
  { id: 'Templates', name: 'Installed Templates', icon: LayoutTemplate },
  { id: 'Audit', name: 'Audit Log', icon: Sparkles },
  { id: 'Settings', name: 'Instance Settings', icon: Settings }
];

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header Context */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-start">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/tenants')}
            className="p-2 bg-slate-900 border border-white/10 rounded-xl hover:bg-slate-800 transition-colors"
          >
             <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center space-x-4">
             <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-indigo-500" />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
                  Horizon Law Partners
                  <span className="ml-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    High AI Load
                  </span>
                </h1>
                <p className="text-sm text-slate-400 flex items-center space-x-2 mt-0.5">
                  <span className="font-mono text-slate-500">{id}</span>
                  <span>•</span>
                  <span>Legal Sector</span>
                  <span>•</span>
                  <span className="text-indigo-500 flex items-center cursor-pointer hover:underline">
                    admin@horizonlaw.com <ExternalLink className="w-3 h-3 ml-1" />
                  </span>
                </p>
             </div>
          </div>
        </div>

        <div className="flex gap-2 isolate">
           <Button variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10">
             <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent">
             <PlaySquare className="w-4 h-4 mr-2" /> Impersonate
           </Button>
        </div>
      </div>

      {/* Simplified Deep Drill Tab Architecture */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 pt-4 -mx-8 px-8 md:-mx-12 md:px-12 mt-4">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`pb-4 flex items-center text-sm font-bold whitespace-nowrap transition-colors relative ${
                   activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-indigo-500' : 'text-slate-600'}`} />
                 {tab.name}
                 {activeTab === tab.id && (
                   <motion.div
                     layoutId="active-tenant-tab-refactored"
                     className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"
                   />
                 )}
               </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic Content Pane */}
      <div className="mt-8">
         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
               {activeTab === 'Overview' && <TenantOverviewTab />}
               
               {activeTab !== 'Overview' && (
                 <Card glass className="p-12 flex flex-col items-center justify-center text-center bg-slate-900/40 border-dashed border-white/10 h-[300px]">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                       {/* Grab icon dynamically just for visual placeholder */}
                       {TABS.find(t => t.id === activeTab)?.icon({ className: "w-6 h-6 text-slate-500" })}
                    </div>
                    <p className="text-slate-400 font-medium">Drilldown module for <span className="text-white">{activeTab}</span> initialized.</p>
                 </Card>
               )}
            </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}

function TenantOverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="lg:col-span-2 space-y-6">
         <Card glass className="bg-slate-900/60 border border-white/5 p-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-500"/> Execution Telemetry</h3>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 flex items-center rounded border border-amber-500/20">
                 <ShieldAlert className="w-3.5 h-3.5 mr-1" /> High Payload
              </span>
           </div>
           
           <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Webhooks</div>
                <div className="text-2xl font-black text-white">45,201</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-white/5">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Doc Extractions</div>
                <div className="text-2xl font-black text-white">8,904</div>
              </div>
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
                <div className="text-xs text-rose-500 uppercase tracking-widest mb-1">Rate Limits Hit</div>
                <div className="text-2xl font-black text-rose-400">14</div>
              </div>
           </div>

           <div className="bg-slate-950/50 rounded-lg p-3 flex justify-between items-center border border-white/5">
              <div className="text-sm text-slate-400 font-medium">AI Generative Token Burn (L30D)</div>
              <div className="text-sm font-black text-emerald-400">450k Tokens</div>
           </div>
         </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
         <Card glass className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-6 flex flex-col h-full">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Financial State</h3>
            <div className="flex items-end space-x-2 mb-1">
              <span className="text-5xl font-black text-white tracking-tighter">$1,850</span>
              <span className="text-slate-400 text-sm mb-2 font-bold uppercase">/ mo</span>
            </div>
            <p className="text-sm text-indigo-500 font-bold mb-6">Enterprise OS Plan</p>
            
            <div className="space-y-3 border-t border-indigo-500/20 pt-6 mt-auto">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Base OS License</span>
                 <span className="text-white font-bold">$250</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">User Seats (82)</span>
                 <span className="text-white font-bold">$820</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">AI Tokens Overrun</span>
                 <span className="text-rose-400 font-bold">$780</span>
               </div>
            </div>
         </Card>
      </div>

    </div>
  );
}
