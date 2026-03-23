import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HeadingProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export default function Heading({
  title,
  subtitle,
  badge,
  align = 'center',
  className = ''
}: HeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const maxWidth = align === 'center' ? 'max-w-4xl' : 'max-w-3xl';

  return (
    <div className={`${alignClass} ${maxWidth} mb-16 ${className}`}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mb-6 ${align === 'center' ? 'flex justify-center' : ''}`}
        >
          {badge}
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: badge ? 0.1 : 0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight bg-gradient-to-br from-white via-white to-slate-300 bg-clip-text"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: badge ? 0.2 : 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg lg:text-xl text-slate-400 leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
