import React from "react";
import {
  LayoutTemplate,
  PlusCircle,
  LayoutGrid,
  MonitorPlay,
  Save,
} from "lucide-react";

export default function DashboardPreferenceBuilder() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Dashboard Architecture
          </h2>
          <p className="text-slate-400">
            Map intended analytical widgets to specific firm roles natively.
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Save className="w-4 h-4 mr-2" /> Sync to Build Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-6">
        {/* Left Column: Role Targets */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-white font-medium text-sm uppercase tracking-wider mb-2">
            Target Demographics
          </h3>

          <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl cursor-pointer">
            <h4 className="text-indigo-400 font-semibold mb-1 text-sm">
              Managing Partner
            </h4>
            <p className="text-xs text-slate-400">
              Needs macro financial reporting and firm-wide case status
              aggregates.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <h4 className="text-white font-semibold mb-1 text-sm">Paralegal</h4>
            <p className="text-xs text-slate-400">
              Needs daily actionable task queues and discovery deadlines.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Layout Builder */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <span className="px-3 py-1.5 bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 flex items-center">
                <LayoutGrid className="w-3 h-3 mr-1" /> Grid
              </span>
              <span className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded border border-indigo-500 flex items-center">
                <MonitorPlay className="w-3 h-3 mr-1" /> Kiosk UI
              </span>
            </div>
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center">
              <PlusCircle className="w-4 h-4 mr-1" /> Add Widget
            </button>
          </div>

          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 grid grid-cols-6 gap-4">
            {/* Widget 1 */}
            <div className="col-span-4 bg-slate-900 rounded-lg border border-slate-800 border-dashed flex flex-col items-center justify-center p-6 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer min-h-[150px]">
              <LayoutTemplate className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Financial ARR Chart</span>
            </div>

            {/* Widget 2 */}
            <div className="col-span-2 bg-slate-900 rounded-lg border border-slate-800 border-dashed flex flex-col items-center justify-center p-6 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer min-h-[150px]">
              <LayoutTemplate className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Active Leads</span>
            </div>

            {/* Widget 3 */}
            <div className="col-span-6 bg-slate-900 rounded-lg border border-slate-800 border-dashed flex flex-col items-center justify-center p-6 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors cursor-pointer min-h-[200px]">
              <LayoutTemplate className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Recent Activity Feed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
