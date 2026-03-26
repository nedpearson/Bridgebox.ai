import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, ZapOff, ShieldAlert, BarChart3, Activity } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const mockAiActivity = [
  { id: 't-102', tenant: 'Horizon Law', model: 'gpt-4o', tokens: '142k', payload: 'Copilot Brief Gen', status: 'High Volume' },
  { id: 't-145', tenant: 'Summit Accounting', model: 'gemini-1.5', tokens: '89k', payload: 'Invoice Extractor', status: 'Nominal' },
  { id: 't-88', tenant: 'Apex Logistics', model: 'claude-3-opus', tokens: '2.4M', payload: 'Routing Optimizer', status: 'Abusive Pattern' },
  { id: 't-12', tenant: 'Bridal Visions', model: 'gpt-4o-mini', tokens: '12k', payload: 'Email Drafter', status: 'Nominal' }
];

export default function AIUsageDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Telemetry Control</h1>
           <p className="text-sm text-slate-400">Monitor token consumption, intercept abusive generative cascades, and protect provider margins.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10"><ZapOff className="w-4 h-4 mr-2"/> Network Killswitch</Button>
           <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"><BrainCircuit className="w-4 h-4 mr-2"/> Force Sync Cache</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
         <Card className="p-6 bg-slate-900/60 border border-emerald-500/20">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center"><Activity className="w-4 h-4 mr-2" /> Global Token Burn L30D</div>
            <div className="text-3xl font-black text-white">42.5M <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-2">Tokens</span></div>
         </Card>
         <Card className="p-6 bg-slate-900/60 border border-indigo-500/20">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Projected Provider Cost</div>
            <div className="text-3xl font-black text-white">$4,820 <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-2">USD</span></div>
         </Card>
         <Card className="p-6 bg-rose-500/5 border border-rose-500/20">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> Anomalous Spikes</div>
            <div className="text-3xl font-black text-white">3 <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-2">Tenants Flagged</span></div>
         </Card>
      </div>

      <Card className="p-0 bg-slate-900 border border-white/5 overflow-hidden mt-8">
         <div className="p-4 border-b border-white/5 bg-slate-900/80">
            <h3 className="text-sm font-bold text-white tracking-wide">Live Generative Payload Feeds</h3>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-900/40 border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Workspace / Tenant</th>
                  <th className="px-6 py-4">LLM Node</th>
                  <th className="px-6 py-4">Execution Target</th>
                  <th className="px-6 py-4">Volume (Tokens)</th>
                  <th className="px-6 py-4">Anomaly State</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {mockAiActivity.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                     <td className="px-6 py-4 font-semibold text-white">{log.tenant}</td>
                     <td className="px-6 py-4 text-sm text-indigo-400 font-mono">{log.model}</td>
                     <td className="px-6 py-4 text-sm text-slate-300">{log.payload}</td>
                     <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{log.tokens}</td>
                     <td className="px-6 py-4">
                        {log.status === 'Nominal' ? (
                           <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase rounded">Nominal</span>
                        ) : log.status === 'Abusive Pattern' ? (
                           <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase rounded flex w-fit items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Critical</span>
                        ) : (
                           <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase rounded">Elevated</span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-right">
                        {log.status === 'Abusive Pattern' && (
                           <button className="text-xs font-bold text-rose-400 hover:text-white transition-colors bg-rose-500/10 px-3 py-1.5 rounded-md border border-rose-500/20">Throttle</button>
                        )}
                        {log.status !== 'Abusive Pattern' && (
                           <button className="text-xs font-medium text-slate-500 hover:text-white transition-colors">Inspect</button>
                        )}
                     </td>
                  </tr>
                ))}
            </tbody>
         </table>
      </Card>
      
    </div>
  );
}

function AlertTriangle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  );
}
