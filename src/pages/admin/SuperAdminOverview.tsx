import { motion } from 'framer-motion';
import { Users, Server, Zap, Database, TrendingUp, AlertCircle, LayoutTemplate, Activity } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function SuperAdminOverview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Alert Banner / Fix Now action */}
      <Card className="bg-rose-500/10 border border-rose-500/30 p-4 flex flex-col md:flex-row items-start md:items-center justify-between">
         <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
               <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
               <h3 className="text-rose-400 font-bold tracking-tight">Abusive LLM Pattern Detected</h3>
               <p className="text-xs text-rose-500/80">Tenant <span className="text-white font-mono">t-88</span> (Apex Logistics) has executed 2.4M tokens in 1 hour via cascade looping.</p>
            </div>
         </div>
         <Button className="bg-rose-500 hover:bg-rose-400 text-white w-full md:w-auto border-transparent shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            Throttle Instance
         </Button>
      </Card>

      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Command Center</h1>
           <p className="text-sm text-slate-400">Real-time aggregate telemetry across all provisioned organizations.</p>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Total System MRR</div>
           <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#3B82F6]">$142,500</div>
           <div className="text-xs text-emerald-400 font-semibold mt-1">+12.4% MoM Expansion</div>
        </div>
      </div>

      {/* Primary KPI Grid (Combining old Analytics & Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Card glass className="p-5 flex flex-col bg-slate-900 border-white/5 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#3B82F6]/5 blur-2xl rounded-full group-hover:bg-[#3B82F6]/10 transition-colors" />
           <div className="text-slate-400 font-medium text-sm mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-[#3B82F6]"/> Active Tenants</div>
           <div className="text-4xl font-black text-white mt-auto tracking-tight">142</div>
           <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +3 this week</div>
        </Card>

        <Card glass className="p-5 flex flex-col bg-slate-900 border-white/5 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
           <div className="text-slate-400 font-medium text-sm mb-4 flex items-center"><LayoutTemplate className="w-4 h-4 mr-2 text-indigo-400"/> Store Conversions</div>
           <div className="text-4xl font-black text-white mt-auto tracking-tight">45.2%</div>
           <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Premium module installs</div>
        </Card>

        <Card glass className="p-5 flex flex-col bg-slate-900 border-white/5 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />
           <div className="text-slate-400 font-medium text-sm mb-4 flex items-center"><Zap className="w-4 h-4 mr-2 text-emerald-400"/> Token Burn L30D</div>
           <div className="text-3xl font-black text-white mt-auto tracking-tight">42.5M</div>
           <div className="text-xs font-semibold text-rose-400 mt-2 flex items-center">~$4,820 Provider Cost</div>
        </Card>

        <Card glass className="p-5 flex flex-col bg-slate-900 border-white/5 relative overflow-hidden group hover:border-[#3B82F6]/30 transition-colors cursor-pointer">
           <div className="text-slate-400 font-medium text-sm mb-4 flex items-center"><Server className="w-4 h-4 mr-2 text-amber-500"/> Infrastructure</div>
           <div className="mt-auto space-y-3">
              <div>
                 <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-slate-300">Cluster RAM</span><span className="text-amber-400">82%</span></div>
                 <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width: '82%'}}></div></div>
              </div>
              <div>
                 <div className="flex justify-between text-xs mb-1 font-medium"><span className="text-slate-300">DB Connections</span><span className="text-emerald-400">45%</span></div>
                 <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: '45%'}}></div></div>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <Card className="p-6 bg-slate-900 border border-white/5 min-h-[400px] flex flex-col">
            <h3 className="text-sm font-bold text-white tracking-wide mb-6">MRR Distribution & Churn Vectors</h3>
            <div className="flex-1 flex items-center justify-center flex-col text-slate-500">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-sm">Aggregate chart renderer initializing...</p>
                <p className="text-xs mt-1 text-center max-w-xs">Data merged from legacy Analytics view for unified visibility.</p>
            </div>
         </Card>
         <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden flex flex-col">
             <div className="p-6 border-b border-white/5">
                 <h3 className="text-sm font-bold text-white tracking-wide">Top Grossing Modules</h3>
             </div>
             <table className="w-full text-left">
                <tbody>
                   {[
                     { name: 'Legal Billing Engine', revenue: '$12,400', conversions: '89 installs' },
                     { name: 'Bridal Booking Workflow', revenue: '$8,250', conversions: '142 installs' },
                     { name: 'QBO Deep Sync Agent', revenue: '$4,100', conversions: '312 installs' },
                     { name: 'Stripe Native Payments', revenue: '$2,800', conversions: '450 installs' }
                   ].map(row => (
                      <tr key={row.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                         <td className="px-6 py-4 font-semibold text-white">{row.name}</td>
                         <td className="px-6 py-4 text-emerald-400 font-bold">{row.revenue}<span className="text-xs text-slate-500 font-medium ml-1">/mo</span></td>
                         <td className="px-6 py-4 text-right text-sm text-slate-400">{row.conversions}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </Card>
      </div>
    </div>
  );
}
