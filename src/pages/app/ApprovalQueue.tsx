import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Inbox, AlertTriangle, Bot, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper to translate raw JSON payloads into human-readable business context
const renderHumanPayload = (actionName: string, payload: any) => {
   if (actionName.includes('email')) {
      return (
         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-500 mb-2 font-mono border-b border-slate-800 pb-2">
               To: {payload.targetEmail || 'Client'}<br/>
               Subject: {payload.subject || 'Follow Up'}
            </div>
            <p className="text-sm text-slate-300 italic">
               "{payload.bodyContext || 'Template body content goes here...'}"
            </p>
         </div>
      );
   }

   if (actionName.includes('invoice') || actionName.includes('billing')) {
      return (
         <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
            <div className="text-sm text-emerald-400 font-bold mb-1">Financial Operation</div>
            <div className="text-xs text-slate-400">
               Target Entity: {payload.invoiceId || payload.targetId || 'Unknown ID'} <br/>
               Amount Focus: ${payload.amount || 'N/A'}
            </div>
         </div>
      );
   }

   return (
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 whitespace-pre-wrap">
         {JSON.stringify(payload, null, 2)}
      </div>
   );
};

export default function ApprovalQueue() {
  const { currentOrganization } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) loadQueue();
  }, [currentOrganization]);

  const loadQueue = async () => {
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
      
      // Execute standard action internally (mocked gateway delay)
      await new Promise(r => setTimeout(r, 800));

      await supabase
        .from('bb_agent_actions_queue')
        .update({ status: 'executed', updated_at: new Date().toISOString() })
        .eq('id', action.id);
      
      setActions(prev => prev.filter(a => a.id !== action.id));
    } catch (err) {
      console.error(err);
      alert('Failed to authorize action.');
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

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Approval Queue"
        subtitle="Review, authorize, or dismiss actions proposed by your Suggest-Only AI Assistants."
      />
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <Card className="p-16 text-center bg-slate-900 border-slate-800 flex flex-col justify-center items-center">
             <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-12 h-12 text-emerald-500/50" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Queue is Empty</h2>
             <p className="text-slate-400 max-w-sm">
               Your assistants have no pending operations requiring human oversight at this time.
             </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {actions.map((action) => {
                 const isHighConfidence = action.confidence_score >= 0.90;

                 return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`bg-slate-900 shadow-xl overflow-hidden group border transition-all ${isHighConfidence ? 'border-blue-500/30 hover:border-blue-500/50' : 'border-slate-800'}`}>
                       {/* Action Header */}
                       <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                               <Bot className="w-5 h-5 text-blue-400" />
                             </div>
                             <div>
                               <h4 className="text-white font-bold text-sm">{action.bb_tenant_agents?.bb_agents?.name || 'Digital Assistant'}</h4>
                               <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 capitalize">
                                 {action.bb_tenant_agents?.bb_agents?.category?.replace('_', ' ') || 'Operation'} 
                                 <span>•</span>
                                 <span className="text-slate-500 flex items-center">
                                   <Clock className="w-3 h-3 mr-1" />
                                   Drafted today at {new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                               </p>
                             </div>
                          </div>

                          {isHighConfidence && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                               <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                               <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400">High Confidence Recommendation</span>
                             </div>
                          )}
                       </div>

                       {/* Action Context (The WHY) */}
                       <div className="p-6">
                          <div className="mb-6 flex gap-4 items-start">
                             <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${action.risk_level === 'high' ? 'text-orange-400' : 'text-slate-500'}`} />
                             <div>
                                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">AI Reasoning (The Why)</h5>
                                <p className="text-base text-slate-200 leading-relaxed font-medium">
                                   "{action.explanation}"
                                </p>
                             </div>
                          </div>

                          <div className="mb-6 flex gap-4 items-start">
                             <ArrowRight className="w-5 h-5 flex-shrink-0 mt-2 text-indigo-500" />
                             <div className="flex-1">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Proposed Execution (The What)</h5>
                                
                                {/* Human Readable Payload Mapping */}
                                {renderHumanPayload(action.proposed_action, action.payload)}

                             </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                             <button
                               onClick={() => handleApprove(action)}
                               disabled={processingId === action.id}
                               className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center font-bold tracking-wide transition-colors shadow-lg shadow-emerald-500/20"
                             >
                               {processingId === action.id ? (
                                 <Clock className="w-5 h-5 animate-spin" />
                               ) : (
                                 <>
                                   <Check className="w-5 h-5 mr-2" />
                                   Approve & Execute
                                 </>
                               )}
                             </button>
                             
                             <button
                               onClick={() => handleReject(action.id)}
                               disabled={processingId === action.id}
                               className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold tracking-wide transition-colors"
                             >
                               <X className="w-5 h-5 mr-2" />
                               Dismiss
                             </button>
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                 );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
