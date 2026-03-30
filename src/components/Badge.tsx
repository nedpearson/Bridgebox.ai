import { ReactNode } from "react";
import { motion } from "framer-motion";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) {
  const variants = {
    primary:
      "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 backdrop-blur-sm",
    secondary: "bg-white/5 border-white/10 text-slate-300 backdrop-blur-sm",
    success:
      "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981] backdrop-blur-sm",
    outline: "bg-transparent border-white/20 text-white backdrop-blur-sm",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center justify-center font-medium rounded-full border transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.span>
  );
}
