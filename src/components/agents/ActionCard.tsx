import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  MessageSquare,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Card from "../Card";
import Button from "../Button";
import type { AgentAction } from "../../lib/agents/types";

interface ActionCardProps {
  action: AgentAction;
  onApprove?: (actionId: string, notes?: string) => void;
  onDismiss?: (actionId: string, notes?: string) => void;
  onDefer?: (actionId: string, notes?: string) => void;
  onExecute?: (actionId: string) => void;
  loading?: boolean;
}

export function ActionCard({
  action,
  onApprove,
  onDismiss,
  onDefer,
  onExecute,
  loading,
}: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");

  const categoryIcons = {
    crm: Users,
    proposal: FileText,
    project: Target,
    support: MessageSquare,
    strategy: TrendingUp,
    automation: Zap,
  };

  const CategoryIcon = categoryIcons[action.category];

  const statusConfig = {
    suggested: {
      label: "Suggested",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    pending_review: {
      label: "Pending Review",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
      label: "Approved",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    executed: {
      label: "Executed",
      color: "bg-gray-50 text-gray-600 border-gray-200",
    },
    dismissed: {
      label: "Dismissed",
      color: "bg-gray-50 text-gray-500 border-gray-200",
    },
    failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200" },
  };

  const priorityConfig = {
    high: { label: "High", color: "bg-red-50 text-red-700 border-red-200" },
    medium: {
      label: "Medium",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    low: { label: "Low", color: "bg-gray-50 text-gray-600 border-gray-200" },
  };

  const showActions =
    action.status === "suggested" || action.status === "pending_review";
  const showExecute = action.status === "approved" && !action.is_destructive;

  return (
    <Card className="relative">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CategoryIcon className="text-blue-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                {action.is_destructive && (
                  <AlertTriangle size={16} className="text-amber-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
              {action.context.entity_name && (
                <p className="text-xs text-gray-500 mt-1">
                  Related to: {action.context.entity_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${
                statusConfig[action.status].color
              }`}
            >
              {statusConfig[action.status].label}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${
                priorityConfig[action.priority].color
              }`}
            >
              {priorityConfig[action.priority].label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{new Date(action.suggested_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={12} />
            <span>Confidence: {action.confidence_score}%</span>
          </div>
          {action.requires_approval && (
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
              Requires Approval
            </span>
          )}
        </div>

        {expanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Reasoning
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {action.reasoning.primary_reason}
              </p>
              {action.reasoning.supporting_factors.length > 0 && (
                <ul className="space-y-1">
                  {action.reasoning.supporting_factors.map((factor, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-0.5">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {action.reasoning.potential_impact && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Expected Impact
                </h4>
                <p className="text-sm text-gray-600">
                  {action.reasoning.potential_impact}
                </p>
              </div>
            )}

            {action.reasoning.data_points.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Supporting Data
                </h4>
                <div className="flex flex-wrap gap-2">
                  {action.reasoning.data_points.map((point, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {action.reviewed_by && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Review
                </h4>
                <p className="text-xs text-gray-500">
                  Reviewed on{" "}
                  {new Date(action.reviewed_at!).toLocaleDateString()}
                </p>
                {action.reviewer_notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {action.reviewer_notes}
                  </p>
                )}
              </div>
            )}

            {action.error_message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{action.error_message}</p>
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {action.requires_approval && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            )}

            <div className="flex gap-2">
              {onApprove && (
                <Button
                  onClick={() => onApprove(action.id, notes)}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle size={16} />
                  Approve
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={() => onDismiss(action.id, notes)}
                  disabled={loading}
                  variant="secondary"
                  className="flex-1"
                >
                  <XCircle size={16} />
                  Dismiss
                </Button>
              )}
              {onDefer && (
                <Button
                  onClick={() => onDefer(action.id, notes)}
                  disabled={loading}
                  variant="secondary"
                >
                  <Clock size={16} />
                  Defer
                </Button>
              )}
            </div>
          </div>
        )}

        {showExecute && onExecute && (
          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={() => onExecute(action.id)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap size={16} />
              Execute Action
            </Button>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Details
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
