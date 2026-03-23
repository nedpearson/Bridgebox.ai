import { motion } from 'framer-motion';

interface PulseIndicatorProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  delay?: number;
}

export default function PulseIndicator({
  color = '#10B981',
  size = 'sm',
  label,
  delay = 0,
}: PulseIndicatorProps) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <motion.div
          className={`${sizes[size]} rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay }}
        />
        <motion.div
          className={`absolute inset-0 ${sizes[size]} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 2, 2],
            opacity: [0.6, 0, 0],
          }}
          transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'easeOut',
          }}
        />
      </div>
      {label && (
        <motion.span
          className="text-xs text-slate-400"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
