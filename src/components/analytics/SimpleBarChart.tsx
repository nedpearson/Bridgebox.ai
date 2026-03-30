interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  height?: number;
}

export default function SimpleBarChart({
  data,
  maxValue,
  height = 200,
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  const defaultColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
  ];

  return (
    <div className="space-y-3" style={{ height }}>
      {data.map((item, index) => {
        const percentage = (item.value / max) * 100;
        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{item.label}</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
