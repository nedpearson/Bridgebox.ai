import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, BrainCircuit, ShieldCheck, Zap, Lock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const AUTONOMY_LEVELS = [
  { value: 'level_0', label: 'L0: Insights Only', icon: Eye, description: 'Agent only analyzes and reports. No actions proposed or taken.', color: 'text-slate-400' },
  { value: 'level_1', label: 'L1: Draft & Review', icon: ShieldCheck, description: 'Agent proposes actions to your Inbox. Requires explicit human approval.', color: 'text-blue-400' },
  { value: 'level_2', label: 'L2: Semi-Autonomous', icon: BrainCircuit, description: 'Low-risk actions auto-execute. Med/High risk sent to Inbox.', color: 'text-purple-400' },
  { value: 'level_3', label: 'L3: Fully Autonomous', icon: Zap, description: 'Agent executes all authorized paths automatically within Policy limits.', color: 'text-emerald-400' }
];

export default function AgentCommandCenter() {
  const { currentOrganization } = useAuth();
  const [tenantAgents, setTenantAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) loadAgents();
  }, [currentOrganization]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bb_tenant_agents')
        .select(`
          id,
          autonomy_level,
          status,
          memory_retention_days,
          bb_agents (
            id,
            name,
            description,
            category,
            capabilities_json,
            recommended_autonomy
          )
        `)
        .eq('organization_id', currentOrganization?.id);

      if (error) console.error(error);
      else setTenantAgents(data || []);
    } finally {
      setLoading(false);
    }
  };

  const updateAutonomy = async (tenantAgentId: string, level: string) => {
    try {
      setUpdatingId(tenantAgentId);
      const { error } = await supabase
        .from('bb_tenant_agents')
        .update({ autonomy_level: level })
        .eq('id', tenantAgentId);

      if (error) throw error;
      
      setTenantAgents(prev => prev.map(a => 
         a.id === tenantAgentId ? { ...a, autonomy_level: level } : a
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to update autonomy level. Ensure you have SuperAdmin permissions.');
    } finally {
       setUpdatingId(null);
    }
  };

  const toggleStatus = async (tenantAgentId: string, currentStatus: string) => {
    try {
      setUpdatingId(tenantAgentId);
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('bb_tenant_agents')
        .update({ status: newStatus })
        .eq('id', tenantAgentId);

      if (error) throw error;
      
      setTenantAgents(prev => prev.map(a => 
         a.id === tenantAgentId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Agent Command Center"
        subtitle="Manage your AI workforce, configure autonomy governance, and track system ROI."
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
            ))}
          </div>
        ) : tenantAgents.length === 0 ? (
           <Card className="p-16 border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                <BrainCircuit className="w-12 h-12 text-slate-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-3">No Agents Deployed</h2>
             <p className="text-slate-400 max-w-md mb-8">
               Your organization has no autonomous agents installed. Visit the Ecosystem Marketplace to hire AI workers specialized for your industry.
             </p>
             <button className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl transition-colors">
               Browse Agent Marketplace
             </button>
           </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tenantAgents.map((ta) => {
               const agent = ta.bb_agents;
               const LevelIcon = AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.icon || Lock;
               const levelColor = AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.color || 'text-slate-500';

               return (
                 <Card key={ta.id} className={`bg-slate-900 overflow-hidden relative transition-all ${ta.status === 'paused' ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-slate-600 shadow-xl'}`}>
                   {ta.status === 'paused' && (
                     <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-slate-900 border border-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl flex items-center shadow-lg">
                           <AlertCircle className="w-5 h-5 mr-3 text-amber-500" />
                           Agent Paused
                        </div>
                     </div>
                   )}
                   
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl border ${ta.status === 'active' ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30' : 'bg-slate-800 border-slate-700'}`}>
                               <Bot className={`w-8 h-8 ${ta.status === 'active' ? 'text-[#3B82F6]' : 'text-slate-500'}`} />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                               <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{agent.category.replace('_', ' ')} Agent</p>
                            </div>
                         </div>
                         
                         <button 
                           onClick={() => toggleStatus(ta.id, ta.status)}
                           disabled={updatingId === ta.id}
                           className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-20"
                         >
                           {updatingId === ta.id ? 'Updating...' : ta.status === 'active' ? 'Pause' : 'Resume'}
                         </button>
                      </div>

                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                        {agent.description}
                      </p>

                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 z-20 relative">
                         <div className="flex items-center justify-between mb-4">
                            <div>
                               <h4 className="text-white font-bold text-sm mb-1">Matrix Governance</h4>
                               <p className="text-xs text-slate-400">Controls this agent's strict operational independence.</p>
                            </div>
                            <div className={`flex items-center px-3 py-1.5 rounded-lg border bg-slate-900 ${levelColor.replace('text-', 'border-').replace('400', '500/30')} ${levelColor}`}>
                               <LevelIcon className="w-4 h-4 mr-2" />
                               <span className="text-xs font-bold tracking-wide">
                                 {AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.label.split(':')[0]}
                               </span>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {AUTONOMY_LEVELS.map((level) => {
                               const isActive = ta.autonomy_level === level.value;
                               return (
                                 <button
                                   key={level.value}
                                   onClick={() => updateAutonomy(ta.id, level.value)}
                                   disabled={updatingId === ta.id || ta.status !== 'active'}
                                   className={`p-3 rounded-lg border text-left transition-all ${
                                     isActive 
                                       ? `bg-slate-800 ${level.color.replace('text-', 'border-').replace('400','500/50')}` 
                                       : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-50 hover:opacity-100'
                                   }`}
                                 >
                                    <level.icon className={`w-4 h-4 mb-2 ${isActive ? level.color : 'text-slate-500'}`} />
                                    <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                      {level.label.split(': ')[0]}<br/>
                                      <span className="text-[10px] font-medium opacity-80">{level.label.split(': ')[1]}</span>
                                    </div>
                                 </button>
                               );
                            })}
                         </div>
                         <p className="text-[11px] text-slate-500 mt-3 flex items-center bg-slate-900 p-2 rounded">
                           <ShieldCheck className="w-3 h-3 mr-2" />
                           {AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.description}
                         </p>
                      </div>
                      
                      {/* Telemetry Footer */}
                      <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-medium">
                         <div className="flex items-center text-slate-400">
                           <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                           Operational Memory: {ta.memory_retention_days} Days
                         </div>
                         <div className="text-slate-500">
                           Recommended: {AUTONOMY_LEVELS.find(l => l.value === agent.recommended_autonomy)?.label.split(':')[0]}
                         </div>
                      </div>
                   </div>
                 </Card>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
