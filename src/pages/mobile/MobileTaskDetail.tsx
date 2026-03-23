import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Calendar, AlertCircle, User, MessageSquare, CreditCard as Edit3 } from 'lucide-react';
import MobileLayout from '../../layouts/MobileLayout';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  notes?: string[];
}

const STATUS_CONFIG = {
  pending: { color: 'slate', icon: Clock, label: 'Pending' },
  in_progress: { color: 'blue', icon: Clock, label: 'In Progress' },
  completed: { color: 'green', icon: CheckCircle2, label: 'Completed' },
};

const PRIORITY_COLORS = {
  low: 'slate',
  medium: 'amber',
  high: 'red',
};

export default function MobileTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = () => {
    // Mock data
    setTask({
      id: id || '1',
      title: 'Review client proposal',
      description: 'Review and provide feedback on the Q1 proposal for Acme Corp. Focus on pricing structure and timeline.',
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      assigned_to: 'John Doe',
      notes: [
        'Initial review completed - pricing needs adjustment',
        'Scheduled meeting with client for tomorrow',
      ],
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (task) {
      setTask({ ...task, status: newStatus as any });
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && task) {
      setTask({
        ...task,
        notes: [...(task.notes || []), newNote],
      });
      setNewNote('');
    }
  };

  if (!task) return null;

  const statusConfig = STATUS_CONFIG[task.status];
  const StatusIcon = statusConfig.icon;

  return (
    <MobileLayout title="Task Details" showBack>
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Section */}
          <div className="p-4 bg-slate-900/50 border-b border-slate-800">
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${statusConfig.color}-500/10`}>
                <StatusIcon className={`w-5 h-5 text-${statusConfig.color}-400`} />
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-white mb-2">{task.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
                  {task.priority && (
                    <Badge color={PRIORITY_COLORS[task.priority]}>
                      {task.priority} priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Details Section */}
          <div className="p-4 space-y-4">
            {task.due_date && (
              <DetailRow
                icon={Calendar}
                label="Due Date"
                value={new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              />
            )}

            {task.assigned_to && (
              <DetailRow icon={User} label="Assigned To" value={task.assigned_to} />
            )}
          </div>

          {/* Notes Section */}
          <div className="p-4 border-t border-slate-800">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes
            </h3>

            <div className="space-y-2 mb-4">
              {task.notes && task.notes.length > 0 ? (
                task.notes.map((note, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <p className="text-sm text-slate-300">{note}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No notes yet</p>
              )}
            </div>

            {/* Add Note */}
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                size="sm"
                className="w-full"
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          {task.status !== 'completed' && (
            <Button
              onClick={() => handleStatusChange('completed')}
              className="w-full py-3"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Mark as Completed
            </Button>
          )}

          {task.status === 'pending' && (
            <Button
              onClick={() => handleStatusChange('in_progress')}
              variant="secondary"
              className="w-full py-3"
            >
              <Clock className="w-5 h-5 mr-2" />
              Start Task
            </Button>
          )}

          {task.status === 'completed' && (
            <Button
              onClick={() => handleStatusChange('in_progress')}
              variant="secondary"
              className="w-full py-3"
            >
              <Clock className="w-5 h-5 mr-2" />
              Reopen Task
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-800/50 rounded-lg">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-0.5">{label}</div>
        <div className="text-sm text-white font-medium">{value}</div>
      </div>
    </div>
  );
}
