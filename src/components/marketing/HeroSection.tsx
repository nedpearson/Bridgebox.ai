import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Section from '../Section';
import GridPattern from '../GridPattern';
import Button from '../Button';
import DashboardMockup from '../DashboardMockup';

export default function HeroSection() {
  return (
    <Section background="gradient" className="pb-16 pt-32 relative overflow-hidden">
      <GridPattern />
      <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Copy: Value Proposition */}
        <div className="relative">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-bold backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>Bridgebox Enterprise OS Generator</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Launch Your Enterprise OS. Instantly.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
              Bridgebox generates your workflows, dashboards, mobile apps, and AI automation—tailored precisely to your industry format without writing a line of code.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row gap-4">
               <Button size="lg" to="/sales-onboarding" className="shadow-[0_0_30px_rgba(99,102,241,0.5)] bg-[#3B82F6] hover:bg-[#2563EB] border border-[#3B82F6]">
                  Acquire My Dashboard <ArrowRight className="ml-2 w-5 h-5" />
               </Button>
               <Button size="lg" variant="outline" to="/demo/general">
                  Enter Ghost Sandbox
               </Button>
            </motion.div>

            {/* Subtle Trust Indicators */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-start gap-8">
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-white">100+</span>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry Blueprints</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-white">IOS & Android</span>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Native PWA Ready</span>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Right Visual: Animated Product Preview */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }} className="relative lg:h-[600px] flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-sky-500/10 to-transparent blur-3xl -z-10 rounded-full"></div>
             {/* Using the pre-existing DashboardMockup as a high-fidelity visual translation core */}
             <div className="w-full transform perspective-1000 rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
               <DashboardMockup />
             </div>
        </motion.div>
        
      </div>
    </Section>
  );
}
