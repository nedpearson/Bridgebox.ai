import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Box, CheckCircle2, Plus, Zap, Link as LinkIcon, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { globalSearchService, SearchResult } from '../../lib/db/search';
import EntityLinkModal from './EntityLinkModal';
import InteractionLogModal from './InteractionLogModal';
import { EntityType } from '../../lib/db/entityLinks';

export default function CommandPalette() {
  const { currentOrganization } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const getContextEntityInfo = (): { type: EntityType; id: string; label: string } | null => {
    const parts = location.pathname.split('/');
    if (parts.length >= 4 && parts[1] === 'app' && parts[3] !== 'new') {
      const collection = parts[2];
      const id = parts[3];
      const typeMap: Record<string, { type: EntityType; label: string }> = {
        clients: { type: 'organization', label: 'Client' },
        projects: { type: 'project', label: 'Project' },
        tasks: { type: 'task', label: 'Task' },
        documents: { type: 'document', label: 'Document' },
        communications: { type: 'communication', label: 'Communication' },
        workflows: { type: 'workflow', label: 'Workflow' }
      };
      if (typeMap[collection]) {
        return { ...typeMap[collection], id };
      }
    }
    return null;
  };

  const currentContext = getContextEntityInfo();

  let quickActions = [
    { id: 'create-task', title: 'Create Global Task', subtitle: 'Add a new task to the system', icon: <Plus className="w-4 h-4 text-emerald-400" />, action: () => navigate('/app/tasks?new=true') },
    { id: 'create-project', title: 'Create Project', subtitle: 'Spin up a new client project', icon: <Plus className="w-4 h-4 text-blue-400" />, action: () => navigate('/app/projects?new=true') },
    { id: 'create-client', title: 'Add Client Context', subtitle: 'Register a new organization', icon: <Plus className="w-4 h-4 text-purple-400" />, action: () => navigate('/app/clients?new=true') },
    { id: 'log-interaction', title: 'Log Activity', subtitle: 'Record an email, call, or meeting', icon: <Zap className="w-4 h-4 text-amber-400" />, action: () => navigate('/app/communications?new=true') },
  ];

  if (currentContext) {
    quickActions = [
      { 
        id: 'context-bind', 
        title: `Link Node to this ${currentContext.label}`, 
        subtitle: `Search and bind an existing entity natively`, 
        icon: <LinkIcon className="w-4 h-4 text-indigo-400" />, 
        action: () => { setIsOpen(false); setQuery(''); setBindModalOpen(true); } 
      },
      { 
        id: 'context-log', 
        title: `Log Interaction`, 
        subtitle: `Record a note or call for this ${currentContext.label}`, 
        icon: <Zap className="w-4 h-4 text-amber-400" />, 
        action: () => { setIsOpen(false); setQuery(''); setLogModalOpen(true); } 
      },
      ...quickActions
    ];
  }

  // Reset selection index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results, query, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        document.getElementById('command-palette-input')?.focus();
      }
      
      if (!isOpen) return;

      const activeList = query.length >= 2 ? results : quickActions;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < activeList.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeList[selectedIndex]) {
           if (query.length >= 2) {
              handleSelect((activeList[selectedIndex] as SearchResult).url);
           } else {
              (activeList[selectedIndex] as any).action();
              setIsOpen(false);
              setQuery('');
           }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2 && currentOrganization?.id) {
        setLoading(true);
        try {
          const data = await globalSearchService.search(currentOrganization.id, query);
          setResults(data);
        } catch (error) {
          console.error('Command search failed', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, currentOrganization?.id]);

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'organization': return <Box className="w-4 h-4 text-indigo-400" />;
      case 'project': return <Box className="w-4 h-4 text-emerald-400" />;
      case 'task': return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      case 'document': return <FileText className="w-4 h-4 text-rose-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative hidden md:block" ref={wrapperRef}>
      <div 
        className="relative flex items-center bg-slate-800/50 border border-slate-700 rounded-lg transition-colors focus-within:border-indigo-500/50 w-48 lg:w-64 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="absolute left-3 w-4 h-4 text-slate-500" />
        <input
          id="command-palette-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search... (Cmd+K)"
          className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[100] py-2 min-w-[340px] max-h-[60vh] flex flex-col">
          {loading ? (
            <div className="px-4 py-6 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Searching network...</span>
            </div>
          ) : query.length >= 2 ? (
            results.length > 0 ? (
              <div className="overflow-y-auto w-full">
                <div className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Results</div>
                {results.map((result, idx) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.url)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 group ${
                      idx === selectedIndex ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'hover:bg-slate-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="p-2 bg-slate-800 rounded-lg transition-colors">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${idx === selectedIndex ? 'text-indigo-400' : 'text-white'}`}>{result.title}</h4>
                      {result.subtitle && <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">
                No results found for "{query}"
              </div>
            )
          ) : (
            <div className="overflow-y-auto w-full">
               <div className="px-3 pb-2 pt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</div>
               {quickActions.map((action, idx) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      setIsOpen(false);
                      setQuery('');
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 group ${
                      idx === selectedIndex ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'hover:bg-slate-800 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="p-2 bg-slate-800 rounded-lg transition-colors">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${idx === selectedIndex ? 'text-indigo-400' : 'text-white'}`}>{action.title}</h4>
                      {action.subtitle && <p className="text-xs text-slate-400 truncate">{action.subtitle}</p>}
                    </div>
                  </button>
               ))}
            </div>
          )}
        </div>
      )}

      {currentContext && (
        <>
          <EntityLinkModal 
            isOpen={bindModalOpen}
            onClose={() => setBindModalOpen(false)}
            entityType={currentContext.type}
            entityId={currentContext.id}
            onLinkComplete={() => { window.location.reload(); }}
          />
          <InteractionLogModal
            isOpen={logModalOpen}
            onClose={() => setLogModalOpen(false)}
            entityType={currentContext.type}
            entityId={currentContext.id}
            onLogComplete={() => { window.location.reload(); }}
          />
        </>
      )}
    </div>
  );
}
