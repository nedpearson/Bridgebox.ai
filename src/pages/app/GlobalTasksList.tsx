import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { globalTasksService, GlobalTask } from '../../lib/db/globalTasks';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';
import { usePlatformIntelligence } from '../../hooks/usePlatformIntelligence';
import { CheckSquare, Calendar, Filter, Plus, List, LayoutGrid, AlertCircle, Play, MoreVertical, Link as LinkIcon, Edit, User, MessageSquare } from 'lucide-react';

export default function GlobalTasksList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentOrganization } = useAuth();
  
  usePlatformIntelligence({
    id: 'page:tasks_list',
    name: 'Global Tasks Board',
    type: 'page',
    description: 'Kanban and list views aggregating tasks across all clients and projects directly in the relational OS.',
    relatedNodes: ['module:tasks', 'entity:task'],
    visibility: { roles: ['super_admin', 'tenant_admin', 'manager', 'agent', 'client_admin', 'client_user'] },
    actions: []
  });

  const contextId = searchParams.get('context');
  const contextType = searchParams.get('contextType') as EntityType | null;
  const tenantId = currentOrganization?.id;
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!tenantId) return;
      try {
        const data = await globalTasksService.getTenantTasks(tenantId);
        
        if (contextId && contextType) {
          const links = await entityLinkService.getLinkedEntities(contextType, contextId, 'task');
          const validTaskIds = new Set(links.map(link => link.target_id === contextId ? link.source_id : link.target_id));
          setTasks(data?.filter(t => validTaskIds.has(t.id)) || []);
        } else {
          setTasks(data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId, contextId, contextType]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Tasks</h1>
          <p className="text-slate-400">Cross-entity execution layer and unified task center.</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm font-medium text-slate-400">
                <th className="p-4">Task</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No active tasks found in the network graph.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr 
                    key={task.id} 
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/tasks/${task.id}`)}
                  >
                    <td className="p-4">
                      <p className="font-medium text-white">{task.title}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-slate-300">{task.status.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-slate-300">{task.priority}</span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
