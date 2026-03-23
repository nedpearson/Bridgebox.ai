import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
}

interface ButtonPropsExtended extends ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = '',
  type,
  disabled = false,
}: ButtonPropsExtended) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 relative overflow-hidden group';

  const variants = {
    primary: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/50 disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed',
    secondary: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-[#10B981]/30 hover:shadow-xl hover:shadow-[#10B981]/50 disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed',
    outline: 'border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#2563EB] disabled:border-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed',
    ghost: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3.5 text-base',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {(variant === 'primary' || variant === 'secondary') && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
    </>
  );

  const motionProps = disabled ? {} : {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
  };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link to={to} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <a href={href} className={classes}>
          {content}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button onClick={onClick} type={type} disabled={disabled} className={classes} {...motionProps}>
      {content}
    </motion.button>
  );
}
