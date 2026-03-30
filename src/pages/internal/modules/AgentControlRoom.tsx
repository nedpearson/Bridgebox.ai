import { useState } from "react";
import {
  BrainCircuit,
  Play,
  CheckCircle,
  Terminal,
  Copy,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { FeatureIngestionAgent } from "../../../lib/ai/agents/FeatureIngestionAgent";
import { StackDiscoveryAgent } from "../../../lib/ai/agents/StackDiscoveryAgent";

export default function AgentControlRoom() {
  const [activeTab, setActiveTab] = useState<"matrix" | "antigravity">(
    "matrix",
  );
  const [testInput, setTestInput] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const agents = [
    {
      name: "Stack Discovery Agent",
      desc: "Maps text to Integration Topologies",
      func: StackDiscoveryAgent.mapTopology,
    },
    {
      name: "Solution Architect",
      desc: "Transcripts to DB Schema constraints",
      func: null,
    },
    {
      name: "Workflow Architect",
      desc: "Intent to Automation Rules",
      func: null,
    },
    {
      name: "Integration Planner",
      desc: "Payloads to Column Mappings",
      func: null,
    },
    {
      name: "Feature Ingestor",
      desc: "Gaps to Antigravity Prompts",
      func: FeatureIngestionAgent.draftCodePrompt,
    },
    { name: "Support / Debug", desc: "V8 Traces to DevTasks", func: null },
    {
      name: "Build Orchestrator",
      desc: "Triggers physical DB writes",
      func: null,
    },
  ];

  const runTest = async (
    agentFunc: (params: { intent: string }) => Promise<any>,
  ) => {
    if (!testInput.trim()) return;
    setRunning(true);
    try {
      const res = await agentFunc({ intent: testInput });
      setOutput(res);
    } catch (e) {
      setOutput({ error: String(e) });
    } finally {
      setRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            Bridgebox Super Agent Matrix
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Orchestration observation deck for the 7 autonomous intelligence
            modules.
          </p>
        </div>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "matrix" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Matrix Status
          </button>
          <button
            onClick={() => setActiveTab("antigravity")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "antigravity" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            Antigravity Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Roster */}
        <div className="lg:col-span-1 border border-slate-800 rounded-xl bg-slate-900/50 p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Active Neural Threads
          </h3>
          {agents.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200">{a.name}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
              {a.func ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Execution Terminal */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-slate-900/50 flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">
              Manual Override Terminal
            </h3>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">
                Dispatch Intent payload strings
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="e.g. 'We need a visual widget that calculates amortized loan payments automatically on the pipeline board...'"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 min-h-[100px]"
              />
            </div>

            <div className="flex gap-4">
              <button
                disabled={running}
                onClick={() => runTest(FeatureIngestionAgent.draftCodePrompt)}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                {running ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Trigger Feature Ingestor (Antigravity Bridge)
              </button>
              <button
                disabled={running}
                onClick={() => runTest(StackDiscoveryAgent.mapTopology)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                {running ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Trigger Stack Discovery
              </button>
            </div>

            {output && (
              <div className="mt-6 border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">
                    Agent Output Sequence
                  </span>
                  {output?.data?.compiled_prompt && (
                    <button
                      onClick={() =>
                        copyToClipboard(output.data.compiled_prompt)
                      }
                      className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <Copy className="w-3 h-3" />{" "}
                      {copied ? "Copied to IDE" : "Copy Antigravity Prompt"}
                    </button>
                  )}
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </div>
            )}

            {!output && !running && (
              <div className="h-48 flex items-center justify-center text-slate-600 font-mono text-sm border-2 border-dashed border-slate-800/50 rounded-lg mt-4">
                Awaiting manual matrix trigger...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
