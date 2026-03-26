import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Briefcase, Building2, Truck, Scissors, HeartPulse, Sparkles, MonitorSmartphone } from 'lucide-react';
import Section from '../Section';
import Card from '../Card';

const INDUSTRIES = [
  { id: 'legal', icon: Scale, label: 'Legal Practice', color: 'bg-indigo-500/10 text-indigo-400', metrics: ['Caseload Tracking', 'Retainer Billing', 'Document AI Extraction'] },
  { id: 'accounting', icon: Briefcase, label: 'Accounting', color: 'bg-emerald-500/10 text-emerald-400', metrics: ['Forensic Workflows', 'Tax Pipeline AI', 'QuickBooks Bridge'] },
  { id: 'bridal', icon: Scissors, label: 'Bridal Boutique', color: 'bg-rose-500/10 text-rose-400', metrics: ['Inventory Mapping', 'Fittings Calendar', 'Mobile SMS Follow-ups'] },
  { id: 'logistics', icon: Truck, label: 'Logistics', color: 'bg-sky-500/10 text-sky-400', metrics: ['GPS Driver Apps', 'Load Boards', 'Freight Billing'] },
  { id: 'medspa', icon: HeartPulse, label: 'Med Spa', color: 'bg-fuchsia-500/10 text-fuchsia-400', metrics: ['Patient Portals', 'Appointment Logic', 'Consumable Inventory'] },
  { id: 'construction', icon: Building2, label: 'Contracting', color: 'bg-amber-500/10 text-amber-400', metrics: ['Job Costing', 'Field Worker App', 'Permit Tracking'] },
];

export default function IndustrySelectorSection() {
  const [activeIndustry, setActiveIndustry] = useState(INDUSTRIES[0]);

  return (
    <Section background="dark" className="py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Tailored to Your Operations</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Unlike generic software, Bridgebox builds the precise data schemas your specific industry requires instantly.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
        
        {/* Industry Grid Buttons */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setActiveIndustry(ind)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                activeIndustry.id === ind.id 
                  ? 'bg-slate-800 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                  : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${ind.color} flex items-center justify-center mb-3`}>
                <ind.icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-bold ${activeIndustry.id === ind.id ? 'text-white' : 'text-slate-400'}`}>
                {ind.label}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Preview Window */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndustry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Card glass className="h-full p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none"></div>
                
                <div>
                   <div className="flex items-center gap-3 mb-6">
                     <MonitorSmartphone className="w-8 h-8 text-indigo-400" />
                     <h3 className="text-2xl font-bold text-white tracking-tight">{activeIndustry.label} Architecture</h3>
                   </div>
                   
                   <p className="text-slate-400 mb-8 leading-relaxed">
                     When deployed, Bridgebox instantly compiles a custom database schema, native mobile routes, and automated logical triggers specifically designed for {activeIndustry.label} dynamics.
                   </p>

                   <div className="space-y-4 mb-8">
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Baseline Logic</div>
                     {activeIndustry.metrics.map((metric, i) => (
                       <div key={i} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-semibold text-slate-300">{metric}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Web App Generated</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Mobile App Generated</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>AI Copilot Bound</span>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </Section>
  );
}
