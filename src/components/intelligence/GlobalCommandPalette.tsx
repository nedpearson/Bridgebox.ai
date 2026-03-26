import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Sparkles, X, ArrowRight, Loader2, Target, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { aiOrchestrator } from '../../lib/intelligence/orchestrator';

export default function GlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ message: string; success: boolean, action_taken?: string } | null>(null);
  
  const { currentOrganization, user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setResult(null);
      setQuery('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !currentOrganization || !user) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // 1. Send the natural language string to the Orchestrator
      const response = await aiOrchestrator.execute({
        command: query,
        organization_id: currentOrganization.id,
        user_id: user.id
      });

      setResult(response);
      
      // 2. Clear input if successful
      if (response.success) {
        setQuery('');
      }

    } catch (err) {
      setResult({ success: false, message: 'Orchestrator failed to process your request.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const closePalette = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={closePalette}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Command Header / Input */}
            <form onSubmit={handleSubmit} className="flex items-center px-4 py-4 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-purple-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AI to execute a task, create a lead, or search records..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500 font-medium"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono ml-4 shrink-0 bg-slate-800/50 px-2 py-1 rounded">
                <Command className="w-3 h-3" />
                <span>J</span>
              </div>
            </form>

            {/* Results Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin relative" />
                  </div>
                  <p className="text-slate-400 text-sm">Orchestrator is routing your request...</p>
                </div>
              ) : result ? (
                <div className={`p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} mb-4`}>
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0 mt-0.5">
                      {result.success ? (
                         <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                      ) : (
                         <div className="w-2 h-2 rounded-full bg-red-400 mt-2" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? 'Execution Successful' : 'Execution Failed'}
                      </h4>
                      <p className="text-white text-sm leading-relaxed">{result.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Example Commands</h3>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setQuery("Create a new lead for John at Microsoft")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-800 text-slate-300 transition-colors group"
                    >
                      <Target className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                      <span className="text-sm">"Create a new lead for John at Microsoft"</span>
                    </button>
                    <button 
                      onClick={() => setQuery("Start a new SEO project for Acme Corp")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-800 text-slate-300 transition-colors group"
                    >
                      <FolderKanban className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                      <span className="text-sm">"Start a new SEO project for Acme Corp"</span>
                    </button>
                    <button 
                      onClick={() => setQuery("Show me the revenue projection for Q4")}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-800 text-slate-300 transition-colors group"
                    >
                      <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                      <span className="text-sm">"Show me the revenue projection for Q4"</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
