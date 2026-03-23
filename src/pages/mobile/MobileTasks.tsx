import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Search } from 'lucide-react';
import MobileLayout from '../../layouts/MobileLayout';
import MobileTaskCard from '../../components/mobile/MobileTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export default function MobileTasks() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, [currentOrganization]);

  const loadTasks = async () => {
    setLoading(true);

    // Mock data for demonstration
    setTimeout(() => {
      setTasks([
        {
          id: '1',
          title: 'Review client proposal',
          status: 'in_progress',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          id: '2',
          title: 'Update project documentation',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 172800000).toISOString(),
        },
        {
          id: '3',
          title: 'Client follow-up call',
          status: 'completed',
          priority: 'high',
          due_date: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '4',
          title: 'Prepare weekly report',
          status: 'pending',
          priority: 'low',
          due_date: new Date(Date.now() + 259200000).toISOString(),
        },
        {
          id: '5',
          title: 'Team standup meeting',
          status: 'in_progress',
          priority: 'medium',
          due_date: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleStatusToggle = (id: string, newStatus: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status: newStatus as any } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.status === 'completed') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <MobileLayout title="Tasks">
      <div className="flex flex-col h-full">
        {/* Search and Filter Bar */}
        <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800 p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
            />
            <FilterButton
              active={filter === 'active'}
              onClick={() => setFilter('active')}
              label="Active"
            />
            <FilterButton
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
              label="Completed"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks found"
              description="Create your first task to get started"
            />
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MobileTaskCard
                    {...task}
                    onClick={() => navigate(`/app/mobile/tasks/${task.id}`)}
                    onStatusToggle={handleStatusToggle}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/app/mobile/tasks/new')}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </MobileLayout>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-slate-800/50 text-slate-400 border border-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
