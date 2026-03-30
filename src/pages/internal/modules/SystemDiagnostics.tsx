import { Search, Globe, BoxSelect, Database, ServerCrash } from "lucide-react";

export default function SystemDiagnostics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-teal-400" />
            System Diagnostics & Search
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Global surface maps, feature flagging, and cross-module AI querying
            (Placeholder).
          </p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search internal telemetry..."
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-teal-400 outline-none w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route Surface Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <BoxSelect className="w-5 h-5 text-teal-400" />
            <h3 className="text-white font-semibold">Protected Surface Map</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-300 font-mono text-sm">/app/*</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs">
                Auth + RoleGuard(Internal)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-300 font-mono text-sm">
                /portal/*
              </span>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs">
                Auth + RoleGuard(Client)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-300 font-mono text-sm">
                /internal/*
              </span>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold focus:animate-pulse">
                SUPER ADMIN ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Feature Flags Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="text-white font-semibold">
                Operational Feature Flags
              </h3>
            </div>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 rounded">
              Read-Only
            </span>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <ServerCrash className="w-12 h-12 text-slate-700 mb-4" />
            <h4 className="text-slate-300 font-medium mb-1">
              Flag Engine Not Configured
            </h4>
            <p className="text-sm text-slate-500 max-w-xs">
              Live toggling of architecture modules (e.g. disabling billing
              engine) requires an immutable flag distribution layer to be safely
              deployed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
