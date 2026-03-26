import { useState, useEffect } from 'react';
import { Network, ArrowRight, Share2, PlusCircle, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { networkRecommendationsService } from '../../lib/intelligence/networkRecommendations';
import TemplateDetailView from '../marketplace/TemplateDetailView';

export default function EcosystemRecommendationsPanel() {
  const { currentOrganization } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [currentOrganization]);

  const loadRecommendations = async () => {
    if (!currentOrganization) return;
    try {
      setLoading(true);
      const data = await networkRecommendationsService.getNextBestActions(currentOrganization.id);
      setRecommendations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <>
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden mt-6 shadow-xl">
        <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-600/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Ecosystem Intelligence</h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Smart Path
          </span>
        </div>

        <div className="p-4 space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
               key={rec.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className="group relative bg-slate-900 border border-slate-700 hover:border-emerald-500/50 p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-800"
               onClick={() => setSelectedTemplate(rec.id)}
            >
               <div className="flex gap-3">
                 <div className="mt-0.5 bg-slate-800 p-1.5 rounded-md border border-slate-700 group-hover:border-emerald-500/30 transition-colors">
                   <LayoutTemplate className="w-4 h-4 text-emerald-400/70" />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-semibold text-white mb-0.5 line-clamp-1">{rec.title}</h4>
                   <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                     {rec.description}
                   </p>
                   
                   <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                     <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                       <Share2 className="w-3 h-3" />
                       <span className="line-clamp-1">{rec.socialProof}</span>
                     </div>
                     <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 duration-200" />
                   </div>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <TemplateDetailView 
          templateId={selectedTemplate} 
          onClose={() => setSelectedTemplate(null)} 
        />
      )}
    </>
  );
}
