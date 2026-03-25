import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { globalTasksService, GlobalTask } from '../../lib/db/globalTasks';
import { entityLinkService, EntityType } from '../../lib/db/entityLinks';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RelationalTasksBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalTasksBoard({ entityType, entityId }: RelationalTasksBoardProps) {
  const { currentOrganization } = useAuth();
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [entityType, entityId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const linkedTasks = await globalTasksService.getLinkedTasks(entityType, entityId);
      setTasks(linkedTasks);
    } catch (err) {
      console.error('Failed to load tasks via polymorphic linkage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    const title = prompt('Enter a title for the new linked Task:');
    if (!title || !currentOrganization?.id) return;

    try {
      // 1. Create native Global Task
      const newTask = await globalTasksService.createTask({
        tenant_id: currentOrganization.id,
        title,
        status: 'todo',
        priority: 'medium',
      });

      // 2. Link topological boundary map
      await entityLinkService.linkEntities({
        tenant_id: currentOrganization.id,
        source_type: 'task',
        source_id: newTask.id,
        target_type: entityType,
        target_id: entityId,
        relationship_type: 'attached_to'
      });

      await loadTasks();
    } catch (err) {
      console.error('Failed creating or linking task', err);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Execution Board</h3>
        <button
          onClick={handleCreateTask}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fast Task</span>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
          No tasks attached to this {entityType} currently. Create one to orchestrate delivery!
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <Link to={`/app/tasks/${task.id}`}>
                  <h4 className="font-semibold text-white hover:text-indigo-400 truncate">{task.title}</h4>
                </Link>
                <div className="flex space-x-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    task.status === 'done' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    task.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">{task.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
