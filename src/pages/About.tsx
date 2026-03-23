import { motion } from 'framer-motion';
import { Target, Eye, Zap, TrendingUp, Network, Sparkles } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function About() {
  const principles = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Bridge gaps between systems using intelligent AI infrastructure',
      color: '#3B82F6',
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'A future where businesses operate as fully connected systems',
      color: '#10B981',
    },
  ];

  const timeline = [
    {
      year: '2021',
      title: 'Foundation',
      description: 'Bridgebox founded to solve enterprise integration challenges',
    },
    {
      year: '2022',
      title: 'AI Infrastructure',
      description: 'Launched intelligent automation platform for enterprise',
    },
    {
      year: '2023',
      title: 'Scale',
      description: 'Reached 500+ enterprise customers across 20+ industries',
    },
    {
      year: '2024',
      title: 'Global Leader',
      description: 'Expanded to 47 countries, processing 10B+ operations monthly',
    },
    {
      year: '2025+',
      title: 'The Future',
      description: 'Building the AI infrastructure that powers global business',
    },
  ];

  const futureVision = [
    {
      icon: Network,
      title: 'Universal Integration',
      description: 'Every system, tool, and platform connected seamlessly',
    },
    {
      icon: Zap,
      title: 'Zero-Touch Operations',
      description: 'Fully autonomous business processes that require no human intervention',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Intelligence',
      description: 'AI that anticipates needs and optimizes before problems arise',
    },
    {
      icon: Sparkles,
      title: 'Continuous Evolution',
      description: 'Systems that learn, adapt, and improve autonomously',
    },
  ];

  return (
    <div className="pt-20">
      <Section background="gradient" className="pt-32 pb-16 relative">
        <GridPattern />
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl lg:text-8xl font-bold text-white mb-8 leading-tight"
          >
            About Bridgebox
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl text-slate-300 leading-relaxed font-light"
          >
            Building the intelligent infrastructure that powers modern business
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-5xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Bridgebox Exists
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Modern businesses rely on too many disconnected tools
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8 text-lg text-slate-300 leading-relaxed"
          >
            <p className="text-2xl font-light text-white">
              The average enterprise uses over 110 software tools. Yet despite this abundance, businesses still struggle with manual work, disconnected data, and inefficient processes.
            </p>
            <p>
              The problem isn't a lack of technology. It's the gaps between systems. These disconnections create friction, introduce errors, and prevent businesses from reaching their full potential.
            </p>
            <p className="text-xl font-medium text-white">
              Bridgebox unifies them into a single intelligent system.
            </p>
            <p>
              We build AI infrastructure that bridges every gap, automates every workflow, and connects every data source. The result is a business that operates as one seamless, intelligent system.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full group">
                <div className="flex items-start space-x-6">
                  <motion.div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${principle.color}15`,
                      borderColor: `${principle.color}30`,
                      borderWidth: '1px',
                    }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <principle.icon className="w-10 h-10" style={{ color: principle.color }} />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#3B82F6] transition-colors">
                      {principle.title}
                    </h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Our Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            From vision to global infrastructure
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {timeline.map((milestone, index) => (
            <motion.div
              key={milestone.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12 pb-16 last:pb-0"
            >
              {index < timeline.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6] via-[#10B981] to-transparent" />
              )}
              <motion.div
                className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-full border-4 border-[#0B0F1A] shadow-lg shadow-[#3B82F6]/50"
                whileHover={{ scale: 1.2, rotate: 180 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-2">{milestone.title}</div>
                  <div className="text-lg text-slate-300">{milestone.description}</div>
                </div>
                <div className="text-2xl font-bold text-[#3B82F6] md:text-right">{milestone.year}</div>
              </div>
            </motion.div>
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
            The Future of AI Infrastructure
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            We're building toward a world where businesses operate as autonomous, intelligent systems
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {futureVision.map((vision, index) => (
            <motion.div
              key={vision.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full group">
                <motion.div
                  className="w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#3B82F6]/20"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <vision.icon className="w-8 h-8 text-[#3B82F6]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#3B82F6] transition-colors">
                  {vision.title}
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {vision.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <Card glass className="max-w-4xl mx-auto">
            <p className="text-2xl font-light text-white leading-relaxed">
              "The future belongs to businesses that can adapt, evolve, and operate at machine speed. We're building the infrastructure that makes that future possible."
            </p>
          </Card>
        </motion.div>
      </Section>

      <FinalCTA
        headline="Partner with Bridgebox"
        subtext="Build the intelligent infrastructure that powers tomorrow's business. Let's engineer custom software that transforms your operations and drives lasting competitive advantage."
      />
    </div>
  );
}
