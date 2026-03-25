// @ts-nocheck
import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  prefix?: string;
  suffix?: string;
  animated?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  prefix = '',
  suffix = '',
  animated = true,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animated || typeof value !== 'number') {
      setDisplayValue(value as number);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animated]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-[#3B82F6]/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <div className="text-3xl font-bold text-white">
            {prefix}
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
            {suffix}
          </div>
        </div>
        <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center border border-[#3B82F6]/20">
          <Icon className="w-6 h-6 text-[#3B82F6]" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center space-x-1">
          <span
            className={`text-sm font-medium ${
              trend.direction === 'up' ? 'text-[#10B981]' : 'text-red-400'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 text-sm">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
