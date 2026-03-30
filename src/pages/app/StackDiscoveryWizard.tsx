import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Plus,
  Network,
  Cpu,
  ArrowRight,
  Loader2,
  Link2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Card from "../../components/Card";
import { AIProviderFactory } from "../../lib/ai/providers";

interface MappedIntegration {
  name: string;
  category: string;
  integrationDataFlow: "inbound" | "outbound" | "bidirectional";
  bridgeboxValue: string;
  complexity: "low" | "medium" | "high";
}

export default function StackDiscoveryWizard() {
  const [toolInput, setToolInput] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [mappedStack, setMappedStack] = useState<MappedIntegration[]>([]);
  const [error, setError] = useState("");

  const handleDiscover = async () => {
    if (!toolInput.trim()) return;
    setIsDiscovering(true);
    setError("");

    try {
      const provider = AIProviderFactory.getProvider();
      const prompt = `
A new client has listed the following software tools they use:
"${toolInput}"

Act as Bridgebox's Chief Architect. Map these tools into a visual topology object showing how Bridgebox intercepts them.
Return ONLY valid JSON wrapping a "stack" key holding an array.
Required interface per item:
- "name": string (e.g., "QuickBooks Online")
- "category": string (e.g., "Accounting", "CRM")
- "integrationDataFlow": strictly "inbound", "outbound", or "bidirectional"
- "bridgeboxValue": string (1-sentence describing exactly how Bridgebox orchestrates data with this tool)
- "complexity": strictly "low", "medium", or "high"
      `;

      const response = await provider.complete({
        messages: [
          {
            role: "system",
            content:
              "You are an Integration Architect mapping user tech stacks into Bridgebox topologies natively. Output strictly raw JSON array objects.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        maxTokens: 1000,
        ...({ responseFormat: "json_object" } as any),
      });

      if (!response.content) throw new Error("AI returned empty context.");
      const parsed = JSON.parse(response.content.trim());
      setMappedStack(parsed.stack || []);
    } catch (e: any) {
      console.error(e);
      setError(`Extraction Failed: ${e.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Network className="w-8 h-8 text-indigo-400" />
          AI Stack Discovery
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Paste the list of software your business currently uses. Bridgebox AI
          will autonomously map your data architecture and generate the exact
          integration points required to bridge the gaps.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card glass className="p-6 border-indigo-500/20 shadow-indigo-500/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Raw Tech Stack
            </h3>
            <textarea
              className="w-full h-40 bg-slate-900 border border-slate-700 text-white rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Clio, QuickBooks Online, Slack, Gmail, Calendly, Excel..."
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
            />
            <button
              onClick={handleDiscover}
              disabled={isDiscovering || !toolInput.trim()}
              className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mapping Architecture...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Architecture
                </>
              )}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
                {error}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {mappedStack.length === 0 && !isDiscovering && (
            <Card
              glass
              className="p-16 flex flex-col items-center justify-center text-center border-dashed border-slate-700"
            >
              <Box className="w-16 h-16 text-slate-800 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">
                Awaiting Stack Input
              </h3>
              <p className="text-slate-500 max-w-md">
                Enter your existing software suite on the left, and the
                Artificial Intelligence will visually map out how Bridgebox
                replaces your manual gaps.
              </p>
            </Card>
          )}

          {isDiscovering && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-indigo-400 animate-pulse font-medium">
                Scanning Integration Endpoints...
              </p>
            </div>
          )}

          {!isDiscovering && mappedStack.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">
                  Proposed Orchestration Map
                </h3>
                <span className="text-sm font-medium px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  {mappedStack.length} Integrations Active
                </span>
              </div>

              <div className="space-y-4">
                {mappedStack.map((tool, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                  >
                    <Card
                      glass
                      className="p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-colors border-slate-700/50"
                    >
                      <div
                        className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          tool.complexity === "high"
                            ? "bg-rose-500/20 text-rose-400"
                            : tool.complexity === "medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <Link2 className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-bold text-lg leading-none">
                            {tool.name}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded">
                            {tool.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-3 mb-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 ${
                              tool.integrationDataFlow === "bidirectional"
                                ? "text-indigo-400"
                                : tool.integrationDataFlow === "inbound"
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                            }`}
                          >
                            {tool.integrationDataFlow.toUpperCase()} FLOW
                          </span>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-300 border border-slate-800">
                          <span className="font-semibold text-white mb-1 block">
                            Bridgebox Orchestration Value:
                          </span>
                          {tool.bridgeboxValue}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: mappedStack.length * 0.1 }}
                  className="flex justify-end mt-8"
                >
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                    <CheckCircle className="w-5 h-5" />
                    Deploy Architecture
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
