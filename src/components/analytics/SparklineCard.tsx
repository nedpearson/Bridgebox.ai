import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

interface SparklineCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  data: { value: number }[];
  color?: string;
}

export default function SparklineCard({
  title,
  value,
  icon: Icon,
  data,
  color = '#3B82F6',
}: SparklineCardProps) {
  // Generate a dynamic SVG path from the data array
  const { path, min, max } = useMemo(() => {
    if (!data || data.length === 0) return { path: '', min: 0, max: 0 };
    
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;
    
    const width = 200;
    const height = 40;
    
    const points = values.map((val, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      return `${x},${y}`;
    });

    // Create a smooth bezier curve approximation or simple lines
    const pathData = `M ${points.join(' L ')}`;
    return { path: pathData, min: minVal, max: maxVal };
  }, [data]);

  return (
    <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 group hover:border-[#3B82F6]/30 transition-all duration-300">
      
      {/* Background Ambient Sparkline SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
         <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
            {/* Outline path */}
            <motion.path
               d={path}
               fill="none"
               stroke={color}
               strokeWidth="3"
               strokeLinecap="round"
               strokeLinejoin="round"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Gradient fill */}
            <motion.path
               d={`${path} L 200,40 L 0,40 Z`}
               fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
               stroke="none"
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.5 }}
               transition={{ duration: 2, delay: 0.5 }}
            />
            <defs>
               <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
               </linearGradient>
            </defs>
         </svg>
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <div className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center border transition-colors"
          style={{ 
             backgroundColor: `${color}15`,
             borderColor: `${color}30`
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      
    </div>
  );
}
