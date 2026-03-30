import { useState, useEffect } from "react";
import { commandCenterApi, InternalJob } from "../../../lib/commandCenter";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  XSquare,
} from "lucide-react";

export default function JobsMonitor() {
  const [jobs, setJobs] = useState<InternalJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const data = await commandCenterApi.listJobs(50);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-red-400">
            <XCircle className="w-4 h-4" /> Failed
          </span>
        );
      case "running":
        return (
          <span className="flex items-center gap-1 text-blue-400">
            <RefreshCw className="w-4 h-4 animate-spin" /> Running
          </span>
        );
      case "queued":
        return (
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-4 h-4" /> Queued
          </span>
        );
      case "retrying":
        return (
          <span className="flex items-center gap-1 text-amber-400">
            <RefreshCw className="w-4 h-4" /> Retrying
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-slate-500">
            <XSquare className="w-4 h-4" /> Cancelled
          </span>
        );
      default:
        return <span className="text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" />
            Background Jobs
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Monitor async processing, extractions, and background pipelines.
          </p>
        </div>
        <button
          onClick={loadJobs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Job ID</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Started</th>
                <th className="p-4 font-medium">Completed</th>
                <th className="p-4 font-medium">Retries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-800/20 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {job.id.split("-")[0]}...
                  </td>
                  <td className="p-4 text-sm text-white font-medium">
                    {job.job_type}
                  </td>
                  <td className="p-4 text-sm">
                    {getStatusDisplay(job.status)}
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {job.started_at
                      ? new Date(job.started_at).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {job.completed_at
                      ? new Date(job.completed_at).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {job.retry_count > 0 ? (
                      <span className="text-amber-400">{job.retry_count}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-500 font-mono"
                  >
                    No background jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
