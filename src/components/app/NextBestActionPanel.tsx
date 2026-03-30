import React, { useMemo, useState, useEffect } from "react";
import {
  Lightbulb,
  ArrowRight,
  Zap,
  PlayCircle,
  AlertTriangle,
  Plus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { EntityType } from "../../lib/db/entityLinks";
import Card from "../Card";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface NextBestActionPanelProps {
  entityType: EntityType;
  entityData: any;
}

interface ActionRecommendation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  priority: "high" | "medium" | "low";
}

export default function NextBestActionPanel({
  entityType,
  entityData,
}: NextBestActionPanelProps) {
  const navigate = useNavigate();
  const [aiRecommendation, setAiRecommendation] =
    useState<ActionRecommendation | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchAiRecommendation() {
      if (!entityData?.id) return;
      setLoadingAi(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "predict-next-action",
          {
            body: {
              record_id: entityData.id,
              record_type: entityType,
              context_data: entityData,
            },
          },
        );

        if (!error && data?.nba && active) {
          const mlb = data.nba;
          setAiRecommendation({
            id: "nba_ai_generated",
            title: mlb.title,
            description: mlb.rationale,
            icon: <Sparkles className="w-5 h-5 text-purple-400" />,
            action: () => {
              if (
                mlb.proposed_tool_execution?.tool_name &&
                mlb.proposed_tool_execution?.tool_name !== "null" &&
                mlb.proposed_tool_execution?.tool_name !== "none" &&
                (window as any).executeCopilotTool
              ) {
                (window as any).executeCopilotTool(
                  mlb.proposed_tool_execution.tool_name,
                  mlb.proposed_tool_execution.parameters,
                );
              }
            },
            priority: "high",
          });
        }
      } catch (err) {
        console.warn("AI NBA failed softly", err);
      } finally {
        if (active) setLoadingAi(false);
      }
    }

    setAiRecommendation(null);
    fetchAiRecommendation();
    return () => {
      active = false;
    };
  }, [entityData?.id, entityType]);

  const fallbackRecommendations = useMemo(() => {
    if (!entityData) return [];
    const recs: ActionRecommendation[] = [];

    switch (entityType) {
      case "organization":
        if (entityData.status === "lead") {
          recs.push({
            id: "nba_schedule_discovery",
            title: "Schedule Discovery Call",
            description:
              "This organization is still a lead. Log a call or schedule a discovery meeting.",
            icon: <PlayCircle className="w-5 h-5 text-indigo-400" />,
            action: () =>
              navigate(
                `/app/communications?new=true&target=${entityData.id}&type=organization`,
              ),
            priority: "high",
          });
        }
        if (!entityData.mrr || entityData.mrr === 0) {
          recs.push({
            id: "nba_create_project",
            title: "Spin up Initial Project",
            description:
              "No active revenue mapped. Create an onboarding project or kick off a new engagement.",
            icon: <Plus className="w-5 h-5 text-emerald-400" />,
            action: () =>
              navigate(`/app/projects?new=true&client=${entityData.id}`),
            priority: "medium",
          });
        }
        break;

      case "project":
        if (entityData.status === "planning") {
          recs.push({
            id: "nba_start_project",
            title: "Transition to In-Progress",
            description:
              "Project is in planning phase. Generate initial tasks and move to active execution.",
            icon: <PlayCircle className="w-5 h-5 text-blue-400" />,
            action: () =>
              navigate(`/app/tasks?new=true&project=${entityData.id}`),
            priority: "high",
          });
        }
        if (!entityData.budget || entityData.budget === 0) {
          recs.push({
            id: "nba_set_budget",
            title: "Define Contract Value (Budget)",
            description:
              "Project lacks financial tracking. Update configuration to forecast resource run-rate.",
            icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
            action: () => {}, // Handled by inline edit in future
            priority: "medium",
          });
        }
        break;

      case "task":
        if (entityData.status === "todo") {
          recs.push({
            id: "nba_start_task",
            title: "Begin Execution",
            description:
              "This task is waiting to be started. Move it to In Progress to signal activity.",
            icon: <PlayCircle className="w-5 h-5 text-indigo-400" />,
            action: () => {}, // Triggers status inline edit mapped externally
            priority: "high",
          });
        }
        if (
          new Date(entityData.due_date) < new Date() &&
          entityData.status !== "done"
        ) {
          recs.push({
            id: "nba_escalate_task",
            title: "Escalate Overdue Task",
            description:
              "Task is past its deadline. Log a communication to unblock dependents.",
            icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
            action: () =>
              navigate(
                `/app/communications?new=true&target=${entityData.id}&type=task`,
              ),
            priority: "high",
          });
        }
        break;

      case "document":
        if (!entityData.is_processed) {
          recs.push({
            id: "nba_trigger_ocr",
            title: "Run AI Extraction Pipeline",
            description:
              "Document has not been processed. Trigger intelligence extraction for search parsing.",
            icon: <Zap className="w-5 h-5 text-yellow-500" />,
            action: () => {}, // Trigger pipeline
            priority: "high",
          });
        }
        break;

      case "communication":
        if (entityData.direction === "inbound") {
          recs.push({
            id: "nba_followup_task",
            title: "Generate Follow-Up Task",
            description:
              "This was an inbound interaction. Ensure a follow-up action is scheduled.",
            icon: <Plus className="w-5 h-5 text-emerald-400" />,
            action: () => navigate(`/app/tasks?new=true&comm=${entityData.id}`),
            priority: "medium",
          });
        }
        break;
    }

    // Default universal action if array is empty
    if (recs.length === 0) {
      recs.push({
        id: "nba_expand_network",
        title: "Expand Topological Network",
        description: `Add constraints to this ${entityType} by binding tasks, workflows, or contextual logs.`,
        icon: <Plus className="w-5 h-5 text-indigo-400" />,
        action: () => {},
        priority: "low",
      });
    }

    return recs;
  }, [entityType, entityData, navigate]);

  const finalRecommendations = useMemo(() => {
    if (aiRecommendation) {
      return [
        aiRecommendation,
        ...fallbackRecommendations
          .filter((r) => r.priority === "high")
          .slice(0, 1),
      ];
    }
    return fallbackRecommendations.slice(0, 2);
  }, [aiRecommendation, fallbackRecommendations]);

  if (finalRecommendations.length === 0 && !loadingAi) return null;

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Next Best Actions</h3>
        </div>
        {loadingAi && (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
        )}
      </div>

      <div className="space-y-3">
        {finalRecommendations.map((rec) => (
          <div
            key={rec.id}
            onClick={rec.action}
            className={`flex items-center p-4 rounded-xl border bg-slate-800/40 hover:bg-slate-700/60 transition-colors cursor-pointer group ${
              rec.priority === "high"
                ? "border-amber-500/20"
                : "border-slate-700"
            }`}
          >
            <div
              className={`p-2 rounded-lg mr-4 ${
                rec.priority === "high" ? "bg-amber-500/10" : "bg-slate-800"
              }`}
            >
              {rec.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>
    </Card>
  );
}
