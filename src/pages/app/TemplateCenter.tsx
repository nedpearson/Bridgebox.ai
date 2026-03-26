import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutTemplate, Briefcase, Puzzle, Settings2, Shield, Search, Filter } from 'lucide-react';
import { templateService, BridgeboxTemplate } from '../../lib/db/templates';
import Button from '../../components/Button';

const PageHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
    <p className="text-slate-400">{subtitle}</p>
  </div>
);

export default function TemplateCenter() {
  const [templates, setTemplates] = useState<BridgeboxTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'industry_pack' | 'business_overlay' | 'ai_generated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getPublishedTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
      <PageHeader 
        title="Template Center" 
        subtitle="Discover and instantly provision pre-built Industry Packs, overlays, and AI-generated business systems for your workspace." 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: AI Wizard Callout */}
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-8">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles className="w-64 h-64 text-indigo-300" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30 mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI Template Generator</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Describe your perfect operational system. Watch it build itself.</h2>
              <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                Skip the browsing. Tell our Intelligence Engine what industry you're in, upload an SOP, or describe your unique business model. Bridgebox will custom-architect the entities, workflows, forms, and permission roles for you.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={() => navigate('/app/templates/ai-wizard')} variant="primary" size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 border-none">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate with AI
                </Button>
                <Button variant="secondary" size="lg">Upload Custom SOP</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/50 p-4 border border-white/5 rounded-xl">
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
            {[
              { id: 'all', label: 'All Library' },
              { id: 'industry_pack', label: 'Industry Packs', icon: Briefcase },
              { id: 'business_overlay', label: 'Business Models', icon: LayoutTemplate },
              { id: 'ai_generated', label: 'AI Generated', icon: Sparkles }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {f.icon && <f.icon className="w-4 h-4" />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-500"
            />
          </div>
        </div>

        {/* Blueprint Grid */}
        {loading ? (
          <div className="lg:col-span-3 py-24 flex justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700/50 p-12 rounded-xl text-center">
            <LayoutTemplate className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bluepints found</h3>
            <p className="text-slate-400">Expand your search query or generate one via AI.</p>
          </div>
        ) : (
          filteredTemplates.map((template, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={template.id}
              className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl hover:bg-slate-900/80 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] transition-all flex flex-col justify-between"
            >
               <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link to={`/app/templates/${template.id}`}>
                    <Button variant="primary" size="sm" className="shadow-none">Preview Blueprint</Button>
                 </Link>
               </div>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-start">
                   <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400">
                     {template.category === 'industry_pack' ? <Briefcase className="w-6 h-6" /> : 
                      template.category === 'business_overlay' ? <Puzzle className="w-6 h-6" /> : 
                      <Sparkles className="w-6 h-6" />}
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1 pr-24 line-clamp-1">{template.name}</h3>
                   <div className="flex items-center space-x-2 text-xs font-bold mb-3">
                      <span className="text-indigo-400 capitalize tracking-wide">{template.category.replace('_', ' ')}</span>
                      {template.industry && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">{template.industry}</span>
                        </>
                      )}
                   </div>
                   <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                     {template.description || 'No description provided.'}
                   </p>
                   
                   {/* Phase 7: Deep Telemetry Transparency */}
                   <div className="space-y-3 pt-4 border-t border-white/5 mb-6">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-medium">Core Modules</span>
                           <span className="text-slate-300 font-bold">{template.modules?.length || 0} Included</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {template.modules?.slice(0, 3).map((mod: any, i: number) => (
                             <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">{mod.name}</span>
                          ))}
                          {(template.modules?.length || 0) > 3 && (
                             <span className="text-[10px] bg-slate-800/50 text-slate-500 px-2 py-1 rounded-md border border-transparent">+{template.modules.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      
                      {template.ai_agents && template.ai_agents.length > 0 && (
                        <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg">
                           <div className="flex items-center space-x-2">
                             <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                             <span className="text-xs text-indigo-300 font-medium">{template.ai_agents.length} Dedicated Agents</span>
                           </div>
                        </div>
                      )}
                   </div>
                 </div>
               </div>
               
               <div className="pt-4 flex flex-col space-y-2 text-xs text-slate-500 mt-auto">
                 {/* Best For Tagline */}
                 {template.target_personas && template.target_personas.length > 0 && (
                   <div className="flex flex-wrap items-center gap-1.5 pb-2">
                     <span className="font-semibold text-slate-400 tracking-wider text-[10px] uppercase">Best For:</span>
                     {template.target_personas.map((persona: string, idx: number) => (
                        <span key={idx} className="bg-white/5 px-2 rounded-md">{persona}</span>
                     ))}
                   </div>
                 )}
               
                 <div className="flex items-center justify-between border-t border-white/5 pt-3">
                   <div className="flex items-center space-x-1">
                     <Settings2 className="w-4 h-4" />
                     <span>Build {template.version}</span>
                   </div>
                   
                   {template.billing_rules?.base_plan_requirement ? (
                     <div className="flex items-center space-x-1 font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg border border-amber-500/20">
                       <Shield className="w-3.5 h-3.5" />
                       <span className="capitalize">{template.billing_rules.base_plan_requirement} Required</span>
                     </div>
                   ) : (
                     <div className="flex items-center space-x-1 font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg border border-emerald-500/20">
                       <Shield className="w-3.5 h-3.5" />
                       <span>Free Tier Ready</span>
                     </div>
                   )}
                 </div>
               </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
