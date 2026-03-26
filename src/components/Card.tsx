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
    ? 'bg-slate-900/30 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
    : 'bg-slate-900/80 backdrop-blur-md border border-slate-800/50 shadow-2xl';

  const hoverStyles = hover
    ? 'hover:border-white/10 hover:bg-slate-900/90 hover:shadow-[#3B82F6]/10 cursor-pointer transition-all duration-500'
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
