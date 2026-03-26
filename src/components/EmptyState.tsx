// @ts-nocheck
import { ReactNode } from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 w-full border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-900/20"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6]/10 to-[#10B981]/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-800">
        <Icon className="w-10 h-10 text-slate-400 opacity-80" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-md mb-8 text-sm leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
