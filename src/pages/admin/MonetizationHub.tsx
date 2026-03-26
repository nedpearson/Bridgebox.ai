import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calculator, Download, Settings, Users, Database, Sparkles, Network, Fingerprint, Lock, Zap, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

// Mock Data
const basePlans = [
  { id: 'starter', name: 'Starter Base', users: 3, workspaces: 1, ai: 1000, price: 99 },
  { id: 'growth', name: 'Growth Pack', users: 15, workspaces: 3, ai: 10000, price: 299 },
  { id: 'enterprise', name: 'Enterprise OS', users: 'Unlimited', workspaces: 'Unlimited', ai: 'Custom', price: 1250 }
];

const mockFeatures = [
  { id: 'feat_ai_drafting', name: 'Generative AI Drafting Studio', category: 'Copilot', status: 'active', desc: 'Allows access to the recursive AI document refinement engine.' },
  { id: 'feat_whitelabel', name: 'White-Label Branding', category: 'Platform', status: 'disabled', desc: 'Removes all Bridgebox OS watermarks and allows custom SMTP.' }
];

export default function MonetizationHub() {
  const [activeTab, setActiveTab] = useState<'Billing' | 'Plans' | 'Entitlements'>('Billing');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Monetization Engine</h1>
           <p className="text-sm text-slate-400">Control billing subscriptions, establish platform plan limits, and override boolean feature entitlements.</p>
        </div>
        <div className="flex gap-2">
           {activeTab === 'Billing' && <Button className="bg-[#3B82F6] hover:bg-[#2563EB]"><Calculator className="w-4 h-4 mr-2"/> Pricing Simulator</Button>}
           {activeTab === 'Plans' && <Button className="bg-[#10B981] hover:bg-[#059669] text-white border-transparent"><Settings className="w-4 h-4 mr-2"/> Commit Plan Changes</Button>}
           {activeTab === 'Entitlements' && <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"><Fingerprint className="w-4 h-4 mr-2"/> Audit Sync</Button>}
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10 mt-6">
        {['Billing', 'Plans', 'Entitlements'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab as any)}
             className={`px-5 py-3 font-semibold text-sm transition-colors relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
           >
             {tab === 'Billing' ? 'Revenue & Invoices' : tab === 'Plans' ? 'Subscription Tiers' : 'Feature Overrides'}
             {activeTab === tab && (
                <motion.div layoutId="monetization-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]" />
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
               {activeTab === 'Billing' && <BillingView />}
               {activeTab === 'Plans' && <PlansView />}
               {activeTab === 'Entitlements' && <EntitlementsView />}
            </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}

// Sub-components for clean rendering
function BillingView() {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/60 p-5 border border-emerald-500/20">
               <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1.5"/> Collected L30D</div>
               <div className="text-3xl font-black text-white">$62,450</div>
               <div className="text-xs text-emerald-500/80 mt-1 font-medium">+12% MRR Expansion</div>
            </Card>
            <Card className="bg-slate-900/60 p-5 border border-white/5">
               <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Platform Margin Estimate</div>
               <div className="text-3xl font-black text-white">82.4%</div>
            </Card>
         </div>

         <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-900/50 border-b border-white/5">
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Workspace</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Plan</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Next Invoice</th>
                     <th className="px-6 py-4 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {['Apex Logistics', 'Summit Law', 'Bridal Visions', 'Horizon Health'].map(tenant => (
                     <tr key={tenant} className="hover:bg-white/[0.02] cursor-pointer group">
                        <td className="px-6 py-4 font-semibold text-white">{tenant}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">Enterprise OS</td>
                        <td className="px-6 py-4 text-sm"><span className="text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded font-bold text-xs uppercase tracking-wider">Active</span></td>
                        <td className="px-6 py-4 font-bold text-white">$1,700.00</td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs">Manage Subscription</Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   )
}

function PlansView() {
   const [activePlan, setActivePlan] = useState('enterprise');
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {basePlans.map((plan) => (
               <div key={plan.id} onClick={() => setActivePlan(plan.id)} className="w-full">
                 <Card 
                   className={`p-6 cursor-pointer transition-all duration-200 border-2 ${
                     activePlan === plan.id ? 'bg-[#3B82F6]/10 border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-4">
                       <h3 className={`font-bold tracking-tight ${activePlan === plan.id ? 'text-[#3B82F6]' : 'text-white'}`}>{plan.name}</h3>
                    </div>
                    <div className="text-2xl font-black text-white">${plan.price} <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">/mo</span></div>
                 </Card>
               </div>
            ))}
         </div>

         <Card className="bg-slate-900/60 p-6 border border-white/5">
             <h3 className="text-lg font-bold text-white flex items-center mb-6"><Settings className="w-5 h-5 mr-2 text-slate-400" /> Plan Capacity Constraints</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400 flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-400" /> User Seats</label>
                   <input type="text" defaultValue="Unlimited" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400 flex items-center"><Database className="w-4 h-4 mr-2 text-amber-400" /> Workspaces</label>
                   <input type="text" defaultValue="Unlimited" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-400 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-emerald-400" /> Custom AI Token Payload</label>
                   <input type="text" defaultValue="2,500,000" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3B82F6]/50" />
                </div>
             </div>
         </Card>
      </div>
   )
}

function EntitlementsView() {
   return (
      <Card className="p-0 bg-slate-900/30 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-slate-900/80 flex items-center justify-between">
             <h3 className="text-sm font-bold text-white tracking-wide">Target Tenant Explict Feature Overrides</h3>
             <input type="text" placeholder="Workspace ID..." className="bg-slate-950 border border-white/10 rounded-lg px-4 py-1.5 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50" />
          </div>
          
          <div className="divide-y divide-white/5">
             {mockFeatures.map((feat) => (
               <div key={feat.id} className="p-5 flex items-start justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start space-x-4">
                     <label className="flex items-center cursor-pointer mt-1">
                       <div className="relative">
                         <input type="checkbox" className="sr-only" defaultChecked={feat.status === 'active'} />
                         <div className={`block w-10 h-6 rounded-full transition-colors ${feat.status === 'active' ? 'bg-[#3B82F6]' : 'bg-slate-700'}`}></div>
                         <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${feat.status === 'active' ? 'transform translate-x-4' : ''}`}></div>
                       </div>
                     </label>
                     <div>
                        <h4 className="text-sm font-bold text-white mb-1">{feat.name}</h4>
                        <p className="text-xs text-slate-400 mb-2 max-w-lg">{feat.desc}</p>
                     </div>
                  </div>
                  
                  <div className="text-right">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                       feat.status === 'active' 
                         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                         : 'bg-slate-800 text-slate-500 border border-white/10'
                     }`}>
                        {feat.status === 'active' ? 'Force Granted' : 'Revoked'}
                     </span>
                  </div>
               </div>
             ))}
          </div>
      </Card>
   )
}
