import { motion } from "framer-motion";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Zap,
  CheckCircle2,
  X,
} from "lucide-react";
import Button from "../Button";
import {
  SUGGESTION_TYPE_LABELS,
  PRIORITY_COLORS,
  type CopilotSuggestion,
} from "../../lib/db/copilot";

interface SuggestionCardProps {
  suggestion: CopilotSuggestion;
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const SUGGESTION_ICONS = {
  workflow: Lightbulb,
  automation: Zap,
  next_step: CheckCircle2,
  risk_alert: AlertTriangle,
  opportunity: TrendingUp,
};

export default function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: SuggestionCardProps) {
  const Icon = SUGGESTION_ICONS[suggestion.suggestion_type];
  const colors = PRIORITY_COLORS[suggestion.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{suggestion.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                >
                  {suggestion.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {SUGGESTION_TYPE_LABELS[suggestion.suggestion_type]}
              </p>
            </div>
          </div>

          {suggestion.description && (
            <p className="text-sm text-slate-300 mb-3">
              {suggestion.description}
            </p>
          )}

          {suggestion.status === "pending" && (onAccept || onDismiss) && (
            <div className="flex items-center gap-2">
              {onAccept && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onAccept(suggestion.id)}
                >
                  Accept
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDismiss(suggestion.id)}
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </Button>
              )}
            </div>
          )}

          {suggestion.status === "accepted" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accepted
            </span>
          )}

          {suggestion.status === "dismissed" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <X className="w-3.5 h-3.5" />
              Dismissed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
