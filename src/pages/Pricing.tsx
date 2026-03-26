import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Code, BarChart3, Smartphone, Network } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useLeadModal } from '../hooks/useLeadModal';
import { PLANS, formatPlanPrice } from '../lib/plans';

export default function Pricing() {
  const { openModal } = useLeadModal();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');


  const customSolutions = [
    {
      icon: Code,
      title: 'Custom Software Builds',
      description: 'Tailored applications designed specifically for your business processes and requirements.',
      priceRange: '$25k - $500k+',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Systems',
      description: 'Real-time analytics dashboards that consolidate your data and provide actionable insights.',
      priceRange: '$15k - $150k+',
    },
    {
      icon: Smartphone,
      title: 'Mobile Applications',
      description: 'Native iOS and Android apps that extend your business operations to mobile devices.',
      priceRange: '$50k - $300k+',
    },
    {
      icon: Network,
      title: 'Enterprise Integrations',
      description: 'Complex system integrations connecting your entire technology stack seamlessly.',
      priceRange: '$30k - $250k+',
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
            Premium Solutions for Serious Business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl text-slate-300 leading-relaxed font-light"
          >
            Enterprise-grade platform subscriptions and bespoke custom development.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-7xl mx-auto space-y-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold text-white mb-4">Platform Pricing</h2>
              <p className="text-xl text-slate-400 mb-8">
                Subscription-based access to our automation platform
              </p>
              <div className="inline-flex items-center bg-slate-800/50 border border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-6 py-2 rounded-md transition-all ${
                    billingInterval === 'yearly'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {PLANS.map((plan, index) => {
                const PlanIcon = plan.tier === 'starter' ? Code : plan.tier === 'growth' ? BarChart3 : Smartphone;
                const price = formatPlanPrice(plan, billingInterval);

                return (
                  <motion.div
                    key={plan.id}
                    variants={staggerItem}
                    custom={index}
                  >
                    <Card
                      hover
                      glass
                      className={`h-full relative ${
                        plan.highlighted
                          ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                          : ''
                      }`}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-[#10B981] text-white text-sm font-semibold px-4 py-1 rounded-full">
                          Most Popular
                        </div>
                      )}
                      <div className="mb-6">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20"
                        >
                          <PlanIcon className="w-6 h-6 text-indigo-500" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-slate-400">{plan.description}</p>
                      </div>

                      <div className="mb-8">
                        <div className="text-4xl font-bold text-white mb-2">
                          {price}
                          {price !== 'Custom' && (
                            <span className="text-lg text-slate-400 font-normal">
                              /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {price === 'Custom' ? 'Tailored to your needs' : 'Annual contract'}
                        </p>
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.filter(f => f.included).map((feature) => (
                          <li key={feature.name} className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">{feature.name}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        size="lg"
                        variant={plan.highlighted ? 'primary' : 'outline'}
                        onClick={plan.tier === 'enterprise' ? openModal : () => openModal()}
                        className="w-full"
                      >
                        {plan.ctaLabel}
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <div className="border-t border-white/10 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-5xl font-bold text-white mb-4">Custom Development Pricing</h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-6">
                Every system is built to your exact needs. Pricing is based on scope, complexity, and integrations.
              </p>
              <div className="inline-flex flex-wrap items-center justify-center gap-4 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-indigo-500" />
                  <span>Custom Software</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-[#10B981]" />
                  <span>Dashboards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-[#F59E0B]" />
                  <span>Mobile Apps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-[#8B5CF6]" />
                  <span>Integrations</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6"
            >
              {customSolutions.map((solution, index) => (
                <motion.div
                  key={solution.title}
                  variants={staggerItem}
                  custom={index}
                >
                  <Card hover glass className="h-full">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-[#10B981]/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                        <solution.icon className="w-8 h-8 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                        <p className="text-slate-400 mb-4 leading-relaxed">{solution.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-slate-500 mb-1">Typical Range</div>
                            <div className="text-xl font-bold text-white">{solution.priceRange}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Card glass className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Need a Custom Quote?
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Our team will analyze your requirements and provide a detailed proposal with transparent pricing, timelines, and deliverables.
                </p>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={openModal}
                >
                  Request Custom Quote <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>

      <Section background="darker">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center"
          >
            Plan Comparison
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-slate-400 mb-12 text-center"
          >
            Compare features across all subscription tiers
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 text-white font-semibold">Feature</th>
                  {PLANS.filter(p => p.tier !== 'custom').map(plan => (
                    <th key={plan.id} className="text-center py-4 px-6">
                      <div className="text-white font-bold">{plan.name}</div>
                      <div className="text-indigo-500 text-sm mt-1">{formatPlanPrice(plan, 'monthly')}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Integrations', values: ['Up to 5', 'Unlimited', 'Unlimited'] },
                  { name: 'Team Members', values: ['Up to 10', 'Unlimited', 'Unlimited'] },
                  { name: 'Automation Workflows', values: ['Core', 'Advanced', 'Full Access'] },
                  { name: 'Support', values: ['Email', 'Priority', 'Dedicated Team'] },
                  { name: 'Security & Compliance', values: ['Standard', 'Advanced', 'Enterprise'] },
                  { name: 'Analytics', values: ['Monthly', 'Real-time', 'Advanced Suite'] },
                  { name: 'API Access', values: ['Basic', 'Full', 'Full'] },
                  { name: 'Custom Workflows', values: ['—', 'Yes', 'Yes'] },
                  { name: 'AI Optimization', values: ['—', '—', 'Yes'] },
                  { name: 'SLA Guarantee', values: ['—', '—', 'Yes'] },
                ].map((row, index) => (
                  <tr key={row.name} className={`border-b border-slate-800/50 ${index % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                    <td className="py-4 px-6 text-slate-300">{row.name}</td>
                    {row.values.map((value, idx) => (
                      <td key={idx} className="py-4 px-6 text-center">
                        {value === 'Yes' ? (
                          <Check className="w-5 h-5 text-[#10B981] mx-auto" />
                        ) : value === '—' ? (
                          <span className="text-slate-600">—</span>
                        ) : (
                          <span className="text-white">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-slate-400 mb-6">All plans include:</p>
            <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                '99.9% Uptime',
                'End-to-End Encryption',
                'Regular Updates',
                'Training & Onboarding',
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-2 text-slate-300">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      <Section background="gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Talk to our team to find the perfect solution for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" to="/contact">
              Schedule a Call <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" to="/contact">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
