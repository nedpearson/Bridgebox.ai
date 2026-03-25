// @ts-nocheck
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';
import type { ProcessingStatus as Status } from '../../lib/documents/DocumentProcessor';

interface ProcessingStatusProps {
  status: Status;
  progress?: number;
  message?: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    label: 'Processing',
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    label: 'Completed',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    label: 'Failed',
  },
  retrying: {
    icon: Loader2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    label: 'Retrying',
    animate: true,
  },
};

export default function ProcessingStatus({ status, progress, message }: ProcessingStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${config.bgColor}`}>
        <Icon
          className={`w-5 h-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{config.label}</span>
          {progress !== undefined && (
            <span className="text-xs text-slate-400">({Math.round(progress)}%)</span>
          )}
        </div>
        {message && <p className="text-xs text-slate-400 mt-0.5">{message}</p>}
        {progress !== undefined && (
          <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${config.color.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
