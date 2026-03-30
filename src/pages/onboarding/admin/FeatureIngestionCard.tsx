import React from "react";
import { Cpu, Combine, Rocket, ShieldAlert } from "lucide-react";

export default function FeatureIngestionCard() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Platform Ingestion & Extensibility
        </h2>
        <p className="text-slate-400">
          Analyze requested functionality against existing Bridgebox
          architecture to flag new product features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Match */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl relative">
          <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-4 border-slate-950">
            <Combine className="w-4 h-4" />
          </span>
          <h3 className="text-emerald-400 font-medium mb-2 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" /> Existing Platform Match
          </h3>
          <h4 className="text-white font-bold text-lg mb-1">
            Time Tracking Tool
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Client requested absolute granular time tracking capabilities.
            Bridgebox core architecture already natively supports this module
            via the standard execution.
          </p>
          <button className="px-3 py-1.5 bg-slate-950 border border-emerald-500/30 text-emerald-400 text-xs rounded transition-colors hover:bg-emerald-500/10">
            Map to Core Feature Flag
          </button>
        </div>

        {/* Net New Extensibility Bridge */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-2xl relative">
          <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center border-4 border-slate-950">
            <Rocket className="w-4 h-4" />
          </span>
          <h3 className="text-indigo-400 font-medium mb-2 flex items-center">
            <Cpu className="w-4 h-4 mr-2" /> Extension Payload Required
          </h3>
          <h4 className="text-white font-bold text-lg mb-1">
            Optical Character Recognition (OCR)
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Client requested automated scanning of physical depositions into
            digital case nodes. This is a net-new feature requiring Antigravity
            system execution.
          </p>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors font-mono">
            &gt; INJECT FEATURE BUILD
          </button>
        </div>
      </div>
    </div>
  );
}
