import { useState, useEffect } from "react";
import {
  Zap,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ActionCard } from "../../components/agents/ActionCard";
import { UncertaintyNotice } from "../../components/intelligence/ConfidenceBadge";
import { useAuth } from "../../contexts/AuthContext";
import { actionReviewer, actionExecutor } from "../../lib/agents";
import type {
  AgentAction,
  ActionCategory,
  ActionStatus,
  ActionPriority,
  ActionStats,
} from "../../lib/agents/types";

export default function AgentActions() {
  const { currentOrganization, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [stats, setStats] = useState<ActionStats | null>(null);
  const [filter, setFilter] = useState<{
    category?: ActionCategory;
    status?: ActionStatus;
    priority?: ActionPriority;
  }>({});

  useEffect(() => {
    if (currentOrganization?.id) {
      loadActions();
      loadStats();
    }
  }, [currentOrganization?.id, filter]);

  async function loadActions() {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const { actions: data, error } = await actionReviewer.getActions(
        currentOrganization.id,
        filter,
      );

      if (!error && data) {
        setActions(data);
      }
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    if (!currentOrganization?.id) return;

    try {
      const { stats: data, error } = await actionReviewer.getActionStats(
        currentOrganization.id,
      );

      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function handleApprove(actionId: string, notes?: string) {
    if (!user?.id) return;

    setActionLoading(actionId);
    try {
      const { action, error } = await actionReviewer.approveAction(
        actionId,
        user.id,
        notes,
      );

      if (!error && action) {
        setActions(actions.map((a) => (a.id === actionId ? action : a)));
        loadStats();
      }
    } catch (error) {
      console.error("Error approving action:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDismiss(actionId: string, notes?: string) {
    if (!user?.id) return;

    setActionLoading(actionId);
    try {
      const { action, error } = await actionReviewer.dismissAction(
        actionId,
        user.id,
        notes,
      );

      if (!error && action) {
        setActions(actions.map((a) => (a.id === actionId ? action : a)));
        loadStats();
      }
    } catch (error) {
      console.error("Error dismissing action:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDefer(actionId: string, notes?: string) {
    if (!user?.id) return;

    setActionLoading(actionId);
    try {
      const { action, error } = await actionReviewer.deferAction(
        actionId,
        user.id,
        notes,
      );

      if (!error && action) {
        setActions(actions.map((a) => (a.id === actionId ? action : a)));
        loadStats();
      }
    } catch (error) {
      console.error("Error deferring action:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExecute(actionId: string) {
    if (!user?.id || !currentOrganization?.id) return;

    setActionLoading(actionId);
    try {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      const result = await actionExecutor.executeAction({
        user_id: user.id,
        organization_id: currentOrganization.id,
        action,
      });

      if (result.success) {
        await actionReviewer.markActionExecuted(actionId, result.result);
        loadActions();
        loadStats();
      } else {
        await actionReviewer.markActionFailed(
          actionId,
          result.error || "Execution failed",
        );
        loadActions();
      }
    } catch (error: any) {
      console.error("Error executing action:", error);
      await actionReviewer.markActionFailed(actionId, error.message);
      loadActions();
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              AI Agent Actions
            </h1>
            <p className="text-gray-600">
              Review and manage AI-suggested actions
            </p>
          </div>
        </div>
      </div>

      <UncertaintyNotice
        type="recommendation"
        message="AI actions are intelligent recommendations based on your data. All actions require human review and approval. Confidence scores indicate AI certainty, not guaranteed outcomes. Use your expertise to validate and approve actions."
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending Review</p>
              <Clock className="text-amber-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pending_review}
            </p>
            <p className="text-xs text-gray-500 mt-1">Require your attention</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Approved</p>
              <CheckCircle className="text-emerald-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {stats.approved}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ready for execution</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Executed</p>
              <TrendingUp className="text-blue-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.executed}</p>
            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <Zap className="text-purple-600" size={18} />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {stats.avg_confidence}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Action confidence</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filter.category || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  category: (e.target.value as ActionCategory) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="crm">CRM</option>
              <option value="proposal">Proposal</option>
              <option value="project">Project</option>
              <option value="support">Support</option>
              <option value="strategy">Strategy</option>
              <option value="automation">Automation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  status: (e.target.value as ActionStatus) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="suggested">Suggested</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="executed">Executed</option>
              <option value="dismissed">Dismissed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filter.priority || ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  priority: (e.target.value as ActionPriority) || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {filter.status === "pending_review"
            ? "Actions Pending Review"
            : filter.status === "approved"
              ? "Approved Actions"
              : "All Actions"}
        </h2>

        <div className="space-y-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              onDefer={handleDefer}
              onExecute={handleExecute}
              loading={actionLoading === action.id}
            />
          ))}
        </div>

        {actions.length === 0 && (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No actions match your filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
