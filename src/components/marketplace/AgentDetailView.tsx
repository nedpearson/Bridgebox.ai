import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, ShieldCheck, Zap, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

export default function AgentDetailView({ agentId, onClose }: { agentId: string, onClose: () => void }) {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bb_agents')
        .select('*')
        .eq('id', agentId)
        .single();
        
      if (error) throw error;
      setAgent(data);

      // Check if already installed
      const { data: existing } = await supabase
        .from('bb_tenant_agents')
        .select('id')
        .eq('agent_id', agentId)
        .eq('organization_id', currentOrganization?.id)
        .single();
        
      if (existing) setInstalled(true);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHireAgent = async () => {
    if (!currentOrganization) return;
    
    try {
      setInstalling(true);
      const { error } = await supabase
        .from('bb_tenant_agents')
        .insert({
           organization_id: currentOrganization.id,
           agent_id: agent.id,
           status: 'active',
           autonomy_level: agent.recommended_autonomy || 'level_1',
           memory_retention_days: 30
        });

      if (error) throw error;
      
      setInstalled(true);
      setTimeout(() => {
         onClose();
         navigate('/app/ai-assistants');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert('Failed to deploy assistant to your workspace.');
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!agent) return null;

  const caps = agent.capabilities_json as { triggers: string[], actions: string[] };
  const recAutonomy = agent.recommended_autonomy === 'level_1' ? 'Suggest Only' : 
                      agent.recommended_autonomy === 'level_2' ? 'Standard Auto' : 'Fully Autonomous';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
             
             {/* Left Panel: Details */}
             <div className="p-10 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg">
                   <Bot className="w-8 h-8 text-indigo-500" />
                </div>
                
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 relative z-10">
                   Premium AI Assistant
                </div>
                <h1 className="text-3xl font-black text-white mb-4 relative z-10 leading-tight">
                   {agent.name}
                </h1>
                
                <p className="text-slate-300 text-lg leading-relaxed font-medium mb-8 relative z-10">
                   {agent.description}
                </p>

                <div className="space-y-4 relative z-10">
                   <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Triggers Recognized</div>
                      <div className="flex flex-wrap gap-2">
                        {caps?.triggers?.map((t: string) => (
                          <span key={t} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">
                             {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                   </div>
                   
                   <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                      <div className="text-xs text-emerald-500/80 font-bold uppercase tracking-wider mb-2">Executed Actions</div>
                      <div className="flex flex-wrap gap-2">
                        {caps?.actions?.map((a: string) => (
                          <span key={a} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-md border border-emerald-500/20">
                             {a.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Panel: Value & Install */}
             <div className="p-10 bg-slate-900/50 flex flex-col justify-between">
                <div>
                   <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Business Value Proposition</h3>
                   
                   <ul className="space-y-4 mb-8">
                      <li className="flex items-start text-slate-300">
                         <ShieldCheck className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                         <span className="leading-snug">Requires <strong>{recAutonomy}</strong> mode natively, ensuring you remain in total control of external communications.</span>
                      </li>
                      <li className="flex items-start text-slate-300">
                         <Zap className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                         <span className="leading-snug">Average time-saved per execution: <strong>4.5 Minutes</strong></span>
                      </li>
                      <li className="flex items-start text-slate-300">
                         <Play className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                         <span className="leading-snug">Deploys instantly. No training data or LLM prompt engineering required by your team.</span>
                      </li>
                   </ul>
                </div>

                <div className="pt-6 border-t border-slate-800">
                   {installed ? (
                      <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
                         <CheckCircle className="w-5 h-5 mr-2" />
                         Assistant Deployed
                      </div>
                   ) : (
                      <button 
                        onClick={handleHireAgent}
                        disabled={installing}
                        className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] font-black text-lg flex items-center justify-center group transition-colors"
                      >
                         {installing ? (
                            <span className="animate-pulse">Deploying to Workspace...</span>
                         ) : (
                            <>
                               Hire This Assistant <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                         )}
                      </button>
                   )}
                   {!installed && (
                      <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                         Included with your Premium Platform subscription.<br/>Subject to AI token fair-use policies.
                      </p>
                   )}
                </div>
             </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
