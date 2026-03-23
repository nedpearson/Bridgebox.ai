import { motion } from 'framer-motion';
import { Target, DollarSign, Database, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function UseCases() {
  const useCases = [
    {
      icon: Target,
      title: 'Operational Efficiency',
      description: 'Automate repetitive workflows',
      benefits: [
        'Reduce manual workload',
        'Improve speed',
      ],
      outcome: 'Teams save 25+ hours per week and process 3x more work',
      color: '#3B82F6',
      gradient: 'from-blue-500/20 to-blue-600/20',
    },
    {
      icon: DollarSign,
      title: 'Cost Reduction',
      description: 'Eliminate inefficiencies',
      benefits: [
        'Reduce labor dependency',
        'Optimize resources',
      ],
      outcome: 'Companies cut operational costs by 40-60% within 6 months',
      color: '#10B981',
      gradient: 'from-emerald-500/20 to-emerald-600/20',
    },
    {
      icon: Database,
      title: 'Data Unification',
      description: 'Merge multiple systems',
      benefits: [
        'Centralized visibility',
        'Real-time updates',
      ],
      outcome: 'Single source of truth with 99.9% data accuracy across platforms',
      color: '#F59E0B',
      gradient: 'from-amber-500/20 to-amber-600/20',
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Remove manual tasks',
      benefits: [
        'Standardize processes',
        'Improve reliability',
      ],
      outcome: '80% of repetitive tasks automated with zero-touch processing',
      color: '#8B5CF6',
      gradient: 'from-violet-500/20 to-violet-600/20',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Forecast trends',
      benefits: [
        'Identify issues early',
        'Enable smarter decisions',
      ],
      outcome: 'Predict problems 2-4 weeks in advance with 94% accuracy',
      color: '#EC4899',
      gradient: 'from-pink-500/20 to-pink-600/20',
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
              Real-World Impact
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Real-World Impact with Bridgebox
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed"
          >
            Discover how businesses transform operations, reduce costs, and drive measurable results with intelligent automation.
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
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full group relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                />

                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
                    style={{
                      backgroundColor: `${useCase.color}15`,
                      borderColor: `${useCase.color}30`,
                      borderWidth: '1px',
                    }}
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <useCase.icon className="w-10 h-10" style={{ color: useCase.color }} />
                    <motion.div
                      className="absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ backgroundColor: `${useCase.color}30` }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#3B82F6] transition-colors duration-300">
                    {useCase.title}
                  </h3>

                  <p className="text-lg text-slate-400 mb-6 group-hover:text-slate-300 transition-colors duration-300">
                    {useCase.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {useCase.benefits.map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: useCase.color }}
                        />
                        <span className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                          {benefit}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-[#10B981]">
                      Real Outcome
                    </div>
                    <p className="text-white leading-relaxed font-medium mb-4">
                      {useCase.outcome}
                    </p>
                  </div>

                  <motion.div
                    className="flex items-center text-sm font-medium group-hover:text-[#3B82F6] transition-colors duration-300"
                    style={{ color: useCase.color }}
                    whileHover={{ x: 5 }}
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="gradient" className="relative">
        <GridPattern />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join companies achieving measurable results with Bridgebox. Let's discuss your specific use case.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" to="/contact">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline" to="/platform">
              Explore Platform
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
