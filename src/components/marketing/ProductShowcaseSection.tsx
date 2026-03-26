import { motion } from 'framer-motion';
import { Layers, MousePointer2 } from 'lucide-react';
import Section from '../Section';
import ProductDashboard from '../ProductDashboard';

export default function ProductShowcaseSection() {
  return (
    <Section background="darker" className="py-32 relative overflow-hidden">
      {/* Background Glare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="text-center mb-16 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full text-slate-300 text-sm font-bold backdrop-blur-sm">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>The Bridgebox Core Suite</span>
        </motion.div>
        
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">Enterprise Infrastructure In Zero Clicks</h2>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The moment you generate your workspace, Bridgebox compiles an elite suite of management tools instantly populated with logic specific to your industry. No setup friction.
        </p>
      </div>

      <div className="relative group max-w-6xl mx-auto">
         {/* Mouse Indicator */}
         <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-10 right-10 z-20 hidden lg:flex items-center gap-2"
         >
            <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 shadow-xl">Generated Dashboard</div>
            <MousePointer2 className="w-5 h-5 text-indigo-400 fill-indigo-500" />
         </motion.div>

         {/* Core Visualization */}
         <div className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <ProductDashboard />
         </div>
         
         <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl">
               <h4 className="text-white font-bold mb-2">Automated KPI Grids</h4>
               <p className="text-sm text-slate-400">Real-time revenue calculations, active pipeline value, and task completion metrics natively piped into Recharts sparklines.</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl">
               <h4 className="text-white font-bold mb-2">CRM Pipeline & Data Store</h4>
               <p className="text-sm text-slate-400">Strict PostgreSQL multi-tenant isolation guarding your pipeline, customer metadata, and transaction routing.</p>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-xl">
               <h4 className="text-white font-bold mb-2">Visual Logic Workflows</h4>
               <p className="text-sm text-slate-400">A deterministic rules engine executing if-then webhooks natively integrated out of the box.</p>
            </div>
         </div>
      </div>
    </Section>
  );
}
