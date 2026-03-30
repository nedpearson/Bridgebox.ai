interface SignalStrengthIndicatorProps {
  strength: number;
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function SignalStrengthIndicator({
  strength,
  confidence,
  size = "md",
  showLabels = false,
}: SignalStrengthIndicatorProps) {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  const getStrengthColor = (value: number) => {
    if (value >= 80) return "bg-emerald-500";
    if (value >= 60) return "bg-blue-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-gray-400";
  };

  const getConfidenceColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500";
    if (value >= 50) return "bg-blue-500";
    if (value >= 30) return "bg-amber-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-2">
      <div>
        {showLabels && (
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Strength</span>
            <span className="font-medium">{strength}%</span>
          </div>
        )}
        <div
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses}`}
        >
          <div
            className={`${heightClasses} ${getStrengthColor(strength)} transition-all duration-500`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <div>
        {showLabels && (
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Confidence</span>
            <span className="font-medium">{confidence}%</span>
          </div>
        )}
        <div
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses}`}
        >
          <div
            className={`${heightClasses} ${getConfidenceColor(confidence)} transition-all duration-500`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
