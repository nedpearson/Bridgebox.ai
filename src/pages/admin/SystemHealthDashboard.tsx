import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ServerCrash,
  Zap,
  Users,
  Activity,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import Card from "../../components/Card";
import AppHeader from "../../components/app/AppHeader";

interface HealthStats {
  totalEvents: number;
  errorVolume: number;
  apiSyncFails: number;
  featureDropoffs: number;
}

export default function SystemHealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HealthStats>({
    totalEvents: 0,
    errorVolume: 0,
    apiSyncFails: 0,
    featureDropoffs: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);

      // Mock aggregates based on the structured Intelligence Layer
      const [{ count: totalEvents }, { count: dropoffs }, { data: recent }] =
        await Promise.all([
          supabase
            .from("bb_intelligence_events")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("bb_intelligence_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", "feature_dropoff"),
          supabase
            .from("bb_intelligence_events")
            .select(
              "id, event_type, module, metadata, created_at, bb_organizations(name)",
            )
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

      setStats({
        totalEvents: totalEvents || 0,
        errorVolume: 0, // Mocked for UI pending workflow log join
        apiSyncFails: 0,
        featureDropoffs: dropoffs || 0,
      });

      setRecentEvents(recent || []);
    } catch (err) {
      console.error("Failed to load system health data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AppHeader
        title="Intelligence Telemetry"
        subtitle="Global system health, orchestration metrics, and feature dropoff patterns."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-slate-400 font-medium">Telemetry Volume</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <ServerCrash className="w-5 h-5 text-red-400" />
            <h3 className="text-slate-400 font-medium">Orchestration Errors</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.errorVolume}</p>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-slate-400 font-medium">API Desyncs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.apiSyncFails}</p>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-slate-400 font-medium">UX Dropoffs</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.featureDropoffs}
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Event Stream</h3>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="pb-3 px-4 font-medium">Tenant</th>
                  <th className="pb-3 px-4 font-medium">Event Type</th>
                  <th className="pb-3 px-4 font-medium">Module</th>
                  <th className="pb-3 px-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-white">
                      {event.bb_organizations?.name || "Unknown"}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          event.event_type.includes("error")
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : event.event_type.includes("dropoff")
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {event.event_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{event.module}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentEvents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No telemetry events logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
