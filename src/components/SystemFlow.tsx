import { motion } from "framer-motion";
import { Database, Cpu, Zap, TrendingUp, ArrowRight } from "lucide-react";

export default function SystemFlow() {
  const stages = [
    {
      icon: Database,
      title: "Data Sources",
      description: "Connect all systems",
      color: "#3B82F6",
    },
    {
      icon: Cpu,
      title: "AI Engine",
      description: "Intelligent processing",
      color: "#10B981",
    },
    {
      icon: Zap,
      title: "Automation",
      description: "Execute workflows",
      color: "#F59E0B",
    },
    {
      icon: TrendingUp,
      title: "Intelligence",
      description: "Predictive insights",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="relative py-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
        {stages.map((stage, index) => (
          <div
            key={stage.title}
            className="flex items-center flex-1 w-full lg:w-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex-1"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      borderColor: `${stage.color}40`,
                      borderWidth: "1px",
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <stage.icon
                      className="w-8 h-8"
                      style={{ color: stage.color }}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute -inset-2 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                    style={{ backgroundColor: `${stage.color}40` }}
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  {stage.title}
                </h3>
                <p className="text-sm text-slate-400 text-center">
                  {stage.description}
                </p>

                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${stage.color}10, transparent)`,
                  }}
                />
              </motion.div>
            </motion.div>

            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.15 }}
                className="hidden lg:flex items-center justify-center px-4"
              >
                <ArrowRight className="w-8 h-8 text-slate-600" />
                <motion.div
                  className="absolute w-8 h-8"
                  animate={{
                    x: [0, 10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-8 h-8 text-indigo-500" />
                </motion.div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-[#10B981]/5 to-[#8B5CF6]/5 blur-3xl -z-20"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
