import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { devTasksAiApi, InternalDevTask } from '../../../lib/devTasksAi';
import { Loader2, Code2, AlertTriangle, ShieldCheck, Search, Filter, Server, Braces, Sparkles } from 'lucide-react';

export default function DevTasksWorkspace() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<InternalDevTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'draft_generated' | 'approved' | 'all'>('draft_generated');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await devTasksAiApi.getAllTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load dev tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'low': return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
      default: return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'draft_generated' && task.status !== 'draft_generated' && task.status !== 'under_review') return false;
    if (activeTab === 'approved' && task.status !== 'approved' && task.status !== 'sent_to_antigravity' && task.status !== 'queued_for_build') return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.product_area || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Workspace Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <Code2 className="w-8 h-8 text-fuchsia-500" />
            <span>AI Development Task Generation</span>
          </h1>
          <p className="text-slate-400">
            Internal evaluation layer mapping raw Support Telemetry into structured Engineering pipelines.
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search specifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-fuchsia-500 transition-colors w-64"
            />
          </div>
          <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        {[
          { id: 'draft_generated', label: 'Pending AI Triage', icon: Sparkles },
          { id: 'approved', label: 'Approved for Build', icon: ShieldCheck },
          { id: 'all', label: 'Global Backlog', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-fuchsia-500 text-fuchsia-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Iteration */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-16 text-center">
          <Braces className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Zero Active Tasks</h3>
          <p className="text-slate-500">Pipeline is nominal. No outstanding task signatures detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => navigate(`/app/internal/recording-center/dev-tasks/${task.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 rounded-xl p-5 cursor-pointer transition-colors group relative overflow-hidden flex flex-col"
            >
              {/* Card Meta */}
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(task.severity)}`}>
                  {task.severity}
                </span>
                <span className="text-slate-500 text-xs flex items-center bg-slate-800 px-2 py-1 rounded">
                   <Sparkles className="w-3 h-3 text-fuchsia-400 mr-1" />
                   {task.confidence_score || 'N/A'}% CF
                </span>
              </div>
              
              <h3 className="text-white font-medium mb-2 group-hover:text-fuchsia-400 transition-colors line-clamp-2">
                {task.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                {task.problem_statement || task.summary}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                 <span className="flex items-center space-x-1 uppercase font-mono">
                   <Server className="w-3 h-3 text-indigo-400" />
                   <span>{task.product_area || 'Global Scope'}</span>
                 </span>
                 <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
                   {task.status.replace(/_/g, ' ')}
                 </span>
              </div>

              {/* Duplicate Warnings overlay */}
              {task.similar_task_refs && task.similar_task_refs.length > 0 && (
                <div className="absolute top-0 right-0 p-2 opacity-100 mix-blend-screen bg-orange-500/10 rounded-bl-xl border-l border-b border-orange-500/20">
                   <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
