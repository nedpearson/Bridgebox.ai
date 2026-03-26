import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Truck, Briefcase, Scale, Users, ArrowRight } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function Solutions() {
  const solutions = [
    {
      icon: Users,
      title: 'Small Business',
      problem: 'Disconnected tools and inefficiencies',
      solution: 'Unified workflow automation',
      outcome: 'Faster operations with less overhead',
      color: '#3B82F6',
    },
    {
      icon: Building2,
      title: 'Enterprise',
      problem: 'Complex systems and fragmented data',
      solution: 'AI integration layer across infrastructure',
      outcome: 'Scalable efficiency and control',
      color: '#10B981',
    },
    {
      icon: Truck,
      title: 'Logistics',
      problem: 'Fragmented tracking and operations',
      solution: 'Real-time unified data system',
      outcome: 'Complete operational visibility',
      color: '#F59E0B',
    },
    {
      icon: Briefcase,
      title: 'Finance',
      problem: 'Manual processes and risk exposure',
      solution: 'AI-driven automation and validation',
      outcome: 'Accuracy, compliance, and speed',
      color: '#8B5CF6',
    },
    {
      icon: Scale,
      title: 'Legal',
      problem: 'Document overload and inefficiency',
      solution: 'Intelligent organization and automation',
      outcome: 'Faster case and workflow management',
      color: '#EC4899',
    },
  ];

  return (
    <div className="pt-20">
      <Section background="gradient" className="pt-32 pb-16 relative">
        <GridPattern />
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full text-[#10B981] text-sm font-medium backdrop-blur-sm">
              Industry Solutions
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Solutions Built for Modern Businesses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed mb-4"
          >
            We engineer custom software, build operational dashboards, develop mobile applications, and integrate AI automation—tailored to how your industry actually operates.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            Every solution combines the Bridgebox platform with custom development, data engineering, and systems integration designed for your exact workflows.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full group relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${solution.color}10, transparent)`,
                  }}
                />

                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 relative"
                    style={{
                      backgroundColor: `${solution.color}20`,
                      borderColor: `${solution.color}40`,
                      borderWidth: '1px',
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <solution.icon className="w-8 h-8" style={{ color: solution.color }} />
                    <motion.div
                      className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: `${solution.color}40` }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-indigo-500 transition-colors duration-300">
                    {solution.title}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: solution.color }}>
                        Problem
                      </div>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                        {solution.problem}
                      </p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wider mb-2 text-[#10B981]">
                        Custom Implementation
                      </div>
                      <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                        {solution.solution}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm font-semibold uppercase tracking-wider mb-2 text-white">
                        Outcome
                      </div>
                      <p className="text-white leading-relaxed font-medium">
                        {solution.outcome}
                      </p>
                    </div>
                  </div>

                  <Link to={`/contact?solution=${encodeURIComponent(solution.title)}`}>
                    <motion.div
                      className="mt-6 flex items-center text-sm font-medium group-hover:text-indigo-500 transition-colors duration-300"
                      style={{ color: solution.color }}
                      whileHover={{ x: 5 }}
                    >
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </motion.div>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <FinalCTA
        headline="Find Your Solution"
        subtext="Every industry has unique challenges. Let us show you how Bridgebox can transform your operations with custom software engineered for your needs."
      />
    </div>
  );
}
