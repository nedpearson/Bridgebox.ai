import { Brain, AlertTriangle, Info } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: number;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export function ConfidenceBadge({
  confidence,
  showIcon = true,
  size = "md",
}: ConfidenceBadgeProps) {
  const getConfidenceConfig = (score: number) => {
    if (score >= 80) {
      return {
        label: "High Confidence",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: Brain,
      };
    } else if (score >= 60) {
      return {
        label: "Medium Confidence",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Brain,
      };
    } else if (score >= 40) {
      return {
        label: "Low Confidence",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
      };
    } else {
      return {
        label: "Limited Data",
        color: "bg-gray-50 text-gray-600 border-gray-200",
        icon: Info,
      };
    }
  };

  const config = getConfidenceConfig(confidence);
  const Icon = config.icon;
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${config.color} ${sizeClasses}`}
      title={`${confidence}% confidence based on available data`}
    >
      {showIcon && <Icon size={iconSize} />}
      <span>{confidence}%</span>
    </span>
  );
}

interface DataQualityBadgeProps {
  quality: "excellent" | "good" | "fair" | "limited";
  size?: "sm" | "md";
}

export function DataQualityBadge({
  quality,
  size = "md",
}: DataQualityBadgeProps) {
  const config = {
    excellent: {
      label: "Excellent Data",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    good: {
      label: "Good Data",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    fair: {
      label: "Fair Data",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    limited: {
      label: "Limited Data",
      color: "bg-gray-50 text-gray-600 border-gray-200",
    },
  };

  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${config[quality].color} ${sizeClasses}`}
    >
      {config[quality].label}
    </span>
  );
}

interface UncertaintyNoticeProps {
  message?: string;
  type?: "prediction" | "recommendation" | "insight";
}

export function UncertaintyNotice({
  message,
  type = "insight",
}: UncertaintyNoticeProps) {
  const defaultMessages = {
    prediction:
      "Predictions are based on historical patterns and may not reflect future outcomes. Use as directional guidance.",
    recommendation:
      "Recommendations are AI-generated suggestions. Always apply your business judgment and expertise.",
    insight:
      "Insights are derived from available data. Quality depends on data completeness and accuracy.",
  };

  return (
    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-blue-700">
        {message || defaultMessages[type]}
      </p>
    </div>
  );
}
