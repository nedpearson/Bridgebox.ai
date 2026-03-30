import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Bell,
  Search,
  Plus,
  MoreVertical,
  LayoutGrid,
  CheckSquare,
  ArrowRight,
  MousePointerClick,
  Database,
  Activity,
} from "lucide-react";

export type MockupLayoutType =
  | "dashboard"
  | "kanban"
  | "detail"
  | "table"
  | "generic";

interface VirtualPrototypeCanvasProps {
  layoutType: MockupLayoutType;
  screenName: string;
  onInteract?: () => void;
  isLastScreen?: boolean;
}

export default function VirtualPrototypeCanvas({
  layoutType,
  screenName,
  onInteract,
  isLastScreen,
}: VirtualPrototypeCanvasProps) {
  // Shared Header
  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-500/10 bg-slate-900/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="font-semibold text-white tracking-wide">
          {screenName}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <div className="w-24 h-2 bg-slate-700/50 rounded-full" />
        </div>
        <Bell className="w-4 h-4 text-slate-500" />
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* KPIs with REAL text */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Shipments",
            value: "1,248",
            desc: "+12% this week",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Global Revenue",
            value: "$84,290",
            desc: "Upward trend",
            icon: BarChart3,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Current Fleet",
            value: "42 Active",
            desc: "3 maintenance",
            icon: LayoutDashboard,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            label: "System Alerts",
            value: "2 Warnings",
            desc: "Check logs",
            icon: Bell,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onInteract}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border cursor-pointer transition-colors relative overflow-hidden group ${i === 1 ? "bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/60"}`}
          >
            {/* Click Ripple Indicator */}
            {i === 1 && (
              <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                  <MousePointerClick className="w-3 h-3" /> Click to Drilldown
                </span>
              </div>
            )}
            <div
              className={`w-8 h-8 rounded-lg ${kpi.bg} mb-3 flex items-center justify-center relative z-10`}
            >
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-xs text-slate-400 font-medium mb-1 relative z-10 uppercase tracking-wider">
              {kpi.label}
            </div>
            <div className="text-2xl text-white font-bold relative z-10 font-mono tracking-tight">
              {kpi.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 relative z-10">
              {kpi.desc}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-2 h-48 bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 flex flex-col justify-end gap-2 overflow-hidden relative"
        >
          {/* Abstract Chart lines */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent flex items-end px-4 gap-2 pb-4">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 80 + 20}%` }}
                transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                className="flex-1 bg-indigo-500/20 rounded-t-sm"
              />
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="h-48 bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 space-y-3 overflow-hidden"
        >
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">
            Recent Fleet Activity
          </div>
          {[
            { name: "Shipment #1042", stat: "Manifest Replicated", time: "2m" },
            {
              name: "Route Optimization",
              stat: "Calculation complete",
              time: "14m",
            },
            { name: "Driver Portal", stat: "New login detected", time: "1h" },
            { name: "API Sync", stat: "Legacy data mapped", time: "3h" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex flex-shrink-0 items-center justify-center text-[10px] text-indigo-400 font-bold border border-indigo-500/30">
                {item.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium truncate">
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {item.stat}
                </div>
              </div>
              <div className="text-[10px] text-indigo-300 font-mono flex-shrink-0">
                {item.time}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="p-6 flex gap-4 overflow-hidden h-[400px]">
      {["To-Do", "In Progress", "In Review", "Done"].map((col, idx) => (
        <motion.div
          key={col}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="flex-1 min-w-[240px] bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-semibold text-slate-300">{col}</span>
            <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center text-[10px] text-slate-400">
              {3 - (idx % 2)}
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[...Array(3 - (idx % 2))].map((_, cardIdx) => (
              <motion.div
                key={cardIdx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInteract}
                className={`border rounded-lg p-3 shadow-sm transition-all cursor-pointer group relative overflow-hidden ${idx === 1 && cardIdx === 0 ? "bg-indigo-900/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-slate-900 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/80"}`}
              >
                {/* Click Ripple Indicator */}
                {idx === 1 && cardIdx === 0 && (
                  <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5">
                      <MousePointerClick className="w-3 h-3" /> View
                      Requirements
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-2 relative z-10">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                    Client Dev
                  </span>
                  {cardIdx % 2 === 0 && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                      UI Clone
                    </span>
                  )}
                </div>
                <div className="text-xs text-white font-bold mb-1 relative z-10 leading-tight">
                  Implement Servicargo Clone Protocol #{idx}
                  {cardIdx}
                </div>
                <div className="text-[10px] text-slate-400 mb-3 relative z-10 line-clamp-2">
                  Ensure exactly replicated logic from original footage provided
                  by client.
                </div>

                <div className="flex items-center justify-between mt-auto relative z-10 border-t border-slate-700/50 pt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare
                      className={`w-3.5 h-3.5 ${idx === 1 && cardIdx === 0 ? "text-indigo-400" : "text-slate-500"}`}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      2/5
                    </span>
                  </div>
                  <div
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${idx === 1 && cardIdx === 0 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-300"}`}
                  >
                    Ned Pearson
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDetail = () => (
    <div className="flex h-[520px] w-full">
      {/* Sidebar Sandbox */}
      <div className="w-64 border-r border-slate-700/50 bg-slate-800/20 p-4 space-y-6 overflow-y-auto shrink-0">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Linked Schema Objects
        </div>
        {["User Database", "Delivery Endpoints", "Payment Gateway"].map(
          (label, i) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onInteract}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border cursor-pointer transition-colors relative overflow-hidden group mb-2 shadow-sm ${i === 1 ? "bg-indigo-900/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60"}`}
            >
              {/* Click Ripple Indicator */}
              {i === 1 && (
                <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-20">
                  <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5">
                    <MousePointerClick className="w-3 h-3" /> Execute Trigger
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 relative z-10 w-full">
                <Database
                  className={`w-3.5 h-3.5 ${i === 1 ? "text-indigo-400" : "text-slate-400"}`}
                />
                <span
                  className={`text-[11px] font-medium flex-1 ${i === 1 ? "text-indigo-100" : "text-slate-300"}`}
                >
                  {label}
                </span>
                {i === 1 && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30">
                    ACTIVE
                  </span>
                )}
              </div>
            </motion.div>
          ),
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        {/* SIDE-BY-SIDE WALKTHROUGH COMPARISON */}
        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
          {/* Player 1: Original Footage */}
          <div className="border border-slate-700/60 rounded-xl bg-slate-900 overflow-hidden flex flex-col shadow-inner">
            <div className="px-3 py-1.5 bg-black/40 border-b border-slate-700/60 flex items-center justify-between">
              <div className="uppercase tracking-widest text-[9px] font-bold text-white flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_Infinity]" />
                Original Recorded Footage
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[9px] text-slate-500 font-mono">
                  0:14 / 1:22
                </div>
                <button className="text-[9px] bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 cursor-pointer transition-colors">
                  <MousePointerClick className="w-3 h-3" /> DRILL DOWN
                </button>
              </div>
            </div>
            <div className="relative h-64 flex flex-col opacity-75 bg-[#f0f2f5] overflow-hidden">
              {/* Hyper-realistic Real Visuals for Legacy Software */}
              <div className="w-full h-5 bg-[#3b5998] flex items-center px-2 gap-2 text-white/80 shrink-0 shadow">
                <LayoutDashboard className="w-3 h-3" />
                <span className="text-[8px] font-bold tracking-widest uppercase">
                  Admin Portal v4.2
                </span>
              </div>
              <div className="flex flex-1 overflow-hidden relative">
                <div className="w-16 bg-white border-r border-[#d3d6db] p-1.5 space-y-1">
                  {[1, 2, 3, 4].map((btn) => (
                    <div
                      key={btn}
                      className="h-2 w-full bg-[#e9ebee] rounded border border-[#ccd0d5]"
                    />
                  ))}
                </div>
                <div className="flex-1 p-2 space-y-2 relative overflow-hidden">
                  <div className="text-[10px] font-bold text-[#1d2129]">
                    Customer CRM Overview
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-[#ccd0d5] h-8 rounded p-1 flex items-center shadow-sm text-[8px] font-bold text-[#1d2129] px-2">
                      <Users className="w-3 h-3 text-[#3b5998] mr-1" /> Active
                      Stats
                    </div>
                    <div className="bg-white border border-[#ccd0d5] h-8 rounded p-1 flex flex-col justify-center shadow-sm text-[7px] text-[#4b4f56] px-2">
                      Metric 2<br />
                      <span className="text-[#1d2129] font-bold text-[9px]">
                        $44,592
                      </span>
                    </div>
                  </div>
                  <div className="bg-white border border-[#ccd0d5] shadow-sm rounded flex flex-col pb-1">
                    <div className="h-3 bg-[#e9ebee] border-b border-[#ccd0d5] w-full mt-1 mb-1" />
                    {[1, 2, 3].map((row) => (
                      <div
                        key={row}
                        className="h-1.5 bg-[#f6f7f9] mx-1 mb-0.5"
                      />
                    ))}
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1], y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute bottom-2 right-4 text-[#3b5998]"
                  >
                    <MousePointerClick className="w-4 h-4 fill-white" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Player 2: Replicated Synthesized App */}
          <div className="border border-indigo-500/40 rounded-xl bg-[#030614] overflow-hidden flex flex-col shadow-[0_0_20px_rgba(99,102,241,0.2)] relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="px-3 py-1.5 bg-black/60 border-b border-indigo-500/30 flex items-center justify-between relative z-10 backdrop-blur-md">
              <div className="uppercase tracking-widest text-[9px] font-bold text-indigo-300 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Bridgebox Replicated Feature
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[9px] text-indigo-400 font-mono tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  LIVE RUNTIME
                </div>
                <button className="text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 cursor-pointer transition-colors shadow-indigo-500/20">
                  <MousePointerClick className="w-3 h-3" /> DRILL DOWN
                </button>
              </div>
            </div>
            <div className="relative h-64 flex bg-[#060a14] relative z-10 overflow-hidden">
              {/* Hyper-realistic Modern Software Mockup Recording */}
              <div className="w-20 border-r border-slate-800/80 bg-[#02040a] space-y-2 p-2 relative z-10">
                <div className="h-4 w-4 rounded bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] flex items-center justify-center text-white mb-4">
                  <span className="text-[7px] font-bold">BB</span>
                </div>
                {[LayoutDashboard, Activity, Users, Settings].map(
                  (Icon, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 2 }}
                      className={`flex items-center gap-1.5 p-1 rounded transition-colors ${idx === 1 ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      <Icon className="w-3 h-3" />
                      <div
                        className={`h-1 flex-1 rounded ${idx === 1 ? "bg-indigo-400/50" : "bg-slate-700"}`}
                      />
                    </motion.div>
                  ),
                )}
              </div>
              <div className="flex-1 p-3 space-y-3 relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px]">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-24 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text text-[9px] font-bold uppercase tracking-widest leading-none">
                    Global Network Output
                  </div>
                  <div className="h-3 w-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Bell className="w-1.5 h-1.5 text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 h-10">
                  <div className="flex-1 bg-slate-900 border-t border-indigo-500/50 rounded shadow-[inset_0_1px_rgba(255,255,255,0.1)] relative overflow-hidden p-1.5 flex flex-col justify-between">
                    <div className="text-[7px] text-slate-400 uppercase tracking-widest font-bold">
                      Peak Volumes
                    </div>
                    <div className="text-sm font-light text-white leading-none">
                      94,302
                    </div>
                    <motion.div
                      animate={{ width: ["0%", "100%"] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute bottom-0 left-0 bg-indigo-500/40 h-[2px]"
                    />
                  </div>
                  <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded relative overflow-hidden p-1.5 flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <Activity className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[6px] text-slate-500 uppercase">
                        Status
                      </span>
                      <span className="text-[8px] text-emerald-400 font-bold tracking-wider">
                        DEPLOYED
                      </span>
                    </div>
                  </div>
                </div>

                {/* High Quality Automated Replica App Interaction Cursor */}
                <motion.div
                  animate={{
                    x: [0, 60, 20, 0],
                    y: [0, 8, -5, 0],
                    scale: [1, 0.9, 1, 1],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-[30%] top-[40%] z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                >
                  <MousePointerClick className="w-4 h-4 text-white fill-[#060a14]" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-slate-700/50 pb-2 shrink-0">
          {["Overview", "Activity Logs", "Connections", "Settings"].map(
            (tab, i) => (
              <div
                key={tab}
                className={`text-sm px-2 py-1 font-medium ${i === 0 ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-400"}`}
              >
                {tab}
              </div>
            ),
          )}
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0 pb-4">
          {[
            {
              title: "GPS Tracking Integration",
              desc: "Real-time latitude/longitude mapping system",
              stat: "Completed",
            },
            {
              title: "Stripe Invoice Generation",
              desc: "Automate PDF exports natively in browser",
              stat: "Pending",
            },
            {
              title: "Push Notification Subsystem",
              desc: "Firebase websocket relay connected",
              stat: "Testing",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 flex gap-4 hover:border-indigo-500/30 transition-colors shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                <CheckSquare
                  className={`w-4 h-4 ${i === 0 ? "text-emerald-400" : "text-slate-400"}`}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {item.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border ${i === 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : i === 1 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}
                  >
                    {item.stat}
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">
                  {item.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Floating Form Actions */}
        <div className="mt-auto border-t border-slate-700/50 pt-4 flex justify-end gap-3 shrink-0 bg-[#060a14] relative z-20">
          <div className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-sm font-medium">
            Cancel
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInteract}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 cursor-pointer flex items-center gap-2 group"
          >
            {isLastScreen ? "Finish Tour" : "Save & Continue"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#0a0f1c] border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl relative">
      <Header />
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1c] to-[#0a0f1c]">
        {layoutType === "dashboard" && renderDashboard()}
        {layoutType === "kanban" && renderKanban()}
        {layoutType === "detail" && renderDetail()}
        {(layoutType === "table" || layoutType === "generic") &&
          renderDetail()}{" "}
        {/* Fallback to detail mapping for generic lists */}
      </div>

      {/* Overlay Glow */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl block" />
    </div>
  );
}

const ImageIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
