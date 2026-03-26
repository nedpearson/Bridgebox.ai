import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Workflow, Database, Cpu, Search, AlertCircle, PlusCircle } from 'lucide-react';
import { aiService } from '../../lib/ai/services/aiService';

interface AiIntelligencePaneProps {
  rawContext: string;
}

export default function AiIntelligencePane({ rawContext }: AiIntelligencePaneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [intelligence, setIntelligence] = useState<any>(null);
  
  const isTyping = rawContext.trim().length > 0;

  useEffect(() => {
    if (!isTyping) {
        setIntelligence(null);
        return;
    }

    const timer = setTimeout(async () => {
        setIsProcessing(true);
        try {
           const response = await aiService.generateOnboardingIntelligence(rawContext);
           if (response.success && response.data) {
               setIntelligence(response.data);
           }
        } catch (err) {
           console.error('Intelligence Engine Error:', err);
        } finally {
           setIsProcessing(false);
        }
    }, 1500);

    return () => clearTimeout(timer);
  }, [rawContext, isTyping]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-[#3B82F6]/20 rounded-lg">
          <Cpu className="w-6 h-6 text-[#3B82F6]" />
        </div>
        <h2 className="text-2xl font-bold text-white">Live Engine Translation</h2>
      </div>

      <AnimatePresence mode="wait">
        {!isTyping ? (
           <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
           >
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center relative">
                <Network className="w-6 h-6 text-slate-500 absolute" />
             </div>
             <p className="text-slate-500 max-w-sm">
                Start typing or speaking on the left. The engine will automatically interpret and design your system graph here in real-time.
             </p>
           </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
             {/* Dynamic Structured Outputs */}
             {isProcessing && !intelligence && (
                 <div className="flex items-center justify-center p-6 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl border border-[#3B82F6]/20">
                     <Search className="w-5 h-5 mr-3 animate-spin duration-3000" />
                     Extracting global vectors...
                 </div>
             )}

             {intelligence && (
                 <>
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-emerald-400 font-medium tracking-wide text-sm uppercase">Detected Architectures</h3>
                    {intelligence.detected_workflows?.map((wf: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                            <div className="flex items-center">
                                <Workflow className="w-5 h-5 text-slate-400 mr-3" />
                                <span className="text-slate-300">{wf.name}</span>
                            </div>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">{wf.status || 'Detected'}</span>
                        </div>
                    ))}
                    {intelligence.suggested_features?.map((feat: any, idx: number) => (
                        <div key={`feat-${idx}`} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                            <div className="flex items-center">
                                <PlusCircle className="w-5 h-5 text-slate-400 mr-3" />
                                <span className="text-slate-300">{feat.name}</span>
                            </div>
                            <span className="px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs rounded-full">{feat.status || 'Proposed'}</span>
                        </div>
                    ))}
                 </div>
                 
                 {intelligence.missing_gaps && intelligence.missing_gaps.length > 0 && (
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-amber-400 font-medium tracking-wide text-sm uppercase">Missing Intelligence Gaps</h3>
                    {intelligence.missing_gaps.map((gap: any, idx: number) => (
                        <div key={idx} className="flex items-start">
                           <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                           <div>
                              <p className="text-slate-300 font-medium">{gap.name}</p>
                              <p className="text-sm text-slate-400 mt-1">{gap.description}</p>
                           </div>
                        </div>
                    ))}
                 </div>
                 )}
                 </>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
