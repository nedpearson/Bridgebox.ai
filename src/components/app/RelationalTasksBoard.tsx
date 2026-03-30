import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { globalTasksService, GlobalTask } from "../../lib/db/globalTasks";
import { entityLinkService, EntityType } from "../../lib/db/entityLinks";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button";
import { copilotEngine } from "../../lib/ai/services/copilotEngine";

interface RelationalTasksBoardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalTasksBoard({
  entityType,
  entityId,
}: RelationalTasksBoardProps) {
  const { currentOrganization } = useAuth();
  const [tasks, setTasks] = useState<GlobalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [entityType, entityId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const linkedTasks = await globalTasksService.getLinkedTasks(
        entityType,
        entityId,
      );
      setTasks(linkedTasks);
    } catch (err) {
      console.error("Failed to load tasks via polymorphic linkage:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    const title = prompt("Enter a title for the new linked Task:");
    if (!title || !currentOrganization?.id) return;

    try {
      // 1. Create native Global Task
      const newTask = await globalTasksService.createTask({
        tenant_id: currentOrganization.id,
        title,
        status: "todo",
        priority: "medium",
      });

      // 2. Link topological boundary map
      await entityLinkService.linkEntities({
        tenant_id: currentOrganization.id,
        source_type: "task",
        source_id: newTask.id,
        target_type: entityType,
        target_id: entityId,
        relationship_type: "attached_to",
      });

      await loadTasks();
    } catch (err) {
      console.error("Failed creating or linking task", err);
    }
  };

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !currentOrganization?.id) return;
    setIsGenerating(true);
    try {
      // Create a prompt that specifically tells the AI to return simple tasks
      const result = await copilotEngine.generateReasonedResponse(
        `Please break this down into actionable tasks in a strict JSON array format: "${aiPrompt}". Return an array of objects with 'title' (string), 'description' (string) and 'priority' ('high'|'medium'|'low'). Return ONLY JSON.`,
        {
          role: "admin",
          organizationId: currentOrganization.id,
          userId: "system",
        },
        { activeModule: "relational_tasks" },
      );

      let text = result.text || "";
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsedTasks: any[] = [];
      try {
        const parsedObj = JSON.parse(text);
        if (!Array.isArray(parsedObj) && parsedObj.tasks) {
          parsedTasks = parsedObj.tasks;
        } else if (Array.isArray(parsedObj)) {
          parsedTasks = parsedObj;
        } else {
          parsedTasks = [
            {
              title: aiPrompt,
              description: "AI Generated Task",
              priority: "medium",
            },
          ];
        }
      } catch (e) {
        // Fallback if parsing fails - just make one task
        parsedTasks = [
          {
            title: aiPrompt,
            description: "AI Generated Task",
            priority: "medium",
          },
        ];
      }

      for (const t of parsedTasks) {
        const newTask = await globalTasksService.createTask({
          tenant_id: currentOrganization.id,
          title: `[AI] ${t.title || "Extracted Task"}`,
          description: t.description || aiPrompt,
          status: "todo",
          priority:
            t.priority === "high"
              ? "high"
              : t.priority === "low"
                ? "low"
                : "medium",
        });

        await entityLinkService.linkEntities({
          tenant_id: currentOrganization.id,
          source_type: "task",
          source_id: newTask.id,
          target_type: entityType,
          target_id: entityId,
          relationship_type: "attached_to",
        });
      }
    } catch (err) {
      console.error("Failed AI task generation", err);
    } finally {
      setIsGenerating(false);
      setAiPrompt("");
      loadTasks();
    }
  };

  const quickTasks = [
    {
      title: "Kickoff Meeting & Alignment",
      description:
        "Schedule and conduct the initial kickoff meeting with project stakeholders.",
      priority: "high",
    },
    {
      title: "Gather Initial Requirements",
      description:
        "Collect and document all technical and business requirements for the implementation.",
      priority: "medium",
    },
    {
      title: "Set up Integration Keys",
      description:
        "Provision API keys, OAuth tokens, and system credentials for the integrations.",
      priority: "high",
    },
    {
      title: "End-to-End System Testing",
      description:
        "Conduct full UAT and end-to-end integration testing across environments.",
      priority: "high",
    },
    {
      title: "Client Sign-off & Deployment",
      description:
        "Acquire final client sign-off and deploy the solution to production.",
      priority: "medium",
    },
  ];

  const handleQuickAdd = async (template: (typeof quickTasks)[0]) => {
    if (!currentOrganization?.id) return;
    try {
      setIsGenerating(true);
      const newTask = await globalTasksService.createTask({
        tenant_id: currentOrganization.id,
        title: template.title,
        description: template.description,
        status: "todo",
        priority: template.priority as "high" | "medium" | "low",
      });

      await entityLinkService.linkEntities({
        tenant_id: currentOrganization.id,
        source_type: "task",
        source_id: newTask.id,
        target_type: entityType,
        target_id: entityId,
        relationship_type: "attached_to",
      });
    } catch (err) {
      console.error("Failed quick task addition", err);
    } finally {
      setIsGenerating(false);
      loadTasks();
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Execution Board</h3>
        <button
          onClick={handleCreateTask}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fast Task</span>
        </button>
      </div>

      {/* Embedded AI Task Input */}
      <div className="flex p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl items-center space-x-3 mt-4">
        <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
          placeholder="Tell the AI to change or add new tasks (e.g. 'Add a task to setup DNS records')..."
          className="flex-1 bg-transparent border-none text-sm text-white placeholder-indigo-300/50 focus:outline-none focus:ring-0"
        />
        <Button
          onClick={handleAiGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          size="sm"
          variant="primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Working...
            </>
          ) : (
            "AI Edit Tasks"
          )}
        </Button>
      </div>

      {/* Default Quick-Add Tasks */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-slate-500 uppercase font-semibold flex items-center mr-2">
          Default Tasks:
        </span>
        {quickTasks.map((t, i) => (
          <button
            key={i}
            onClick={() => handleQuickAdd(t)}
            disabled={isGenerating}
            className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-full border border-slate-700 transition-colors flex items-center group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3 mr-1 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            {t.title}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
          No tasks attached to this {entityType} currently. Create one to
          orchestrate delivery!
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <Link to={`/app/tasks/${task.id}`}>
                  <h4 className="font-semibold text-white hover:text-indigo-400 truncate">
                    {task.title}
                  </h4>
                </Link>
                <div className="flex space-x-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      task.status === "done"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : task.status === "in_progress"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-white/5">
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
