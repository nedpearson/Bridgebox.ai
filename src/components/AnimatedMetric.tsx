import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedMetricProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
}

export default function AnimatedMetric({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2,
  delay = 0,
}: AnimatedMetricProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      const controls = animate(count, value, {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      });
      setHasAnimated(true);
      return controls.stop;
    }
  }, [count, value, duration, delay, hasAnimated]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
    >
      <motion.div className="text-2xl font-bold text-white mb-1">
        {prefix}
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  );
}
