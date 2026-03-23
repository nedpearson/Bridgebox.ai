import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'dark' | 'darker' | 'gradient';
}

export default function Section({ children, className = '', background = 'dark' }: SectionProps) {
  const backgrounds = {
    dark: 'bg-[#0B0F1A]',
    darker: 'bg-black',
    gradient: 'bg-gradient-to-b from-[#0B0F1A] via-slate-900 to-[#0B0F1A]',
  };

  return (
    <section className={`py-20 ${backgrounds[background]} ${className} relative overflow-hidden`}>
      {background === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3B82F6]/5 via-transparent to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#10B981]/5 via-transparent to-transparent opacity-30" />
        </>
      )}
      {background === 'darker' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-black to-black" />
      )}
      {background === 'gradient' && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#3B82F6]/20 to-[#10B981]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">{children}</div>
    </section>
  );
}
