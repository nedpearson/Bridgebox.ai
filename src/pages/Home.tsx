import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Layout, Database, Workflow, Activity, Sparkles, Server } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardMockup from '../components/DashboardMockup';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { SEO } from '../components/seo/SEO';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bridgebox AI",
    "url": "https://bridgebox.ai",
    "logo": "https://bridgebox.ai/image.png",
    "description": "Build custom AI-powered workflows, automate your business, and connect all your systems in one platform."
  };

  const capabilities = [
    { icon: Workflow, title: "AI Workflow Automation" },
    { icon: Layout, title: "Custom Software Creation" },
    { icon: Database, title: "Multi-System Integration" },
    { icon: Sparkles, title: "Voice-to-Build Technology" },
    { icon: Server, title: "Screen Recording → System Design" },
    { icon: Activity, title: "Real-Time Analytics & Control" },
  ];

  const outcomes = [
    "Reduce manual work by up to 70%",
    "Eliminate repetitive tasks",
    "Unify operations into a single system",
    "Scale without hiring additional staff"
  ];

  const useCases = [
    "Automate client onboarding",
    "Connect CRM + accounting systems",
    "Build internal dashboards",
    "Automate approvals and workflows",
    "Create custom operational tools"
  ];

  const faqs = [
    { question: "Do I need coding experience?", answer: "No. Bridgebox is designed for business users." },
    { question: "How long does it take to implement?", answer: "Most systems are structured and deployed significantly faster than traditional development." },
    { question: "What tools can you integrate?", answer: "CRM, accounting, communication tools, databases, and custom APIs." },
    { question: "Is this better than Zapier?", answer: "Bridgebox goes beyond integrations—we create complete operational systems." }
  ];

  return (
    <>
      <SEO 
        title="AI Workflow Automation Platform for Custom Business Software | Bridgebox.ai"
        description="Build custom AI-powered workflows, automate your business, and connect all your systems in one platform. No coding required. Book a demo today."
        canonicalUrl="/"
        jsonLdSchema={schema}
      />
      <div className="pt-20 bg-slate-950 font-sans text-slate-300 overflow-x-hidden">
        
        {/* Hero Section */}
        <Section background="gradient" className="pt-32 pb-24 relative overflow-hidden">
          <GridPattern />
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10 max-w-7xl mx-auto px-6">
            <div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-bold backdrop-blur-sm"
              >
                 <Sparkles className="w-4 h-4" />
                 <span>Stop forcing your business into software that doesn't fit</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
              >
                AI Workflow Automation Platform Built for Your Business
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl"
              >
                Bridgebox builds <strong>custom AI-powered systems</strong> that automate your workflows, connect your tools, and eliminate manual work—without traditional development delays.<br/><br/>
                Build exactly what your business needs. Faster.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" to="/sales-onboarding" className="bg-indigo-500 hover:bg-indigo-600 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                  Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" to="/platform">
                  See How It Works
                </Button>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.4 }}
              className="relative lg:h-[600px] flex items-center justify-center transform perspective-1000 rotate-y-[-10deg] hover:rotate-y-0 transition-transform duration-700"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-sky-500/10 to-transparent blur-3xl -z-10 rounded-full"></div>
               <DashboardMockup />
            </motion.div>
          </div>
        </Section>

        {/* The Problem */}
        <Section background="dark" className="py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">The Problem</h2>
            <p className="text-xl text-slate-400">Most businesses rely on disconnected tools</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-6">
             <Card glass hover>
                <h3 className="text-xl font-bold text-white mb-6">Fragmented Systems</h3>
                <ul className="space-y-4 text-slate-300">
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 mr-3 text-sm">✗</span> CRM in one place</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 mr-3 text-sm">✗</span> Accounting in another</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 mr-3 text-sm">✗</span> Operations handled manually</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 mr-3 text-sm">✗</span> Data duplicated everywhere</li>
                </ul>
             </Card>
             <Card glass hover>
                <h3 className="text-xl font-bold text-white mb-6">This Leads To</h3>
                 <ul className="space-y-4 text-slate-300">
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mr-3 text-sm">!</span> Wasted time</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mr-3 text-sm">!</span> Human error</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mr-3 text-sm">!</span> Slow operations</li>
                   <li className="flex items-center"><span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mr-3 text-sm">!</span> Poor visibility</li>
                </ul>
             </Card>
          </div>
        </Section>

        {/* The Bridgebox Solution */}
        <Section background="darker" className="py-24 border-t border-slate-800">
           <div className="text-center max-w-3xl mx-auto mb-16 px-6">
            <h2 className="text-4xl font-bold text-white mb-6">The Bridgebox Solution</h2>
            <p className="text-xl text-slate-400">Bridgebox replaces fragmented systems with a <strong>unified automation platform</strong>.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
              <Card glass hover className="text-center group"><CheckCircle2 className="w-10 h-10 text-indigo-400 mb-6 mx-auto group-hover:scale-110 transition-transform"/><p className="text-lg text-slate-200">Connect your existing software</p></Card>
              <Card glass hover className="text-center group"><CheckCircle2 className="w-10 h-10 text-indigo-400 mb-6 mx-auto group-hover:scale-110 transition-transform"/><p className="text-lg text-slate-200">Automate workflows end-to-end</p></Card>
              <Card glass hover className="text-center group"><CheckCircle2 className="w-10 h-10 text-indigo-400 mb-6 mx-auto group-hover:scale-110 transition-transform"/><p className="text-lg text-slate-200">Build custom internal tools tailored to your business</p></Card>
              <Card glass hover className="text-center group"><CheckCircle2 className="w-10 h-10 text-indigo-400 mb-6 mx-auto group-hover:scale-110 transition-transform"/><p className="text-lg text-slate-200">Eliminate repetitive tasks using AI</p></Card>
          </div>
        </Section>

        {/* How It Works */}
        <Section background="gradient" className="py-24 relative">
           <div className="absolute inset-0 bg-slate-900/90 mask-image-gradient"></div>
           <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative z-10 max-w-6xl mx-auto text-center px-6">
              <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 -z-10"></div>
              
              <div className="relative">
                 <div className="w-14 h-14 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">1</div>
                 <p className="text-slate-300">You describe your workflow (voice, text, or screen recording)</p>
              </div>
              <div className="relative">
                 <div className="w-14 h-14 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">2</div>
                 <p className="text-slate-300">Bridgebox analyzes and structures your system</p>
              </div>
              <div className="relative">
                 <div className="w-14 h-14 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">3</div>
                 <p className="text-slate-300">We build your automation environment</p>
              </div>
              <div className="relative">
                 <div className="w-14 h-14 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xl mx-auto mb-6 shadow-lg shadow-emerald-500/20">4</div>
                 <p className="text-slate-300">Your business runs faster, with less manual work</p>
              </div>
          </div>
        </Section>

        {/* Core Capabilities & Real Outcomes & Use cases */}
        <Section background="dark" className="py-24 border-y border-slate-800">
           <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto px-6">
               <div>
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Core Capabilities</h3>
                  <ul className="space-y-5">
                     {capabilities.map(cap => <li key={cap.title} className="flex items-center text-slate-300 hover:text-white transition-colors"><div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mr-4"><cap.icon className="w-4 h-4 text-indigo-400"/></div> {cap.title}</li>)}
                  </ul>
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Real Outcomes</h3>
                  <ul className="space-y-6">
                     {outcomes.map((out, idx) => (
                       <li key={idx} className="flex items-start text-slate-300">
                         <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-4 shrink-0 mt-0.5"/>
                         <span className="leading-relaxed">{out}</span>
                       </li>
                     ))}
                  </ul>
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Use Cases</h3>
                  <ul className="space-y-6">
                     {useCases.map((uc, idx) => (
                       <li key={idx} className="flex items-start text-slate-300">
                         <ArrowRight className="w-6 h-6 text-indigo-400 mr-4 shrink-0 mt-0.5"/>
                         <span className="leading-relaxed">{uc}</span>
                       </li>
                     ))}
                  </ul>
               </div>
           </div>
        </Section>

        {/* Why Bridgebox is Different */}
        <Section background="darker" className="py-24">
           <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-6">Why Bridgebox is Different</h2>
              </div>
              <Card glass className="p-8 md:p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10"></div>
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Unlike Zapier or Make:</h3>
                 <ul className="space-y-6 mb-10">
                    <li className="flex items-start text-lg md:text-xl text-slate-300"><span className="text-indigo-400 mr-4 font-bold text-2xl leading-none">•</span> We don't just connect tools—we build systems</li>
                    <li className="flex items-start text-lg md:text-xl text-slate-300"><span className="text-indigo-400 mr-4 font-bold text-2xl leading-none">•</span> We don't require complex setups</li>
                    <li className="flex items-start text-lg md:text-xl text-slate-300"><span className="text-indigo-400 mr-4 font-bold text-2xl leading-none">•</span> We don't limit you to predefined workflows</li>
                 </ul>
                 <div className="p-6 bg-slate-900 border border-slate-700/50 rounded-xl relative">
                    <p className="text-xl md:text-2xl font-medium text-white italic text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">
                      "Bridgebox adapts to your business—not the other way around."
                    </p>
                 </div>
              </Card>
           </div>
        </Section>

        {/* FAQ */}
        <Section background="dark" className="py-24 border-t border-slate-800">
           <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-bold text-white mb-4">FAQ</h2>
              </div>
              <div className="grid gap-6">
                 {faqs.map((faq, idx) => (
                    <Card key={idx} glass className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                        <p className="text-slate-300 tracking-wide leading-relaxed">{faq.answer}</p>
                    </Card>
                 ))}
              </div>
           </div>
        </Section>

        {/* Final CTA */}
        <FinalCTA 
          headline="Stop working around your software. Start building software around your business."
          subtext=""
        />
        
      </div>
    </>
  );
}
