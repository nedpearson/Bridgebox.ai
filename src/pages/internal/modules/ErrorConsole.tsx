import { useState, useEffect } from "react";
import {
  commandCenterApi,
  InternalLog,
  InternalJob,
} from "../../../lib/commandCenter";
import {
  Flame,
  AlertOctagon,
  Terminal,
  Activity,
  RefreshCw,
} from "lucide-react";

export default function ErrorConsole() {
  const [errorLogs, setErrorLogs] = useState<InternalLog[]>([]);
  const [failedJobs, setFailedJobs] = useState<InternalJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    try {
      setLoading(true);
      const [logs, jobs] = await Promise.all([
        commandCenterApi.listLogs(50, { severity: "error" }),
        commandCenterApi.listJobs(50),
      ]);
      setErrorLogs(
        logs.filter((l) => l.severity === "error" || l.severity === "critical"),
      );
      setFailedJobs(jobs.filter((j) => j.status === "failed"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            Active Error Console
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Unified view of CRITICAL level application logs and failed
            background jobs.
          </p>
        </div>
        <button
          onClick={loadErrors}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Sync State
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Failed Jobs Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400" />
            <h3 className="text-white font-semibold">Failed Jobs Engine</h3>
            <span className="ml-auto bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">
              {failedJobs.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {failedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-slate-950 border border-red-500/20 rounded-lg group hover:border-red-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-200 font-semibold">
                    {job.job_type}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">
                    {job.id.split("-")[0]}
                  </span>
                </div>
                <div className="text-red-400 text-sm font-mono whitespace-pre-wrap bg-red-950/20 p-2 rounded">
                  {job.failure_reason || "Unknown fatal error"}
                </div>
                <div className="mt-3 text-xs text-slate-500 flex justify-between">
                  <span>
                    Failed: {new Date(job.created_at).toLocaleString()}
                  </span>
                  <span>Retries: {job.retry_count}</span>
                </div>
              </div>
            ))}
            {failedJobs.length === 0 && !loading && (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono">
                No failed jobs detected.
              </div>
            )}
          </div>
        </div>

        {/* Error Logs Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-500" />
            <h3 className="text-white font-semibold">
              Unhandled Exceptions (Logs)
            </h3>
            <span className="ml-auto bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">
              {errorLogs.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {errorLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span className="text-slate-300 text-sm font-semibold">
                    {log.type}
                  </span>
                  {log.module && (
                    <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-xs">
                      {log.module}
                    </span>
                  )}
                  <span className="ml-auto text-slate-500 font-mono text-xs">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-400 text-sm font-mono whitespace-pre-wrap">
                  {log.message}
                </div>
              </div>
            ))}
            {errorLogs.length === 0 && !loading && (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono">
                No error logs detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
