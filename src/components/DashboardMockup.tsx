import { motion } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Zap,
  CheckCircle,
  Clock,
  ArrowUp,
} from "lucide-react";
import { subtleFloat } from "../utils/animations";
import AnimatedChart from "./AnimatedChart";
import AnimatedMetric from "./AnimatedMetric";
import PulseIndicator from "./PulseIndicator";

export default function DashboardMockup() {
  return (
    <motion.div className="relative" variants={subtleFloat} animate="animate">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl border border-white/10 shadow-2xl shadow-indigo-500/20 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-[#10B981]/5"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              System Overview
            </h3>
            <PulseIndicator color="#10B981" label="Live" delay={0.4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-[#10B981]/30 transition-colors duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Active Workflows</span>
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <TrendingUp className="w-4 h-4 text-[#10B981] group-hover:scale-110 transition-transform" />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-2xl font-bold text-white mb-1"
              >
                247
              </motion.div>
              <div className="flex items-center gap-1 text-xs text-[#10B981]">
                <ArrowUp className="w-3 h-3" />
                <span>12% vs last week</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-indigo-500/30 transition-colors duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Data Synced</span>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-2xl font-bold text-white mb-1"
              >
                1.2M
              </motion.div>
              <div className="flex items-center gap-1 text-xs text-indigo-500">
                <span>Real-time updates</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">
                Performance Trends
              </span>
              <span className="text-xs text-slate-400">Last 12h</span>
            </div>
            <AnimatedChart
              data={[30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 85]}
              height={80}
              color="#3B82F6"
              delay={0.7}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-indigo-500/10 to-[#10B981]/10 backdrop-blur-sm rounded-xl p-4 border border-indigo-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">
                  AI Insight
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  System detected 3 workflow optimization opportunities.
                  Estimated time savings: 4.2 hours/day.
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/5"
            >
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
              <div>
                <div className="text-xs text-slate-400">Connected</div>
                <div className="text-sm font-semibold text-white">12</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85 }}
              className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/5"
            >
              <Clock className="w-4 h-4 text-indigo-500" />
              <div>
                <div className="text-xs text-slate-400">Uptime</div>
                <div className="text-sm font-semibold text-white">99.9%</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/5"
            >
              <Activity className="w-4 h-4 text-[#10B981]" />
              <div>
                <div className="text-xs text-slate-400">Tasks</div>
                <div className="text-sm font-semibold text-white">1,847</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-[#10B981]/20 rounded-3xl blur-3xl -z-10"
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
