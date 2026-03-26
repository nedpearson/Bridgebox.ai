import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Zap, ArrowRight, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface UpgradeTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerContext: 'ai_limit' | 'user_limit' | 'workspace_limit' | 'feature_gate';
  featureName?: string;
  currentPlan: string;
  targetPlan: string;
  priceDelta: number;
}

const contextData = {
  ai_limit: {
    icon: Sparkles,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    title: 'Generative Quota Exhausted',
    desc: 'Your workspace has hit the maximum allowable generative AI payload for your current billing cycle.'
  },
  user_limit: {
    icon: Lock,
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10 border-[#3B82F6]/30',
    title: 'Seat Limit Reached',
    desc: 'You have provisioned the maximum number of user accounts allowable on this subscription tier.'
  },
  workspace_limit: {
    icon: Building2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    title: 'Tenant Capacity Exceeded',
    desc: 'You cannot spin up any additional master workspace instances without upgrading your infrastructure class.'
  },
  feature_gate: {
    icon: ShieldAlert,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
    title: 'Premium Entitlement Required',
    desc: 'Accessing advanced modules requires unlocking the specific entitlement gate via plan upgrade.'
  }
};

export default function UpgradeTriggerModal({ 
  isOpen, 
  onClose, 
  triggerContext, 
  featureName,
  currentPlan,
  targetPlan,
  priceDelta
}: UpgradeTriggerModalProps) {
  
  const ctx = contextData[triggerContext];
  const Icon = ctx.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
           onClick={onClose}
         />
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-lg"
         >
            <Card glass className="bg-slate-900 border border-white/10 p-1 relative overflow-hidden">
               {/* Abstract background flare */}
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#3B82F6]/20 blur-[100px] rounded-full pointer-events-none" />
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

               <div className="p-6 md:p-8 relative z-10">
                  <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                     <X className="w-4 h-4" />
                  </button>

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${ctx.bg}`}>
                     <Icon className={`w-7 h-7 ${ctx.color}`} />
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                     {featureName ? `Unlock ${featureName}` : ctx.title}
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-8">
                     {ctx.desc} Elevate your subscription to instantly resume operations and unlock unrestricted capabilities.
                  </p>

                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 mb-8">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                           <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Current State</div>
                           <div className="font-medium text-slate-300">{currentPlan}</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-600" />
                        <div className="text-right">
                           <div className="text-xs text-[#3B82F6] uppercase tracking-widest font-bold mb-1">Target Class</div>
                           <div className="font-bold text-white">{targetPlan}</div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400">Total Monthly Delta</span>
                        <div className="flex items-center">
                           <span className="text-xs text-slate-500 font-bold mr-1">+</span>
                           <span className="text-xl font-black text-white">${priceDelta}</span>
                           <span className="text-xs text-slate-500 font-medium ml-1">/mo</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <Button variant="outline" className="w-full justify-center" onClick={onClose}>
                        Maintain Limits
                     </Button>
                     <Button className="w-full justify-center bg-[#3B82F6] hover:bg-[#2563EB] border-transparent text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Zap className="w-4 h-4 mr-2" />
                        Execute Upgrade
                     </Button>
                  </div>
               </div>
            </Card>
         </motion.div>
       </div>
    </AnimatePresence>
  );
}
