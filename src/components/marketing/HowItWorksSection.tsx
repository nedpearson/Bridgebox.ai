import { motion } from 'framer-motion';
import { Briefcase, Puzzle, Network, Rocket } from 'lucide-react';
import Section from '../Section';

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      icon: Briefcase,
      title: 'Choose Your Industry',
      description: 'Select your operational context (Law, Accounting, Logistics, Retail) to load baseline schemas instantly.'
    },
    {
      id: 2,
      icon: Puzzle,
      title: 'Customize Your Model',
      description: 'Toggle B2B SaaS, marketplace mechanics, or field services. Bridgebox rewrites the UI on the fly.'
    },
    {
      id: 3,
      icon: Network,
      title: 'Connect Your Tools',
      description: 'Bind existing systems like Stripe or QuickBooks into our background webhook synchronizer.'
    },
    {
      id: 4,
      icon: Rocket,
      title: 'Launch Your System',
      description: 'Generate web dashboards, mobile dispatcher apps, and AI agents instantly.'
    }
  ];

  return (
    <Section background="darker" className="py-24 border-y border-white/5 relative">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How It Works</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">From concept to functioning Enterprise OS in 4 visual steps.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 relative z-10 max-w-6xl mx-auto">
        {/* Connection Line */}
        <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 -z-10"></div>

        {steps.map((step, idx) => (
          <motion.div 
             key={step.id}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: idx * 0.15 }}
             className="relative flex flex-col items-center text-center group"
          >
            {/* Icon Pin */}
            <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/50 transition-all duration-300 relative z-10">
               <step.icon className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
               <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs font-black text-white">
                 {step.id}
               </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
