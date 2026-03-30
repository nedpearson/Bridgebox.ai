// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Activity } from "lucide-react";
import Card from "../Card";
import Button from "../Button";
import Badge from "../Badge";
import { documentProcessor } from "../../lib/documents/DocumentProcessor";

interface BatchProcessorProps {
  organizationId: string;
}

export default function BatchProcessor({
  organizationId,
}: BatchProcessorProps) {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [organizationId]);

  const loadStats = async () => {
    try {
      const data = await documentProcessor.getQueueStats(organizationId);
      setStats(data);
    } catch (err) {
      console.error("Failed to load queue stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (stats.total === 0) {
    return null;
  }

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4 bg-slate-900/50 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">
                Processing Queue
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>
                  <Badge color="amber" className="text-xs mr-1">
                    {stats.pending}
                  </Badge>
                  Pending
                </span>
                <span>
                  <Badge color="blue" className="text-xs mr-1">
                    {stats.processing}
                  </Badge>
                  Processing
                </span>
                <span>
                  <Badge color="green" className="text-xs mr-1">
                    {stats.completed}
                  </Badge>
                  Completed
                </span>
                {stats.failed > 0 && (
                  <span>
                    <Badge color="red" className="text-xs mr-1">
                      {stats.failed}
                    </Badge>
                    Failed
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-white mb-1">
              {Math.round(progress)}%
            </div>
            <div className="text-xs text-slate-400">
              {stats.completed} of {stats.total}
            </div>
          </div>
        </div>

        <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
