import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Inbox, AlertTriangle, ShieldAlert, Bot, Clock, ArrowRight } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// In a real implementation this would invoke the ActionExecutor service
// For purely frontend demonstration, we execute by updating the database status directly.
const triggerActionExecution = async (queueId: string, actionName: string, payload: any) => {
   console.log(`Executing ${actionName} with payload`, payload);
   // Simulated gateway delay
   await new Promise(r => setTimeout(r, 800));
};

export default function AgentInbox() {
  const { currentOrganization } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) loadInbox();
  }, [currentOrganization]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bb_agent_actions_queue')
        .select(`
          id,
          proposed_action,
          payload,
          explanation,
          confidence_score,
          risk_level,
          created_at,
          bb_tenant_agents (
            id,
            bb_agents ( name, category )
          )
        `)
        .eq('organization_id', currentOrganization?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      else setActions(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (action: any) => {
    try {
      setProcessingId(action.id);
      
      // Execute standard action
      await triggerActionExecution(action.id, action.proposed_action, action.payload);

      // Mark Approved & Executed
      await supabase
        .from('bb_agent_actions_queue')
        .update({ status: 'executed', updated_at: new Date().toISOString() })
        .eq('id', action.id);
      
      setActions(prev => prev.filter(a => a.id !== action.id));
    } catch (err) {
      console.error(err);
      alert('Failed to execute agent action.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (actionId: string) => {
    try {
      setProcessingId(actionId);
      await supabase
        .from('bb_agent_actions_queue')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', actionId);
      
      setActions(prev => prev.filter(a => a.id !== actionId));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-500/30';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Agent Inbox"
        subtitle="Review, modify, or approve actions drafted by your Autonomous Agents."
      />
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <Card className="p-12 text-center bg-slate-900 border-slate-800 flex flex-col justify-center items-center">
             <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                 <Inbox className="w-10 h-10 text-slate-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Inbox Zero</h2>
             <p className="text-slate-400 max-w-sm">
               Your agents have no pending actions requiring human oversight at this time.
             </p>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {actions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden group">
                     {/* Action Header */}
                     <div className="p-4 border-b border-slate-800/80 bg-slate-900 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                             <Bot className="w-5 h-5 text-blue-400" />
                           </div>
                           <div>
                             <h4 className="text-white font-bold text-sm">{action.bb_tenant_agents?.bb_agents?.name || 'System Agent'}</h4>
                             <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                               {action.bb_tenant_agents?.bb_agents?.category || 'Operation'} 
                               <span>•</span>
                               <span className="text-slate-500 flex items-center">
                                 <Clock className="w-3 h-3 mr-1" />
                                 {new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                             </p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${getRiskColor(action.risk_level)}`}>
                             {action.risk_level} Risk
                           </div>
                           <div className="flex items-center text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                             {Math.round(action.confidence_score * 100)}% Confidence
                           </div>
                        </div>
                     </div>

                     {/* Action Content */}
                     <div className="p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex-1">
                           <div className="flex items-start gap-4 mb-3">
                             <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                   Proposes: <span className="text-indigo-500">{action.proposed_action}</span>
                                </h3>
                                <p className="text-sm text-slate-300">
                                   "{action.explanation}"
                                </p>
                             </div>
                           </div>
                           
                           <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 max-h-32 overflow-y-auto">
                              <pre className="text-xs text-slate-400 font-mono">
                                {JSON.stringify(action.payload, null, 2)}
                              </pre>
                           </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex md:flex-col gap-2 w-full md:w-40 flex-shrink-0">
                           <button
                             onClick={() => handleApprove(action)}
                             disabled={processingId === action.id}
                             className="flex-1 md:w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg flex items-center justify-center font-medium transition-colors"
                           >
                             {processingId === action.id ? (
                               <Clock className="w-4 h-4 animate-spin" />
                             ) : (
                               <>
                                 <Check className="w-4 h-4 mr-2" />
                                 Approve
                               </>
                             )}
                           </button>
                           
                           <button
                             onClick={() => handleReject(action.id)}
                             disabled={processingId === action.id}
                             className="flex-1 md:w-full py-2.5 px-4 bg-slate-800 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg flex items-center justify-center font-medium transition-colors"
                           >
                             <X className="w-4 h-4 mr-2" />
                             Reject
                           </button>
                        </div>
                     </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
