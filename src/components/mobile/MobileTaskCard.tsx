import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import Badge from '../Badge';

interface MobileTaskCardProps {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  onClick: () => void;
  onStatusToggle: (id: string, newStatus: string) => void;
}

const STATUS_ICONS = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

const PRIORITY_COLORS = {
  low: 'slate',
  medium: 'amber',
  high: 'red',
};

export default function MobileTaskCard({
  id,
  title,
  status,
  priority,
  dueDate,
  onClick,
  onStatusToggle,
}: MobileTaskCardProps) {
  const StatusIcon = STATUS_ICONS[status];

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = status === 'completed' ? 'pending' : 'completed';
    onStatusToggle(id, nextStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 active:bg-slate-800"
    >
      <div className="flex items-start gap-3">
        {/* Status Toggle */}
        <button
          onClick={handleStatusClick}
          className="flex-shrink-0 pt-0.5"
        >
          <StatusIcon
            className={`w-6 h-6 transition-colors ${
              status === 'completed'
                ? 'text-green-400'
                : status === 'in_progress'
                ? 'text-blue-400'
                : 'text-slate-500'
            }`}
          />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-medium mb-2 ${
              status === 'completed'
                ? 'text-slate-400 line-through'
                : 'text-white'
            }`}
          >
            {title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {priority && (
              <Badge color={PRIORITY_COLORS[priority]} className="text-xs">
                {priority}
              </Badge>
            )}
            {dueDate && (
              <span className="text-xs text-slate-400">
                Due {new Date(dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
