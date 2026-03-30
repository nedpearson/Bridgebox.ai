import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  AlertCircle,
} from "lucide-react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { workflowService } from "../../lib/db/workflows";
import type {
  Workflow,
  WorkflowExecution,
  WorkflowExecutionStatus,
} from "../../types/workflow";

const STATUS_CONFIG: Record<
  WorkflowExecutionStatus,
  { icon: any; color: string; label: string }
> = {
  running: {
    icon: Clock,
    color: "blue",
    label: "Running",
  },
  completed: {
    icon: CheckCircle,
    color: "green",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "red",
    label: "Failed",
  },
  paused: {
    icon: Pause,
    color: "amber",
    label: "Paused",
  },
  cancelled: {
    icon: AlertCircle,
    color: "slate",
    label: "Cancelled",
  },
};

export function WorkflowExecutions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    WorkflowExecutionStatus | "all"
  >("all");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [workflowData, executionsData] = await Promise.all([
        workflowService.getWorkflowById(id),
        workflowService.getWorkflowExecutions(id),
      ]);
      setWorkflow(workflowData);
      setExecutions(executionsData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredExecutions = executions.filter(
    (execution) => filterStatus === "all" || execution.status === filterStatus,
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="h-screen flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title="Workflow not found"
          description="The workflow you're looking for doesn't exist"
          action={
            <Button onClick={() => navigate("/app/workflows")}>
              Back to Workflows
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title={`${workflow.name} - Executions`}
        subtitle="Monitor workflow execution history"
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/app/workflows")}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="text-sm text-slate-400 mb-1">Total Executions</div>
            <div className="text-3xl font-bold text-white">
              {executions.length}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="text-sm text-slate-400 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-400">
              {executions.filter((e) => e.status === "completed").length}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="text-sm text-slate-400 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-400">
              {executions.filter((e) => e.status === "failed").length}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="text-sm text-slate-400 mb-1">Running</div>
            <div className="text-3xl font-bold text-blue-400">
              {executions.filter((e) => e.status === "running").length}
            </div>
          </Card>
        </div>

        {filteredExecutions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No executions found"
            description={
              executions.length === 0
                ? "This workflow has not been executed yet"
                : "No executions match the selected filter"
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredExecutions.map((execution, index) => {
              const statusConfig = STATUS_CONFIG[execution.status];
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-slate-800/50">
                          <StatusIcon
                            className={`w-6 h-6 text-${statusConfig.color}-400`}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-slate-400">
                              {new Date(execution.started_at).toLocaleString()}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full bg-${statusConfig.color}-500/10 text-${statusConfig.color}-400 border border-${statusConfig.color}-500/20`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Trigger:</span>
                              <span className="text-slate-300 ml-2">
                                {execution.trigger_entity_type}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Duration:</span>
                              <span className="text-slate-300 ml-2">
                                {formatDuration(execution.duration_seconds)}
                              </span>
                            </div>
                            {execution.completed_at && (
                              <div>
                                <span className="text-slate-500">
                                  Completed:
                                </span>
                                <span className="text-slate-300 ml-2">
                                  {new Date(
                                    execution.completed_at,
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {execution.error_message && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <div className="text-xs text-red-400 font-medium mb-1">
                                Error
                              </div>
                              <div className="text-sm text-red-300">
                                {execution.error_message}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
