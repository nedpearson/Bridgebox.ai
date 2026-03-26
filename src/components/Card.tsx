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
    ? 'bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
    : 'bg-slate-900 border border-slate-800/80 shadow-xl shadow-black/20';

  const hoverStyles = hover
    ? 'hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer transition-all duration-300'
    : '';

  // Only apply p-6 if no padding is explicitly passed to prevent conflicts
  const paddingStyle = className.includes('p-') ? '' : 'p-6';

  return (
    <div
      className={`rounded-xl relative overflow-hidden group ${baseStyles} ${hoverStyles} ${paddingStyle} ${className}`}
    >
      {hover && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-[#10B981]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
