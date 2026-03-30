interface DonutChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  size?: number;
  centerText?: string;
  centerSubtext?: string;
}

export default function DonutChart({
  data,
  size = 160,
  centerText,
  centerSubtext,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

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

  let cumulativePercentage = 0;

  const createArc = (percentage: number, cumulativePercentage: number) => {
    const startAngle = cumulativePercentage * 360;
    const endAngle = (cumulativePercentage + percentage) * 360;

    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(30, 41, 59)"
            strokeWidth="12"
          />
          {data.map((item, index) => {
            const percentage = item.value / total;
            const path = createArc(percentage, cumulativePercentage);
            const color =
              item.color || defaultColors[index % defaultColors.length];

            cumulativePercentage += percentage;

            return (
              <path
                key={item.label}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {(centerText || centerSubtext) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerText && (
              <div className="text-2xl font-bold text-white">{centerText}</div>
            )}
            {centerSubtext && (
              <div className="text-xs text-slate-400">{centerSubtext}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {data.map((item, index) => {
          const percentage =
            total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          const color =
            item.color || defaultColors[index % defaultColors.length];

          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-slate-300">{item.label}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-400">{percentage}%</span>
                <span className="text-sm font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
