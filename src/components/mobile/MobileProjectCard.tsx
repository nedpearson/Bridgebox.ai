// @ts-nocheck
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, TrendingUp } from 'lucide-react';
import Badge from '../Badge';

interface MobileProjectCardProps {
  id: string;
  name: string;
  status: string;
  progress: number;
  nextMilestone?: string;
  onClick: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  planning: 'slate',
  active: 'blue',
  on_hold: 'amber',
  completed: 'green',
  cancelled: 'red',
};

export default function MobileProjectCard({
  id,
  name,
  status,
  progress,
  nextMilestone,
  onClick,
}: MobileProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 active:bg-slate-800"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-lg">
          <Briefcase className="w-5 h-5 text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-medium text-white truncate">{name}</h3>
            <Badge color={STATUS_COLORS[status] || 'slate'} className="text-xs flex-shrink-0">
              {status}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Progress</span>
              <span className="text-xs font-medium text-white">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <TrendingUp className="w-3 h-3" />
              <span>Next: {nextMilestone}</span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}
