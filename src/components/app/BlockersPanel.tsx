import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { EntityType, entityLinkService } from "../../lib/db/entityLinks";
import { globalTasksService, GlobalTask } from "../../lib/db/globalTasks";
import Card from "../Card";
import { Link } from "react-router-dom";

interface BlockersPanelProps {
  entityType: EntityType;
  entityId: string;
}

export default function BlockersPanel({
  entityType,
  entityId,
}: BlockersPanelProps) {
  const [blockers, setBlockers] = useState<GlobalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockers();
  }, [entityType, entityId]);

  const loadBlockers = async () => {
    try {
      setLoading(true);
      // N-Degree extraction: Find all tasks attached to this entity
      const links = await entityLinkService.getLinkedEntities(
        entityType,
        entityId,
        "task",
      );
      if (links.length > 0) {
        const taskIds = links.map((l) =>
          l.source_type === "task" ? l.source_id : l.target_id,
        );

        // Check if any of these tasks are overdue and NOT done
        const now = new Date().toISOString();
        // Since we don't have a bulk fetch by ID filtering due_date in simple service,
        // we'll fetch all linked tasks via the existing service and filter in memory.
        const tasks = await globalTasksService.getLinkedTasks(
          entityType,
          entityId,
        );

        const overdueTasks = tasks.filter(
          (t) =>
            t.status !== "done" &&
            t.status !== "cancelled" &&
            t.due_date &&
            new Date(t.due_date) < new Date(),
        );

        setBlockers(overdueTasks);
      } else {
        setBlockers([]);
      }
    } catch (err) {
      console.error("Failed to analyze topology blockers:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (blockers.length === 0) {
    return (
      <Card glass className="p-4 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Topology is Unblocked
            </h3>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              0 critical dependencies detected.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      glass
      className="p-6 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-red-500">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-lg font-bold">Critical Blockers Detected</h3>
        </div>
        <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded-full border border-red-500/20">
          {blockers.length} Active {blockers.length === 1 ? "Risk" : "Risks"}
        </span>
      </div>

      <div className="space-y-3">
        {blockers.map((task) => (
          <Link
            to={`/app/tasks/${task.id}`}
            key={task.id}
            className="flex items-start p-3 bg-red-500/5 rounded-lg border border-red-500/10 hover:bg-red-500/10 transition-colors group"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                {task.title}
              </h4>
              <p className="text-xs text-red-400/80 mt-1">
                This topological dependency is overdue. Target resolving this
                immediately.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-red-400/50 group-hover:text-red-400 transform group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
