import React, { useState } from "react";
import { Terminal, Copy, Save, AlertCircle, ShieldAlert } from "lucide-react";

export default function PromptBuilderPanel() {
  const [scope, setScope] = useState("full");

  const generatedPrompt = `BRIDGEBOX ENTERPRISE ARCHITECTURE BUILD

Target Module: ${scope === "full" ? "Complete E2E System" : scope === "db" ? "Relational Schemas Only" : "Frontend UI Only"}

Context Rules:
1. ONLY utilize absolute path structures across /src/components.
2. ENFORCE strict Row Level Security (RLS) policies pinning records to organization_id.
3. Automatically execute all Node.js and Supabase migrations synchronously.

Implement phase execution dynamically per the queued onboarding telemetry constraints.`;

  return (
    <div className="h-full flex flex-col lg:flex-row max-w-7xl mx-auto animate-fade-in gap-6">
      {/* Left Rail: Configuration Controls */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wide">
            Compiler Scope
          </h3>

          <div className="space-y-3">
            <label className="flex items-center p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-colors">
              <input
                type="radio"
                name="scope"
                value="full"
                checked={scope === "full"}
                onChange={(e) => setScope(e.target.value)}
                className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-900 rounded-full focus:ring-0 focus:ring-offset-0"
              />
              <span className="ml-3 text-sm text-white font-medium">
                Full Stack Architecture
              </span>
            </label>

            <label className="flex items-center p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-colors">
              <input
                type="radio"
                name="scope"
                value="db"
                checked={scope === "db"}
                onChange={(e) => setScope(e.target.value)}
                className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-900 rounded-full focus:ring-0 focus:ring-offset-0"
              />
              <span className="ml-3 text-sm text-slate-300">
                Database Schemas Only
              </span>
            </label>

            <label className="flex items-center p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-colors">
              <input
                type="radio"
                name="scope"
                value="ui"
                checked={scope === "ui"}
                onChange={(e) => setScope(e.target.value)}
                className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-900 rounded-full focus:ring-0 focus:ring-offset-0"
              />
              <span className="ml-3 text-sm text-slate-300">
                Frontend UI Only
              </span>
            </label>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
          <h4 className="flex items-center text-amber-500 font-medium text-sm mb-2">
            <ShieldAlert className="w-4 h-4 mr-2" /> Safe Mode Enabled
          </h4>
          <p className="text-xs text-amber-400/80 leading-relaxed">
            Prompt generation is automatically constraining destructive DB
            drops. Antigravity will be forced to use safe `ADD COLUMN`
            migrations.
          </p>
        </div>
      </div>

      {/* Main Editor Center */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center">
            <Terminal className="w-5 h-5 text-indigo-400 mr-2" />
            <h3 className="text-white font-medium">
              Antigravity Execution Payload
            </h3>
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Copy Prompt"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Save className="w-4 h-4 mr-2" /> Save to Template Library
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 bg-slate-950">
          <textarea
            value={generatedPrompt}
            readOnly
            className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-emerald-400 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>
    </div>
  );
}
