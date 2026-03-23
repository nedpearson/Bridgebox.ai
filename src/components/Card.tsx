import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ children, className = '', hover = false, glass = false }: CardProps) {
  const baseStyles = glass
    ? 'bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg'
    : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 shadow-lg';

  const hoverStyles = hover
    ? 'hover:border-[#3B82F6]/50 hover:shadow-2xl hover:shadow-[#3B82F6]/30 cursor-pointer transition-all duration-300'
    : '';

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl p-8 relative overflow-hidden group ${baseStyles} ${hoverStyles} ${className}`}
    >
      {hover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/0 via-[#3B82F6]/5 to-[#10B981]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={false}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
