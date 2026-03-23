import { useEffect, useState } from 'react';
import type { MarketSignal } from '../../lib/market/types';

interface MarketSignalChartProps {
  signals: MarketSignal[];
  industry: string;
}

export function MarketSignalChart({ signals, industry }: MarketSignalChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const byMonth = signals.reduce((acc, signal) => {
    const month = new Date(signal.signal_date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    if (!acc[month]) {
      acc[month] = { count: 0, avgStrength: 0, signals: [] };
    }
    acc[month].count++;
    acc[month].signals.push(signal);
    return acc;
  }, {} as Record<string, { count: number; avgStrength: number; signals: MarketSignal[] }>);

  Object.keys(byMonth).forEach((month) => {
    const monthData = byMonth[month];
    monthData.avgStrength =
      monthData.signals.reduce((sum, s) => sum + s.strength_score, 0) / monthData.count;
  });

  const months = Object.keys(byMonth).slice(-6);
  const maxCount = Math.max(...months.map((m) => byMonth[m].count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm mb-4">
        <h4 className="font-medium text-gray-900">{industry} Signal Activity</h4>
        <span className="text-gray-500">{signals.length} total signals</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {months.map((month, index) => {
          const data = byMonth[month];
          const heightPercent = (data.count / maxCount) * 100;
          const strengthColor =
            data.avgStrength >= 70
              ? 'bg-emerald-500'
              : data.avgStrength >= 50
              ? 'bg-blue-500'
              : 'bg-amber-500';

          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className={`w-full ${strengthColor} rounded-t transition-all duration-700 ease-out`}
                  style={{
                    height: mounted ? `${heightPercent}%` : '0%',
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900">{data.count}</p>
                <p className="text-xs text-gray-500">{month}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 pt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-emerald-500 rounded" />
          <span className="text-gray-600">High Strength</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">Medium Strength</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500 rounded" />
          <span className="text-gray-600">Low Strength</span>
        </div>
      </div>
    </div>
  );
}
