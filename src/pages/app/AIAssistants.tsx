import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Clock, TrendingUp, ShieldCheck, Zap, Lock, Eye, AlertCircle, Cpu, CheckCircle } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

const AUTONOMY_LEVELS = [
  { value: 'level_0', label: 'Insights Only', icon: Eye, description: 'Digital assistant only analyzes and reports. Maps contextual data but proposes no operations.', color: 'text-slate-400' },
  { value: 'level_1', label: 'Suggest Only', icon: ShieldCheck, description: 'Safest operational mode. Drafts actions (e.g. emails) for your explicit approval in the Queue.', color: 'text-blue-400' },
  { value: 'level_2', label: 'Standard Auto', icon: Cpu, description: 'Routinely executes low-risk safe workflows automatically. Pushes high-risk events to the Queue.', color: 'text-purple-400' },
  { value: 'level_3', label: 'Fully Autonomous', icon: Zap, description: 'Maximum delegation. Executes all operations natively within fixed policy engine parameters.', color: 'text-emerald-400' }
];

export default function AIAssistants() {
  const { currentOrganization } = useAuth();
  const [tenantAgents, setTenantAgents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      loadAgents();
      loadTelemetry();
    }
  }, [currentOrganization]);

  const loadAgents = async () => {
    try {
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

      if (error) throw error;
      setTenantAgents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTelemetry = async () => {
    try {
      const { data, error } = await supabase
        .from('bb_agent_audit_logs')
        .select('event_type, execution_time_ms')
        .eq('organization_id', currentOrganization?.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); 

      if (error) throw error;

      const logs = data || [];
      const executed = logs.filter(l => l.event_type === 'executed').length;
      const drafted = logs.filter(l => l.event_type === 'drafted_for_review').length;

      const minutesSaved = executed * 4;
      const hoursSaved = (minutesSaved / 60).toFixed(1);
      const revenueImpact = (minutesSaved / 60) * 35; // Est. $35/hr value

      setMetrics({
        executed,
        drafted,
        hoursSaved,
        revenueImpact
      });
    } catch (err) {
      console.error(err);
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
      alert('Failed to update execution rules. Ensure you have Admin permissions.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-slate-400 mt-4 text-sm font-medium tracking-wide">Loading active workforce telemetry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="AI Assistants"
        subtitle="Manage your customized digital delegates, configure trust rules, and measure operational velocity."
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Unified ROI Section */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Reclaimed (30d)
                </div>
                <div className="text-3xl font-black text-white">{metrics.hoursSaved} <span className="text-lg text-slate-500 font-normal">hrs</span></div>
             </Card>

             <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cost Equivalency (30d)
                </div>
                <div className="text-3xl font-black text-white">${metrics.revenueImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest">
                  Est. $35/hr Labor Value
                </div>
             </Card>

             <Card className="p-6 bg-slate-900 border-slate-800">
                <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Independent Executions
                </div>
                <div className="text-3xl font-black text-white">{metrics.executed}</div>
                <div className="mt-2 text-xs text-blue-400 flex items-center">
                   {metrics.drafted} Waiting in Queue
                </div>
             </Card>

             <Card className="p-6 bg-[#3B82F6]/5 border-[#3B82F6]/20 flex flex-col items-start justify-center">
                <div className="text-[#3B82F6] text-sm font-bold mb-1 flex items-center">
                   Trust Architecture Active
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                   Actions natively blocked if executing beyond configured autonomous policies across your active fleet.
                </p>
             </Card>
          </div>
        )}

        {tenantAgents.length === 0 ? (
           <Card className="p-16 border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                <Bot className="w-12 h-12 text-slate-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-3">No AI Assistants Deployed</h2>
             <p className="text-slate-400 max-w-md mb-8">
               Your organization has no digital workers installed. Visit the Ecosystem Marketplace to provision templates specialized for your industry.
             </p>
             <button className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl transition-colors">
               Explore Industry Assistants
             </button>
           </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
              Automated Operations Personnel
            </h2>
            
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
                             Assistant Paused
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
                                 <p className="text-sm font-medium text-slate-400 capitalize tracking-wide">{agent.category.replace('_', ' ')} Focus</p>
                              </div>
                           </div>
                           
                           <button 
                             onClick={() => toggleStatus(ta.id, ta.status)}
                             disabled={updatingId === ta.id}
                             className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-20"
                           >
                             {updatingId === ta.id ? 'Updating...' : ta.status === 'active' ? 'Hold Operations' : 'Resume Ops'}
                           </button>
                        </div>

                        <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                          {agent.description}
                        </p>

                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 z-20 relative">
                           <div className="flex items-center justify-between mb-4">
                              <div>
                                 <h4 className="text-white font-bold text-sm mb-1">Execution Rules</h4>
                                 <p className="text-xs text-slate-400">Controls this assistant's allowable independence logic.</p>
                              </div>
                              <div className={`flex items-center px-3 py-1.5 rounded-lg border bg-slate-900 ${levelColor.replace('text-', 'border-').replace('400', '500/30')} ${levelColor}`}>
                                 <LevelIcon className="w-4 h-4 mr-2" />
                                 <span className="text-xs font-bold tracking-wide">
                                   {AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.label}
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
                                         : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-50 hover:opacity-100 items-center justify-center flex-col md:block'
                                     }`}
                                   >
                                      <level.icon className={`w-4 h-4 mb-2 mx-auto md:mx-0 ${isActive ? level.color : 'text-slate-500'}`} />
                                      <div className={`text-xs font-bold leading-tight text-center md:text-left ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {level.label}
                                      </div>
                                   </button>
                                 );
                              })}
                           </div>
                           <p className="text-[11px] text-slate-500 mt-3 flex items-center bg-slate-900 p-2 rounded px-3 border border-slate-800">
                             <ShieldCheck className="w-3 h-3 mr-2" />
                             {AUTONOMY_LEVELS.find(l => l.value === ta.autonomy_level)?.description}
                           </p>
                        </div>
                     </div>
                   </Card>
                 );
               })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
