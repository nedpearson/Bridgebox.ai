// @ts-nocheck
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, CheckCircle2, AlertCircle, Clock, ArrowUpRight, Database, Cpu, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedMetric from './AnimatedMetric';
import AnimatedChart from './AnimatedChart';
import PulseIndicator from './PulseIndicator';

export default function ProductDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const kpis = [
    { label: 'Monthly Revenue', value: 847293, prefix: '$', trend: 12.5, period: 'vs last month' },
    { label: 'Efficiency Gain', value: 34.2, suffix: '%', trend: 8.3, period: 'this quarter' },
    { label: 'Tasks Automated', value: 12847, trend: 23.1, period: 'this month' },
    { label: 'System Uptime', value: 99.97, suffix: '%', trend: 0.02, period: 'last 30 days' },
  ];

  const workflows = [
    { name: 'Invoice Processing', status: 'active', processed: 1247, total: 1250, progress: 99.7 },
    { name: 'Customer Onboarding', status: 'active', processed: 342, total: 380, progress: 90 },
    { name: 'Inventory Sync', status: 'syncing', processed: 8234, total: 8500, progress: 96.8 },
    { name: 'Report Generation', status: 'active', processed: 89, total: 90, progress: 98.8 },
  ];

  const dataStreams = [
    { source: 'Salesforce', status: 'active', lastSync: '2s ago', records: 12847 },
    { source: 'Stripe', status: 'active', lastSync: '5s ago', records: 8234 },
    { source: 'PostgreSQL', status: 'active', lastSync: '1s ago', records: 24891 },
    { source: 'Shopify', status: 'syncing', lastSync: '12s ago', records: 5821 },
  ];

  const insights = [
    { type: 'optimization', title: 'Workflow efficiency can be improved', description: 'Invoice processing can be 15% faster with parallel execution', impact: 'high' },
    { type: 'alert', title: 'Data sync delay detected', description: 'Shopify connection experiencing minor latency', impact: 'medium' },
    { type: 'success', title: 'Peak performance achieved', description: 'System running at optimal capacity', impact: 'positive' },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'syncing': return '#F59E0B';
      case 'warning': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'positive': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Operations Command Center</h3>
            <p className="text-slate-400 text-sm">Real-time system overview</p>
          </div>
          <div className="flex items-center gap-2">
            <PulseIndicator size="sm" />
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                {kpi.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                {kpi.prefix && <span className="text-2xl font-bold text-white">{kpi.prefix}</span>}
                <AnimatedMetric value={kpi.value} className="text-3xl font-bold text-white" />
                {kpi.suffix && <span className="text-2xl font-bold text-white">{kpi.suffix}</span>}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={kpi.trend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
                </span>
                <span className="text-slate-500">{kpi.period}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Workflow Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Active Workflows
              </h4>
              <span className="text-xs text-slate-400">{workflows.length} running</span>
            </div>
            <div className="space-y-4">
              {workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColor(workflow.status) }}
                      />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {workflow.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {workflow.processed.toLocaleString()} / {workflow.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-5">
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${workflow.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: statusColor(workflow.status) }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Data Streams */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#10B981]" />
                Data Streams
              </h4>
              <span className="text-xs text-slate-400">{dataStreams.length} connected</span>
            </div>
            <div className="space-y-4">
              {dataStreams.map((stream, index) => (
                <motion.div
                  key={stream.source}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: -4 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: statusColor(stream.status) }}
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        {stream.source}
                      </div>
                      <div className="text-xs text-slate-500">{stream.lastSync}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-400">
                      {stream.records.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">records</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#8B5CF6]" />
              AI Intelligence
            </h4>
            <span className="text-xs text-slate-400">{insights.length} insights</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-4 rounded-lg bg-slate-900/30 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${impactColor(insight.impact)}20` }}
                  >
                    {insight.type === 'optimization' && <ArrowUpRight className="w-4 h-4" style={{ color: impactColor(insight.impact) }} />}
                    {insight.type === 'alert' && <AlertCircle className="w-4 h-4" style={{ color: impactColor(insight.impact) }} />}
                    {insight.type === 'success' && <CheckCircle2 className="w-4 h-4" style={{ color: impactColor(insight.impact) }} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-500 transition-colors">
                      {insight.title}
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      {insight.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Health Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10B981]" />
              <span className="text-sm text-slate-400">System Health: Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-slate-400">4 integrations active</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Last updated: just now</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-sm font-medium text-indigo-500 transition-all"
          >
            View Full Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
