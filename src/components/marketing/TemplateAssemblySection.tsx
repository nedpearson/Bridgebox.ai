import { motion } from "framer-motion";
import { Layers, Database, Smartphone, Bot, Zap } from "lucide-react";
import Section from "../Section";

export default function TemplateAssemblySection() {
  const stackLayers = [
    {
      id: "industry",
      icon: Layers,
      label: "Industry Baseline",
      color: "text-indigo-400",
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      desc: "Pre-mapped JSON operational schemas.",
    },
    {
      id: "db",
      icon: Database,
      label: "Postgres Tenant",
      color: "text-sky-400",
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      desc: "Cryptographically isolated data models.",
    },
    {
      id: "mobile",
      icon: Smartphone,
      label: "Dual-PWA Injection",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      desc: "React boundaries generated for Client/Staff ops.",
    },
    {
      id: "ai",
      icon: Bot,
      label: "Copilot Synapse",
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      desc: "LLM agents mapped deterministically.",
    },
    {
      id: "api",
      icon: Zap,
      label: "Webhook Listeners",
      color: "text-rose-400",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      desc: "Secure Stripe, Slack, and native hooks.",
    },
  ];

  return (
    <Section background="dark" className="py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
        {/* Left Side: Explainer */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            How Templates Actually Work.
          </h2>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Bridgebox does not clone static code. Our generation engine
            physically stacks precise deterministic components in milliseconds,
            computing a unique environment strictly bound to your Tenant ID.
          </p>

          <div className="space-y-4">
            {stackLayers.map((layer, index) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${layer.border} ${layer.bg}`}
                >
                  <layer.icon className={`w-5 h-5 ${layer.color}`} />
                </div>
                <div>
                  <h4 className="text-white font-bold">{layer.label}</h4>
                  <p className="text-sm text-slate-400">{layer.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Stacking Visualization */}
        <div className="relative h-[600px] flex justify-center items-center perspective-[2000px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 blur-[80px] -z-10 align-middle pointer-events-none"></div>

          <div className="relative w-[340px] h-[400px] transform rotate-x-[35deg] rotate-y-[-20deg] rotate-z-[5deg]">
            {stackLayers.map((layer, index) => (
              <motion.div
                key={layer.id}
                initial={{ y: -500, opacity: 0 }}
                whileInView={{ y: index * 55, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.5 + (stackLayers.length - index) * 0.2,
                }}
                className={`absolute w-full h-[180px] rounded-3xl border-2 ${layer.bg} ${layer.border} backdrop-blur-md flex items-center justify-between px-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
                style={{ zIndex: stackLayers.length - index }}
              >
                <span className={`text-2xl font-black ${layer.color}`}>
                  {layer.label}
                </span>
                <layer.icon className={`w-12 h-12 ${layer.color} opacity-50`} />
              </motion.div>
            ))}

            {/* Connection Beam */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute left-[30px] top-[90px] w-2 h-[350px] bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)] rounded-full z-[100]"
            ></motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
