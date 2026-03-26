import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ArrowRight } from 'lucide-react';
import Section from '../Section';
import Button from '../Button';

export default function InstantDemoSection() {
  const [demoState, setDemoState] = useState<'idle' | 'generating' | 'complete'>('idle');

  // Simulator hook
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoState === 'generating') {
      timer = setTimeout(() => {
        setDemoState('complete');
      }, 3500); // 3.5s simulated compilation wait
    }
    return () => clearTimeout(timer);
  }, [demoState]);

  return (
    <Section background="dark" className="py-32 relative overflow-hidden border-y border-white/5">
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-indigo-500/10 blur-[120px] -z-10 pointer-events-none"></div>

       <div className="max-w-4xl mx-auto text-center relative z-10">
         <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">See It Compile. Instantly.</h2>
         <p className="text-xl text-slate-400 mb-12 leading-relaxed">
            Experience the OS Generation engine locally without creating an account. Watch Bridgebox write a custom frontend schema in real-time.
         </p>

         <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-2 shadow-2xl overflow-hidden relative min-h-[400px]">
            <AnimatePresence mode="wait">
               
               {/* State 1: Start Demo */}
               {demoState === 'idle' && (
                 <motion.div 
                   key="idle"
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/50 backdrop-blur-sm"
                 >
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 cursor-pointer hover:bg-indigo-500/40 hover:scale-110 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                         onClick={() => setDemoState('generating')}
                    >
                       <Play className="w-8 h-8 text-indigo-400 ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Run Demo Compilation</h3>
                    <p className="text-slate-400">Initialize a simulated 'Logistics' Enterprise OS Payload.</p>
                 </motion.div>
               )}

               {/* State 2: Generating Engine UX */}
               {demoState === 'generating' && (
                 <motion.div 
                   key="generating"
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950"
                 >
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-6" />
                    <div className="space-y-3 w-full max-w-sm">
                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                          <span>Writing PostgreSQL Sub-Schemas</span>
                          <span className="text-emerald-400">OK</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }} className="h-full bg-emerald-500" />
                       </div>

                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase pt-2">
                          <span>Rendering Delivery Client Interfaces</span>
                          <span className="text-emerald-400">OK</span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-emerald-500" />
                       </div>

                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase pt-2">
                          <span>Mapping Route AI Synapses</span>
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-indigo-400">LINKED</motion.span>
                       </div>
                       <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, delay: 1.5 }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                       </div>
                    </div>
                 </motion.div>
               )}

               {/* State 3: Complete Validation */}
               {demoState === 'complete' && (
                 <motion.div 
                   key="complete"
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-900 border border-emerald-500/30"
                 >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                       <Play className="w-8 h-8 text-emerald-400 transform rotate-90" /> {/* Just a visual check icon analog */}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Compilation Successful</h3>
                    <p className="text-slate-400 mb-8 max-w-sm">
                       A 'Logistics-Tier' operational architecture has been compiled in memory. In production, this permanently replaces your blank workspace.
                    </p>
                    <div className="flex gap-4">
                       <Button size="lg" to="/sales-onboarding">Build For Real <ArrowRight className="w-4 h-4 ml-2" /></Button>
                       <Button size="lg" variant="outline" onClick={() => setDemoState('idle')}>Reset Simulator</Button>
                    </div>
                 </motion.div>
               )}

            </AnimatePresence>
         </div>
       </div>
    </Section>
  );
}
