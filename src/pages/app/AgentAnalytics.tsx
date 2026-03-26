import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Cpu, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Mock calculation mapping since these metrics depend on exact execution ms tracking across edge functions
export default function AgentAnalytics() {
  const { currentOrganization } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization) loadTelemetry();
  }, [currentOrganization]);

  const loadTelemetry = async () => {
    try {
      setLoading(true);

      // In production, BB would aggregate bb_agent_audit_logs via RPC to calculate exact saved time
      const { data, error } = await supabase
        .from('bb_agent_audit_logs')
        .select('event_type, execution_time_ms')
        .eq('organization_id', currentOrganization?.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) throw error;

      const logs = data || [];
      const executed = logs.filter(l => l.event_type === 'executed').length;
      const failed = logs.filter(l => l.event_type === 'failed').length;
      const drafted = logs.filter(l => l.event_type === 'drafted_for_review').length;
      const blocked = logs.filter(l => l.event_type === 'blocked_by_policy').length;

      // Estimate: Every executed action saves ~4 minutes of human coordination
      const minutesSaved = executed * 4;
      const hoursSaved = (minutesSaved / 60).toFixed(1);

      // Average cost per hour of employee = $35
      const revenueImpact = (minutesSaved / 60) * 35;

      setMetrics({
        executed,
        failed,
        drafted,
        blocked,
        hoursSaved,
        revenueImpact,
        successRate: executed === 0 ? 0 : Math.round((executed / (executed + failed)) * 100)
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader
        title="Agent Analytics & ROI"
        subtitle="Measure the operational impact, cost savings, and execution reliability of your autonomous workforce."
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>)}
            </div>
            <div className="h-64 bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
          </div>
        ) : !metrics ? (
           <Card className="p-12 text-center bg-slate-900 border-slate-800 text-slate-400">
             Failed to load telemetry.
           </Card>
        ) : (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Time Reclaimed (30d)
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.hoursSaved} <span className="text-lg text-slate-500 font-normal">hrs</span></div>
                  <div className="mt-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 flex inline-flex rounded items-center">
                    <TrendingUp className="w-3 h-3 mr-1" /> Human Equivalent
                  </div>
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Labor Cost Saved (30d)
                  </div>
                  <div className="text-3xl font-black text-white">${metrics.revenueImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Est. at $35/hr operational value
                  </div>
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Tasks Executed
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.executed}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Across {metrics.drafted} total drafted proposals
                  </div>
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                  <div className="text-slate-400 text-sm font-medium mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Success Rate
                  </div>
                  <div className="text-3xl font-black text-white">{metrics.successRate}%</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Failures generally imply API or context blocks.
                  </div>
               </Card>
            </div>

            {/* Execution Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="p-6 bg-slate-900 border-slate-800 lg:col-span-2">
                 <h3 className="text-lg font-bold text-white mb-6">Recent Anomaly Interceptions</h3>
                 
                 {metrics.blocked === 0 && metrics.failed === 0 ? (
                    <div className="py-12 text-center text-slate-500 flex flex-col items-center">
                      <ShieldAlert className="w-12 h-12 mb-3 text-emerald-500/50" />
                      No catastrophic failures or bounded policy blocks detected. Running clean.
                    </div>
                 ) : (
                    <div className="space-y-4">
                      {/* Note: This would map distinct failed/blocked messages from bb_agent_audit_logs */}
                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                         <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                         <div>
                            <div className="text-white font-medium mb-1">Policy Block: Rate Limit Exceeded</div>
                            <div className="text-sm text-slate-400">An agent attempted to trigger more than 50 outbound signals locally. The PolicyEngine intercepted the execution and clamped autonomy.</div>
                         </div>
                      </div>
                    </div>
                 )}
               </Card>

               <Card className="p-6 bg-slate-900 border-slate-800">
                 <h3 className="text-white font-bold mb-4">Operations Profile</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Total Evaluated Actions</span>
                       <span className="text-white font-medium">{metrics.executed + metrics.failed + metrics.drafted + metrics.blocked}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Inbox Requires Review</span>
                       <span className="text-blue-400 font-bold">{metrics.drafted}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Policy Interventions</span>
                       <span className="text-amber-400 font-bold">{metrics.blocked}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Hard Failures</span>
                       <span className="text-red-400 font-bold">{metrics.failed}</span>
                    </div>
                 </div>
               </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
