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
  // Removed gimmicky setInterval counter animation per luxury UX guidelines.
  // Real enterprise dashboards render metrics instantaneously.

  return (
    <div
      className="bg-slate-900 shadow-lg shadow-black/20 border-t-2 border-t-indigo-500/50 border border-slate-800/80 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold mb-2">{title}</p>
          <div className="text-3xl font-bold text-white tracking-tight">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-5 h-5 text-indigo-400" />
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
          <span className="text-slate-500 text-xs ml-2">vs previous period</span>
        </div>
      )}
    </div>
  );
}
