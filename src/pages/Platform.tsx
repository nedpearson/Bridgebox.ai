import { motion } from 'framer-motion';
import { Brain, Zap, Database, TrendingUp, Cpu, Network, Lock, BarChart3 } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardMockup from '../components/DashboardMockup';
import ProductDashboard from '../components/ProductDashboard';
import SystemFlow from '../components/SystemFlow';
import AccordionItem from '../components/AccordionItem';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function Platform() {
  const platformFeatures = [
    {
      icon: Brain,
      title: 'AI Engine',
      description: 'Intelligent decision layer that learns workflows over time and automates operational logic',
      details: [
        'Natural language processing for document analysis',
        'Predictive modeling for workflow optimization',
        'Anomaly detection with automated alerting',
        'Self-learning algorithms that improve over time',
        'Context-aware decision trees',
        'Multi-model ensemble intelligence',
      ],
      color: '#3B82F6',
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      description: 'Eliminates manual processes, reduces human error, and increases speed and consistency',
      details: [
        'Drag-and-drop workflow builder',
        'Conditional logic and branching',
        'Real-time monitoring and debugging',
        'Version control with rollback capabilities',
        'Parallel processing for complex workflows',
        'Custom trigger configuration',
      ],
      color: '#10B981',
    },
    {
      icon: Database,
      title: 'Data Integration Layer',
      description: 'Connects APIs and systems, synchronizes data in real-time, and removes data silos',
      details: [
        '500+ pre-built integrations',
        'Custom API connector framework',
        'Real-time data synchronization',
        'Automatic schema mapping',
        'Data transformation pipelines',
        'Bi-directional sync capabilities',
      ],
      color: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Intelligence',
      description: 'Forecasting and insights that identify inefficiencies and optimize operations',
      details: [
        'Predictive bottleneck analysis',
        'Resource allocation forecasting',
        'Cost optimization recommendations',
        'Trend analysis and reporting',
        'Scenario modeling and simulation',
        'ROI impact predictions',
      ],
      color: '#8B5CF6',
    },
  ];

  const capabilities = [
    {
      icon: Cpu,
      title: 'High Performance',
      description: 'Process millions of operations per second with sub-millisecond latency.',
    },
    {
      icon: Network,
      title: 'Scalable Architecture',
      description: 'Elastic infrastructure that grows with your business needs.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'SOC 2, GDPR, HIPAA compliant with end-to-end encryption.',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Live dashboards and insights across all your operations.',
    },
  ];

  return (
    <div className="pt-20">
      <Section background="gradient" className="pt-32 pb-16 relative">
        <GridPattern />
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full text-[#3B82F6] text-sm font-medium backdrop-blur-sm">
              Enterprise-Grade Platform
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Bridgebox Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed mb-4"
          >
            The unified AI infrastructure layer that connects systems, automates workflows, and delivers real-time intelligence across your entire operation.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            Combine our platform with custom software builds, operational dashboards, mobile applications, and enterprise integrations—all engineered to your exact specifications.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <DashboardMockup />
        </motion.div>
      </Section>

      <Section background="dark">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Four intelligent layers working in harmony
          </motion.p>
        </div>

        <SystemFlow />
      </Section>

      <Section background="darker">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Inside the Bridgebox System
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto mb-12"
          >
            A real-time view into how the platform orchestrates your entire business
          </motion.p>
        </div>

        <ProductDashboard />
      </Section>

      <Section background="dark">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Platform Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Explore the comprehensive capabilities of each layer
          </motion.p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {platformFeatures.map((feature, index) => (
            <AccordionItem
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              details={feature.details}
              color={feature.color}
              delay={index * 0.1}
            />
          ))}
        </div>
      </Section>

      <Section background="dark">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Built for Enterprise Performance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Infrastructure designed for scale, security, and reliability
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full text-center group">
                <motion.div
                  className="w-14 h-14 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center mx-auto mb-6 relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <capability.icon className="w-7 h-7 text-[#3B82F6] group-hover:text-[#10B981] transition-colors duration-300" />
                  <motion.div
                    className="absolute inset-0 bg-[#3B82F6]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#3B82F6] transition-colors duration-300">
                  {capability.title}
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {capability.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <FinalCTA
        headline="Experience the Platform in Action"
        subtext="See how Bridgebox transforms your operations with intelligent automation, real-time insights, and unified system control."
      />
    </div>
  );
}
