import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  onClick: () => void;
}

export default function QuickActionButton({
  icon: Icon,
  label,
  color = 'blue',
  onClick,
}: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      } transition-all active:scale-95`}
    >
      <Icon className="w-8 h-8 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}
