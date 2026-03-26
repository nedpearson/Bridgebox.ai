import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: 'Starter' | 'Growth' | 'Professional' | 'Enterprise';
  customDescription?: string;
  modalType?: 'feature' | 'limit';
  actionType?: 'self-serve' | 'sales';
}

export default function UpgradeModal({ 
  isOpen, onClose, featureName, requiredPlan, customDescription,
  modalType = 'feature', actionType = 'self-serve' 
}: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="w-full max-w-lg bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
             
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-500" />
               </div>
               <h3 className="text-xl font-bold text-white">
                 {modalType === 'limit' ? 'Limit Reached' : 'Upgrade Required'}
               </h3>
             </div>
             
             <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors relative z-10">
               <X className="w-5 h-5" />
             </button>
          </div>

          {/* Body */}
          <div className="p-8">
             <h4 className="text-xl font-medium text-white mb-2">
                 {modalType === 'limit' ? 'Expand ' : 'Unlock '}<span className="text-amber-400 font-bold">{featureName}</span>
             </h4>
             <p className="text-slate-400 mb-6 leading-relaxed">
                 {customDescription || (modalType === 'limit' 
                    ? `You have reached the maximum allowance for your current plan. Upgrade to ${requiredPlan} to lift this restriction.`
                    : `This feature requires the ${requiredPlan} plan. Upgrade your workspace to instantly access this module and accelerate your business.`)}
             </p>

             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
                <p className="text-sm font-semibold text-white mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2"/> The {requiredPlan} Plan includes:</p>
                <ul className="space-y-2 text-sm text-slate-300">
                   {requiredPlan === 'Professional' && (
                     <>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Advanced CI/CD Workflows</li>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Premium Industry Templates</li>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> 1TB Secure Storage</li>
                     </>
                   )}
                   {requiredPlan === 'Enterprise' && (
                     <>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Unlimited AI Generative Drafting</li>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Native iOS & Android Apps</li>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Dedicated Support Specialist</li>
                     </>
                   )}
                   {requiredPlan === 'Starter' && (
                     <>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> Core CRM & Workflows</li>
                       <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#10B981] mr-2"/> 5 Team Members</li>
                     </>
                   )}
                </ul>
             </div>

             <div className="flex space-x-3">
                <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all">
                  Cancel
                </button>
                {actionType === 'self-serve' ? (
                  <button 
                    onClick={() => {
                       onClose();
                       navigate('/pricing');
                    }} 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  >
                    View Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <a 
                    href="mailto:sales@bridgebox.ai?subject=Enterprise%20Upgrade%20Request"
                    onClick={() => onClose()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    Contact Sales <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                )}
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
