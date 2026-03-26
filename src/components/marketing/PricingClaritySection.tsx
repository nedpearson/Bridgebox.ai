import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Check } from 'lucide-react';
import Section from '../Section';
import Button from '../Button';

export default function PricingClaritySection() {
  const dynamicFactors = [
    { label: 'Industry Module Complexity', desc: 'Baseline database footprint and relational maps.' },
    { label: 'Dedicated AI Agents', desc: 'Number of autonomous Copilot synapses deployed.' },
    { label: 'Mobile PWA Requirements', desc: 'Staff App vs Customer VIP Portal routing.' },
    { label: 'Integration Sync Load', desc: 'Webhook processing volume (Stripe, Quickbooks).' }
  ];

  return (
    <Section background="dark" className="py-24 border-b border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Transparent, Compiled Pricing.</h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          You don't pay for bloat. The onboarding generator physically calculates your operational footprint and renders exact pricing before deploying.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
         
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="bg-slate-900/80 rounded-[2rem] border border-white/10 p-10 shadow-2xl relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl -m-20 rounded-full pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Base OS Architecture</h3>
            <p className="text-slate-400 mb-8">The foundational engine required to host your custom PostgreSQL tenant and React applications.</p>
            
            <div className="flex items-baseline gap-2 mb-8">
               <span className="text-5xl font-black text-white">$250</span>
               <span className="text-slate-500 font-bold">/month</span>
            </div>

            <div className="space-y-4 mb-10">
               {['Unlimited User Seats', 'Isolated Postgres Database Schema', 'White-labeled Domain Routing', 'SLA 99.9% Uptime SLA'].map((feature, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                     <Check className="w-3 h-3 text-emerald-400" />
                   </div>
                   <span className="text-slate-300 font-medium">{feature}</span>
                 </div>
               ))}
            </div>

            <Button size="lg" to="/sales-onboarding" className="w-full justify-center">Compile My Exact Price</Button>
         </motion.div>

         <div className="space-y-8">
            <div>
               <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                 <Plus className="w-3 h-3" />
                 <span>Dynamic Scaling Engine</span>
               </div>
               <h3 className="text-3xl font-bold text-white mb-4">You dictate the scale.</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                 Your final MRR is calculated deterministically during the generation wizard. If you don't need a Customer Mobile App, you don't pay for it.
               </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
               {dynamicFactors.map((factor, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-slate-900 border border-white/5 rounded-2xl"
                 >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5 mb-4">
                       <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{factor.label}</div>
                    <div className="text-xs text-slate-500">{factor.desc}</div>
                 </motion.div>
               ))}
            </div>
         </div>

      </div>
    </Section>
  );
}
