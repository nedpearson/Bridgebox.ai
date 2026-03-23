import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  MessageSquare,
} from 'lucide-react';
import MobileLayout from '../../layouts/MobileLayout';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

interface Milestone {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  description?: string;
  start_date?: string;
  end_date?: string;
  team_size?: number;
  milestones: Milestone[];
  updates: string[];
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'slate',
  active: 'blue',
  on_hold: 'amber',
  completed: 'green',
  cancelled: 'red',
};

export default function MobileProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [newUpdate, setNewUpdate] = useState('');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = () => {
    // Mock data
    setProject({
      id: id || '1',
      name: 'E-commerce Platform',
      status: 'active',
      progress: 65,
      description: 'Building a modern e-commerce platform with advanced features including AI recommendations, real-time inventory, and seamless checkout.',
      start_date: new Date(Date.now() - 60 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
      team_size: 5,
      milestones: [
        {
          id: '1',
          title: 'Design System',
          status: 'completed',
          due_date: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
        {
          id: '2',
          title: 'Payment Integration',
          status: 'in_progress',
          due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
        {
          id: '3',
          title: 'User Testing',
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        },
        {
          id: '4',
          title: 'Launch',
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      ],
      updates: [
        'Payment integration testing completed successfully',
        'Design system approved by client',
        'Started development on checkout flow',
      ],
    });
  };

  const handleAddUpdate = () => {
    if (newUpdate.trim() && project) {
      setProject({
        ...project,
        updates: [newUpdate, ...project.updates],
      });
      setNewUpdate('');
    }
  };

  if (!project) return null;

  return (
    <MobileLayout title="Project Details" showBack>
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Section */}
          <div className="p-4 bg-slate-900/50 border-b border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-lg font-semibold text-white">{project.name}</h1>
              <Badge color={STATUS_COLORS[project.status]}>{project.status}</Badge>
            </div>

            {project.description && (
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {project.description}
              </p>
            )}

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Overall Progress</span>
                <span className="text-sm font-medium text-white">{project.progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-800">
            {project.start_date && (
              <StatItem
                icon={Calendar}
                label="Started"
                value={new Date(project.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              />
            )}
            {project.team_size && (
              <StatItem icon={Users} label="Team" value={`${project.team_size}`} />
            )}
            {project.end_date && (
              <StatItem
                icon={TrendingUp}
                label="Due"
                value={new Date(project.end_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              />
            )}
          </div>

          {/* Milestones */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Milestones
            </h3>
            <div className="space-y-2">
              {project.milestones.map((milestone, index) => (
                <MilestoneItem key={milestone.id} milestone={milestone} index={index} />
              ))}
            </div>
          </div>

          {/* Updates */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Project Updates
            </h3>

            <div className="space-y-2 mb-4">
              {project.updates.map((update, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <p className="text-sm text-slate-300">{update}</p>
                </div>
              ))}
            </div>

            {/* Add Update */}
            <div className="space-y-2">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Add project update..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <Button
                onClick={handleAddUpdate}
                disabled={!newUpdate.trim()}
                size="sm"
                className="w-full"
              >
                Add Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1">
        <div className="p-2 bg-slate-800/50 rounded-lg">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-white font-medium">{value}</div>
    </div>
  );
}

interface MilestoneItemProps {
  milestone: Milestone;
  index: number;
}

function MilestoneItem({ milestone, index }: MilestoneItemProps) {
  const Icon = milestone.status === 'completed' ? CheckCircle2 : Circle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          milestone.status === 'completed'
            ? 'text-green-400'
            : milestone.status === 'in_progress'
            ? 'text-blue-400'
            : 'text-slate-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-medium mb-1 ${
            milestone.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
          }`}
        >
          {milestone.title}
        </h4>
        {milestone.due_date && (
          <p className="text-xs text-slate-500">
            Due {new Date(milestone.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
