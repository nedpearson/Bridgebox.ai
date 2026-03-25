import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Link as LinkIcon, Box, CheckCircle2 } from 'lucide-react';
import Button from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { globalSearchService, SearchResult } from '../../lib/db/search';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';

interface EntityLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  onLinkComplete: () => void;
}

export default function EntityLinkModal({ isOpen, onClose, entityType, entityId, onLinkComplete }: EntityLinkModalProps) {
  const { currentOrganization } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2 && currentOrganization?.id) {
        setLoading(true);
        try {
          // We exclude the current entity from results to prevent self-binding
          let data = await globalSearchService.search(currentOrganization.id, query);
          data = data.filter(d => !(d.type === entityType && d.id === entityId));
          setResults(data);
        } catch (err) {
          console.error('Search failed', err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, currentOrganization?.id, entityType, entityId]);

  if (!isOpen) return null;

  const handleBind = async (target: SearchResult) => {
    if (!currentOrganization?.id) return;
    try {
      setSubmitting(true);
      setError(null);

      await entityLinkService.linkEntities({
        tenant_id: currentOrganization.id,
        source_type: entityType,
        source_id: entityId,
        target_type: target.type,
        target_id: target.id,
        relationship_type: 'related_to'
      });

      onLinkComplete();
      onClose();
    } catch (err: any) {
      console.error('Failed to bind entity:', err);
      // Postgres unique violation means it's already linked
      if (err.code === '23505') {
        setError('This relationship already exists.');
      } else {
        setError(err.message || 'Failed to establish relationship matrix constraint.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'organization': return <Box className="w-5 h-5 text-indigo-400" />;
      case 'project': return <Box className="w-5 h-5 text-emerald-400" />;
      case 'task': return <CheckCircle2 className="w-5 h-5 text-amber-400" />;
      default: return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Bind New Entity</h2>
              <p className="text-sm text-slate-400 mt-1 capitalize">Expand topology for {entityType}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 shrink-0 relative">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
               <input
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 autoFocus
                 placeholder="Search Clients, Projects, Tasks..."
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
               />
               {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />}
             </div>
             
             {error && (
               <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-start">
                 <X className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                 {error}
               </div>
             )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {query.length < 2 ? (
               <div className="text-center py-10">
                 <LinkIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                 <p className="text-slate-400">Type to search the universal index...</p>
               </div>
            ) : results.length > 0 ? (
               <div className="space-y-2">
                 {results.map((result) => (
                   <button
                     key={result.id}
                     onClick={() => handleBind(result)}
                     disabled={submitting}
                     className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all flex items-center justify-between group"
                   >
                     <div className="flex items-center space-x-4 overflow-hidden">
                        <div className="p-2 bg-slate-800 group-hover:bg-slate-900 rounded-lg shrink-0 transition-colors">
                          {getIcon(result.type)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-white truncate">{result.title}</h4>
                          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                        </div>
                     </div>
                     <LinkIcon className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-4" />
                   </button>
                 ))}
               </div>
            ) : !loading && (
               <div className="text-center py-10">
                 <p className="text-slate-500 text-sm">No topological matches found.</p>
               </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
