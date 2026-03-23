import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  compact?: boolean;
}

export default function StatusBadge({ status, variant = 'default', compact = false }: StatusBadgeProps) {
  const variantStyles = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600',
    success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center rounded-full font-medium border backdrop-blur-sm ${variantStyles[variant]} ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
      {status}
    </motion.span>
  );
}
