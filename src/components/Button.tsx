// @ts-nocheck
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 relative overflow-hidden group active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50';

  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 shadow-sm disabled:bg-slate-800/50 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed',
    outline: 'border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white disabled:border-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white disabled:bg-transparent disabled:text-slate-600 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-3.5 text-base',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
