import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  ArrowRight,
  BrainCircuit,
  Activity,
} from "lucide-react";
import Section from "../Section";

export default function AICapabilitiesSection() {
  return (
    <Section
      background="darker"
      className="py-24 border-t border-white/5 relative"
    >
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
          Real AI. No Generic Chatbots.
        </h2>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Bridgebox embeds structural Copilot nodes directly into your
          workflows. They extract, route, and transform operational data
          automatically.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
        {/* Before/After Visualization */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-8 flex flex-col gap-6 relative shadow-2xl">
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none rounded-3xl"></div>

          {/* The 'Before' Document */}
          <div className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 items-start">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex flex-shrink-0 items-center justify-center border border-orange-500/30">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Untructured Input
              </div>
              <div className="font-mono text-sm text-slate-300 leading-relaxed blur-[1px]">
                "Hey, the shipment to main street arrived yesterday at 4pm. The
                pallet was damaged on the bottom left corner but the client
                signed anyway."
              </div>
            </div>
          </div>

          {/* The Extraction Engine */}
          <div className="flex flex-col items-center justify-center -my-2 relative z-10">
            <div className="w-[2px] h-6 bg-indigo-500/50"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border border-indigo-500/50 flex items-center justify-center bg-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            >
              <Bot className="w-6 h-6 text-indigo-400" />
            </motion.div>
            <div className="w-[2px] h-6 bg-emerald-500/50"></div>
          </div>

          {/* The 'After' JSON Result */}
          <div className="flex gap-4 p-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 items-start shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex flex-shrink-0 items-center justify-center border border-emerald-500/30">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="w-full">
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">
                Mapped Output Payload
              </div>
              <div className="font-mono text-sm text-emerald-300/80 bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/20">
                <span className="text-pink-400">"status"</span>:{" "}
                <span className="text-yellow-300">"Delivered"</span>,<br />
                <span className="text-pink-400">"timestamp"</span>:{" "}
                <span className="text-yellow-300">"2026-03-25T16:00:00Z"</span>,
                <br />
                <span className="text-pink-400">"condition_flag"</span>:{" "}
                <span className="text-yellow-300">"Damaged (Bottom Left)"</span>
                ,<br />
                <span className="text-pink-400">"signature_status"</span>:{" "}
                <span className="text-yellow-300">"Signed"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Info */}
        <div className="space-y-8 lg:pl-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded bg-indigo-500/20 flex flex-shrink-0 items-center justify-center border border-indigo-500/30">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Automated Ingestion
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Turn messy emails, PDFs, and field notes into strict, structured
                data. The AI Copilot guarantees perfectly mapped payloads
                entered into your CRM instantly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded bg-emerald-500/20 flex flex-shrink-0 items-center justify-center border border-emerald-500/30">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Workflow Triggers
              </h3>
              <p className="text-slate-400 leading-relaxed">
                If the AI detects negative anomalies (like shipment damage), it
                bypasses standard approval and triggers high-alert webhooks
                explicitly to operations leads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
