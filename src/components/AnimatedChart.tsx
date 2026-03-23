import { motion } from 'framer-motion';

interface AnimatedChartProps {
  data?: number[];
  height?: number;
  color?: string;
  delay?: number;
}

export default function AnimatedChart({
  data = [30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 85],
  height = 80,
  color = '#3B82F6',
  delay = 0,
}: AnimatedChartProps) {
  const max = Math.max(...data);
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: ((max - value) / max) * 100,
  }));

  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${pathData} L 100 100 L 0 100 Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        <motion.path
          d={areaPath}
          fill={`url(#gradient-${delay})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />

        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
        />

        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: delay + 0.8 + index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 3,
          delay: delay + 1.5,
          repeat: Infinity,
          repeatDelay: 5,
        }}
      />
    </div>
  );
}
