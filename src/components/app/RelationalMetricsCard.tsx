import React, { useState, useEffect } from "react";
import {
  Network,
  CheckCircle2,
  FileText,
  MessageSquare,
  GitMerge,
} from "lucide-react";
import {
  entityLinkService,
  EntityType,
  EntityLink,
} from "../../lib/db/entityLinks";
import Card from "../Card";

import { Link } from "react-router-dom";

interface RelationalMetricsCardProps {
  entityType: EntityType;
  entityId: string;
}

export default function RelationalMetricsCard({
  entityType,
  entityId,
}: RelationalMetricsCardProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [totalEdges, setTotalEdges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [entityType, entityId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await entityLinkService.getEntityLinkCounts(
        entityType,
        entityId,
      );
      setCounts(data);
      const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);
      setTotalEdges(total);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCount = (type: EntityType) => {
    return counts[type] || 0;
  };

  if (loading) {
    return (
      <Card glass className="p-6">
        <div className="flex items-center space-x-2 text-slate-400 mb-4">
          <Network className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Relational Footprint</h3>
        </div>
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 bg-slate-800 rounded-lg flex-1"></div>
          <div className="h-12 bg-slate-800 rounded-lg flex-1"></div>
          <div className="h-12 bg-slate-800 rounded-lg flex-1"></div>
          <div className="h-12 bg-slate-800 rounded-lg flex-1"></div>
        </div>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Tasks",
      count: getCount("task"),
      icon: CheckCircle2,
      route: "tasks",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-500/20",
    },
    {
      label: "Files",
      count: getCount("document"),
      icon: FileText,
      route: "documents",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Logs",
      count: getCount("communication"),
      icon: MessageSquare,
      route: "communications",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Flows",
      count: getCount("workflow"),
      icon: GitMerge,
      route: "workflows",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <Card glass className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Topological Impact</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
          {totalEdges} Total Edges
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Link
              key={i}
              to={`/app/${m.route}?context=${entityId}&contextType=${entityType}`}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border ${m.border} ${m.bg} bg-opacity-50 hover:bg-opacity-80 transition-all cursor-pointer`}
            >
              <Icon className={`w-6 h-6 ${m.color} mb-2`} />
              <span className="text-2xl font-bold text-white">{m.count}</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                {m.label}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
