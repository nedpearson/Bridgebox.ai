import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { globalSearchService, SearchResult } from '../../lib/db/search';
import { Search, Command, CheckSquare, FileText, Folder, Building2, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export default function UnifiedSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2 && currentOrganization?.id) {
        setLoading(true);
        try {
          const res = await globalSearchService.search(currentOrganization.id, query);
          setResults(res);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, currentOrganization?.id]);

  if (!isOpen) return null;

  const navigateTo = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'organization': return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'project': return <Folder className="w-5 h-5 text-amber-400" />;
      case 'task': return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-400" />;
      default: return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Input */}
        <div className="flex items-center px-4 py-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-slate-500"
            placeholder="Search tasks, clients, documents, or ask AI..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center space-x-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-medium">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* AI Orchestrator Hint */}
        {query.length > 5 && results.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-500 opacity-50" />
            <p className="text-sm">Cannot find exact relational match.</p>
            <button className="mt-3 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-lg transition-colors border border-indigo-500/20">
              Pass to Support Agent (WIP)
            </button>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto w-full">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => navigateTo(result.url)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-950 rounded-lg group-hover:bg-slate-900 transition-colors border border-slate-800">
                      {getIcon(result.type)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{result.title}</h4>
                      {result.subtitle && <p className="text-xs text-slate-400">{result.subtitle}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            query.length >= 2 && !loading && (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No results found across active integrations or relational core.
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
             <span className="flex items-center"><Command className="w-3 h-3 mr-1"/> navigate</span>
             <span className="flex items-center">↵ to select</span>
             <span className="flex items-center">esc to dismiss</span>
          </div>
          <span className="flex items-center text-indigo-500/50"><Sparkles className="w-3 h-3 mr-1"/> AI Operating System</span>
        </div>

      </div>
    </div>
  );
}
