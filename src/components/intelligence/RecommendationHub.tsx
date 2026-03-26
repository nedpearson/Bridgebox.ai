import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, AlertTriangle, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button';

// Ref: Insight & Recommendation schemas matching insightEngine.ts
interface Recommendation {
  id: string;
  insight_id: string;
  recommendation_type: string;
  title: string;
  action_payload: any;
  status: string;
  insight?: {
    description: string;
    metrics: any;
    category: string;
    impact_score: number;
  };
}

export default function RecommendationHub() {
  const { currentOrganization } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadRecommendations();
    }
  }, [currentOrganization]);

  const loadRecommendations = async () => {
    try {
      // Joins bb_tenant_insights visually to give context
      const { data, error } = await supabase
        .from('bb_tenant_recommendations')
        .select(`
          *,
          insight:bb_tenant_insights(description, metrics, category, impact_score)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Postgrest returns joined objects as arrays if not M:1, let's normalize:
      const normalizedData = (data || []).map(r => ({
        ...r,
        insight: Array.isArray(r.insight) ? r.insight[0] : r.insight
      }));

      setRecommendations(normalizedData as Recommendation[]);
    } catch (err) {
      console.error('Failed to load intelligence recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (rec: Recommendation, action: 'approved' | 'rejected') => {
    try {
      // 1. Optimistic UI update
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));

      // 2. Database update
      await supabase
        .from('bb_tenant_recommendations')
        .update({ status: action, acted_at: new Date().toISOString() })
        .eq('id', rec.id);

      // 3. Orchestration Trigger (If accepted, run the payload)
      if (action === 'approved') {
        executeRecommendationPayload(rec);
      }
    } catch (err) {
      console.error('Failed to process recommendation:', err);
      // Reload on error
      loadRecommendations();
    }
  };

  const executeRecommendationPayload = async (rec: Recommendation) => {
    console.log('Orchestrator firing for payload:', rec.action_payload);
    // Future Phase: Wire this directly into src/lib/intelligence/orchestrator.ts
    // orchestrator.execute(rec.action_payload);
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">System Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/20 rounded-xl p-5 relative group overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    {rec.insight?.category === 'revenue_opportunity' ? (
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    ) : rec.insight?.category === 'optimization' ? (
                      <Zap className="w-4 h-4 text-blue-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-300">New Insight</span>
                </div>
                <button 
                  onClick={() => handleAction(rec, 'rejected')}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-semibold text-white mb-2 leading-tight">
                {rec.insight?.description || 'Optimization found for your workspace.'}
              </h3>
              
              <p className="text-sm text-slate-400 mb-5">
                Suggested Action: {rec.title}
              </p>

              <button
                onClick={() => handleAction(rec, 'approved')}
                className="w-full flex items-center justify-between px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <span>Execute Recommendation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
