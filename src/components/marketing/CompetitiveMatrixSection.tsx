import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import Section from "../Section";

export default function CompetitiveMatrixSection() {
  const comparisonRows = [
    {
      feature: "Core Setup Speed",
      others: "Weeks of configuration",
      bb: "Instant OS Generation",
    },
    {
      feature: "Frontend Architecture",
      others: "Generic SaaS Grid",
      bb: "Industry-Specific UI",
    },
    {
      feature: "Mobile Field Tools",
      others: "Secondary afterthought",
      bb: "Native Staff + Client PWAs",
    },
    {
      feature: "AI Integration",
      others: "Bolted-on Chatbots",
      bb: "Core Extraction Webhooks",
    },
    {
      feature: "System Extensibility",
      others: "API Access only",
      bb: "Deterministic Workflows",
    },
    {
      feature: "Pricing Clarity",
      others: "Hidden Enterprise tiers",
      bb: "Calculated instantly",
    },
  ];

  return (
    <Section background="darker" className="py-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Built To Dominate.
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          We do not patch legacy SaaS. We generate absolute systematic
          advantages.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-12 gap-4 text-center mb-4 px-6">
          <div className="col-span-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">
            Capabilities
          </div>
          <div className="col-span-4 font-bold text-slate-500 uppercase tracking-widest text-xs">
            Legacy Alternatives
          </div>
          <div className="col-span-4 font-black text-indigo-400 uppercase tracking-widest text-xs">
            Bridgebox OS
          </div>
        </div>

        <div className="space-y-4">
          {comparisonRows.map((row, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-12 gap-4 items-center bg-slate-900 rounded-2xl p-6 border border-white/5 shadow-lg"
            >
              <div className="col-span-4 text-white font-bold">
                {row.feature}
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center text-slate-400">
                <X className="w-5 h-5 text-rose-500/50 mb-2" />
                <span className="text-sm">{row.others}</span>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-xl -m-2 border border-indigo-500/20"></div>
                <Check className="w-5 h-5 text-indigo-400 mb-2 mt-1 relative z-10" />
                <span className="text-sm font-bold text-white relative z-10">
                  {row.bb}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
