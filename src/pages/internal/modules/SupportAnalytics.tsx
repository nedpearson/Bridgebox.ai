import React, { useState, useEffect } from "react";
import { supportTicketsApi, SupportTicket } from "../../../lib/supportTickets";
import {
  devQaAiApi,
  InternalBugReport,
  InternalQaTestCase,
} from "../../../lib/devQaAi";
import {
  Loader2,
  Activity,
  PieChart,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Bug,
  TestTube2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SupportAnalytics() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bugs, setBugs] = useState<InternalBugReport[]>([]);
  const [qaTests, setQaTests] = useState<InternalQaTestCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const [ticketsData, bugsData, qaData] = await Promise.all([
        supportTicketsApi.getAllTickets(),
        devQaAiApi.getAllBugReports(),
        devQaAiApi.getAllQaTestCases(),
      ]);
      setTickets(ticketsData);
      setBugs(bugsData);
      setQaTests(qaData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Analytics Computation
  const total = tickets.length;
  const resolved = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  ).length;
  const critical = tickets.filter(
    (t) => t.ai_severity === "critical" || t.ai_severity === "high",
  ).length;
  const withSessions = tickets.filter((t) => !!t.session_code).length;

  const getProductAreaSplit = () => {
    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      const area = t.ai_product_area || "Unclassified";
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-2">
            <PieChart className="w-8 h-8 text-indigo-500" />
            <span>Support Operations Analytics</span>
          </h1>
          <p className="text-slate-400">
            Real-time telemetry measuring pipeline health, SLA velocity, and AI
            categorization heuristics.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium text-sm">
              Total Ingestion
            </h3>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{total}</div>
          <p className="text-slate-500 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
            +12% vs last cycle
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium text-sm">
              Resolution Rate
            </h3>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}%
          </div>
          <p className="text-slate-500 text-xs">
            Tickets closed or marked resolved
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium text-sm">
              Critical Severity
            </h3>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{critical}</div>
          <p className="text-slate-500 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded inline-block">
            Requires Immediate Triage
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 font-medium text-sm">
              Screen Assist Ops
            </h3>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {withSessions}
          </div>
          <p className="text-slate-500 text-xs">
            Total live WebRTC hook executions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Product Area Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold flex items-center space-x-2 mb-6">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Defect Origin by Product Area (AI Classified)</span>
          </h3>
          <div className="space-y-4">
            {getProductAreaSplit().map(([area, count]) => (
              <div key={area}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">{area}</span>
                  <span className="text-slate-500">{count} events</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center">
          <h3 className="text-white font-semibold flex items-center mb-6">
            <Bug className="w-4 h-4 text-rose-400 mr-2" />
            AI QA & Defect Tracking
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                <Bug className="w-3 h-3 mr-1" /> Verified Bugs
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {bugs.length}
              </div>
              <div className="text-xs text-rose-400">
                {bugs.filter((b) => b.severity === "critical").length} Critical
                Priority
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                <TestTube2 className="w-3 h-3 mr-1" /> Authored QA Contexts
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {qaTests.length}
              </div>
              <div className="text-xs text-indigo-400">
                {qaTests.filter((q) => q.status === "approved").length} Approved
                for Build
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
