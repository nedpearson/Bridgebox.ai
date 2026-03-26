import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Star, Download, TrendingUp, Zap, Building2, Package, LayoutTemplate } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import TemplateDetailView from '../../components/marketplace/TemplateDetailView';
import AgentDetailView from '../../components/marketplace/AgentDetailView';

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', icon: Package },
    { id: 'industry_pack', label: 'Industry Packs', icon: Building2 },
    { id: 'workflow', label: 'Workflows', icon: TrendingUp },
    { id: 'ai_agent', label: 'AI Agents', icon: Zap },
    { id: 'premium_addon', label: 'Premium Add-ons', icon: ShoppingBag },
  ];

  useEffect(() => {
    loadMarketplace();
  }, [activeCategory]);

  const loadMarketplace = async () => {
    setLoading(true);
    
    try {
       if (activeCategory === 'ai_agent') {
         // Fetch AI Workers
         const { data, error } = await supabase
           .from('bb_agents')
           .select('*')
           .order('created_at', { ascending: false });
           
         if (error) throw error;
         
         // Normalize shape to match template grid
         const normalized = (data || []).map(agent => ({
             id: agent.id,
             category: agent.category,
             is_premium: true, // Agent packs are implicitly premium
             is_agent: true,
             install_count: Math.floor(Math.random() * 500) + 50, // Mock discovery installs
             average_rating: 4.9,
             bb_templates: {
                name: agent.name,
                description: agent.description,
                thumbnail_url: null
             }
         }));
         setTemplates(normalized);
       } else {
         // Fetch Workflows
         let query = supabase
           .from('bb_marketplace_templates')
           .select(`
             *,
             bb_templates(name, description, thumbnail_url),
             bb_organizations(name)
           `)
           .eq('is_published', true);

         if (activeCategory !== 'all') {
           query = query.eq('category', activeCategory);
         }

         const { data, error } = await query;
         if (error) throw error;
         
         const normalized = (data || []).map(t => ({ ...t, is_agent: false }));
         setTemplates(normalized);
       }
    } catch (err) {
       console.error("Failed to load marketplace data:", err);
    } finally {
       setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.bb_templates?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.bb_templates?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AppHeader 
        title="Template Marketplace"
        subtitle="Discover, install, and share high-performing ecosystem workflows."
      />

      <div className="p-8 space-y-8">
        
        {/* Marketplace Nav */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-slate-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#3B82F6] text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#1E293B] border border-slate-700/50 rounded-2xl overflow-hidden hover:border-[#3B82F6] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50 p-6 flex flex-col justify-between">
                  {template.is_premium ? (
                    <div className="self-end bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider relative z-10 shadow-lg">Premium</div>
                  ) : (
                    <div className="self-end bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-slate-600 relative z-10">Free</div>
                  )}
                  {template.is_agent ? (
                     <Zap className="w-12 h-12 text-[#3B82F6]/70 group-hover:text-[#3B82F6] transition-colors mx-auto" />
                  ) : (
                     <LayoutTemplate className="w-12 h-12 text-slate-500/50 group-hover:text-[#3B82F6]/50 transition-colors mx-auto" />
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    {template.category.replace('_', ' ')}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{template.bb_templates?.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {template.bb_templates?.description || template.best_use_case}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>{template.install_count} installs</span>
                    </div>
                    {template.average_rating > 0 && (
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{template.average_rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                   <button className={`px-6 py-2 text-white font-medium rounded-lg shadow-lg ${template.is_agent ? 'bg-[#3B82F6] hover:bg-[#2563EB]' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      {template.is_agent ? 'Deploy Assistant' : 'View Details'}
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedTemplate && (
        activeCategory === 'ai_agent' ? (
           <AgentDetailView 
             agentId={selectedTemplate} 
             onClose={() => setSelectedTemplate(null)} 
           />
        ) : (
           <TemplateDetailView 
             templateId={selectedTemplate} 
             onClose={() => setSelectedTemplate(null)} 
           />
        )
      )}
    </>
  );
}
