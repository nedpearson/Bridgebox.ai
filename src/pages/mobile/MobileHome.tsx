import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  CheckSquare,
  Upload,
  Camera,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import MobileLayout from '../../layouts/MobileLayout';
import QuickActionButton from '../../components/mobile/QuickActionButton';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../contexts/AuthContext';

export default function MobileHome() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [stats, setStats] = useState({
    tasksToday: 0,
    projectsActive: 0,
    documentsUploaded: 0,
    pendingActions: 0,
  });

  useEffect(() => {
    if (currentOrganization?.id) {
      // Fetch real stats from API
    }
  }, [currentOrganization?.id]);

  return (
    <MobileLayout title="Bridgebox">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400">
            {currentOrganization?.name || 'Your organization'}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              icon={Plus}
              label="New Task"
              color="blue"
              onClick={() => navigate('/app/mobile/tasks/new')}
            />
            <QuickActionButton
              icon={Camera}
              label="Take Photo"
              color="green"
              onClick={() => navigate('/app/mobile/upload?camera=true')}
            />
            <QuickActionButton
              icon={Upload}
              label="Upload File"
              color="purple"
              onClick={() => navigate('/app/mobile/upload')}
            />
            <QuickActionButton
              icon={CheckSquare}
              label="Update Status"
              color="amber"
              onClick={() => navigate('/app/mobile/tasks')}
            />
          </div>
        </div>

        {/* Today's Overview */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Today's Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={CheckSquare}
              label="Tasks Today"
              value={stats.tasksToday}
              color="blue"
              onClick={() => navigate('/app/mobile/tasks')}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Projects"
              value={stats.projectsActive}
              color="green"
              onClick={() => navigate('/app/mobile/projects')}
            />
            <StatCard
              icon={Upload}
              label="Documents"
              value={stats.documentsUploaded}
              color="purple"
              onClick={() => navigate('/app/documents')}
            />
            <StatCard
              icon={AlertCircle}
              label="Pending"
              value={stats.pendingActions}
              color="amber"
              onClick={() => navigate('/app/mobile/tasks')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            <ActivityItem
              icon={CheckSquare}
              text="Task completed: Client follow-up"
              time="15 min ago"
            />
            <ActivityItem
              icon={Upload}
              text="Document uploaded: Project specs.pdf"
              time="1 hour ago"
            />
            <ActivityItem
              icon={TrendingUp}
              text="Project milestone reached"
              time="2 hours ago"
            />
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  onClick: () => void;
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-4 rounded-xl border ${
        colorClasses[color as keyof typeof colorClasses]
      } text-left transition-all active:scale-95`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </motion.button>
  );
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  time: string;
}

function ActivityItem({ icon: Icon, text, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="p-1.5 bg-slate-700/50 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white mb-0.5">{text}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}
