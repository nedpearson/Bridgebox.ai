import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, User, AlertCircle } from 'lucide-react';
import AvatarStack from '../../components/app/AvatarStack';
import RelationalCommandCenter from '../../components/app/RelationalCommandCenter';
import RelationalMetricsCard from '../../components/app/RelationalMetricsCard';
import NextBestActionPanel from '../../components/app/NextBestActionPanel';
import BlockersPanel from '../../components/app/BlockersPanel';
import TimelineActivity from '../../components/app/TimelineActivity';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import { globalTasksService, GlobalTask } from '../../lib/db/globalTasks';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function GlobalTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<GlobalTask & { assignee?: any, creator?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (newStatus: string) => {
    if (!task || task.status === newStatus) return;
    try {
      await globalTasksService.updateTask(task.id, { status: newStatus as any });
      setTask({ ...task, status: newStatus as any });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task || task.priority === newPriority) return;
    try {
      await globalTasksService.updateTask(task.id, { priority: newPriority as any });
      setTask({ ...task, priority: newPriority as any });
    } catch (err) {
      console.error('Failed to update task priority:', err);
    }
  };

  useEffect(() => {
    if (id) {
      globalTasksService.getTaskById(id)
        .then(setTask)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!task) return <div className="p-8 text-center text-red-500">Task not found</div>;

  return (
    <>
      <AppHeader title={task.title} subtitle={`Task ID: ${task.id.slice(0, 8)}`} />

      <RelationalCommandCenter entityType="task" entityId={task.id}>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/app/tasks" className="flex items-center space-x-2 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tasks</span>
            </Link>
            <AvatarStack roomName={`task:${id}`} />
          </div>

          <Card glass className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              <div className="flex space-x-3">
                 <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className={`border-none rounded-full px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                      task.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`border-none rounded-full px-3 py-1 text-sm font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                      task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <BlockersPanel entityType="task" entityId={task.id} />
                <RelationalMetricsCard entityType="task" entityId={task.id} />
                <NextBestActionPanel entityType="task" entityData={task} />
                
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Metadata</h3>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm flex items-center"><User className="w-4 h-4 mr-2"/>Assignee</span>
                      <span className="text-white text-sm">{task.assignee?.full_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm flex items-center"><AlertCircle className="w-4 h-4 mr-2"/>Creator</span>
                      <span className="text-white text-sm">{task.creator?.full_name || 'System Generated'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm flex items-center"><Clock className="w-4 h-4 mr-2"/>Created At</span>
                      <span className="text-white text-sm">{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                         <span className="text-yellow-500 text-sm flex items-center"><Clock className="w-4 h-4 mr-2"/>Due Date</span>
                         <span className="text-yellow-500 font-medium text-sm">{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <TimelineActivity entityType="task" entityId={task.id} />
              </div>
            </div>
          </Card>
        </div>
      </RelationalCommandCenter>
    </>
  );
}
