import { motion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import Section from '../Section';
import Button from '../Button';
import GridPattern from '../GridPattern';

export default function SocialProofCTASection() {
  const testimonials = [
    {
      quote: " Bridgebox didn't sell us a generic tool. They instantaneously generated a logistics platform that perfectly matched our dispatching parameters. ",
      author: "Sarah J.",
      role: "Director of Operations",
      company: "Apex Freight"
    },
    {
      quote: " We deleted 4 different SaaS subscriptions the exact day we ran the Bridgebox compilation wizard. It holds our data natively and securely. ",
      author: "Marcus T.",
      role: "Managing Partner",
      company: "Torrance Law Group"
    }
  ];

  return (
    <>
       <Section background="darker" className="py-24">
         <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-white mb-2">Deployed Across Sectors</h2>
           <p className="text-slate-400">Generative operations are replacing legacy architecture everywhere.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {testimonials.map((t, i) => (
              <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.2 }}
                 className="bg-slate-900 border border-white/5 p-8 rounded-2xl relative"
              >
                 <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-800 pointer-events-none" />
                 <p className="text-slate-300 italic mb-6 relative z-10">"{t.quote}"</p>
                 <div className="border-t border-white/5 pt-4">
                    <div className="text-white font-bold">{t.author}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{t.company}</div>
                 </div>
              </motion.div>
            ))}
         </div>

         {/* Logo Placeholder Strip */}
         <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
             <div className="text-2xl font-black text-slate-500 tracking-tighter">FORWARD<span className="text-slate-300">LOGISTICS</span></div>
             <div className="text-xl font-bold text-slate-500 uppercase tracking-widest">Helix Analytics</div>
             <div className="text-2xl font-black text-slate-500">MERCATOR</div>
             <div className="text-xl font-medium text-slate-500">Vanguard Legal</div>
         </div>
       </Section>

       {/* Final Massive CTA */}
       <Section background="gradient" className="py-32 relative overflow-hidden border-t border-white/10">
         <GridPattern />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-0"></div>
         <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] -z-10 mix-blend-screen"></div>

         <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
            >
               <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">Generate Your System Now.</h2>
               <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                 Stop buying generic software licenses. Tell Bridgebox exactly what your industry requires, and deploy a bespoke, highly-performant OS in minutes.
               </p>
               <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                 <Button size="lg" to="/sales-onboarding" className="shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                   Build My Exact System <ArrowRight className="w-5 h-5 ml-2" />
                 </Button>
               </div>
               <p className="mt-6 text-sm text-slate-400">Multi-Tenant PostgreSQL • Native Mobile Sync • GPT-4o Embedded</p>
            </motion.div>
         </div>
       </Section>
    </>
  );
}
