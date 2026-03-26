// @ts-nocheck
import { motion } from 'framer-motion';
import { Code2, Cpu, BarChart3, Smartphone, Network, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function Services() {
  const services = [
    {
      icon: Code2,
      title: 'Custom Software Development',
      description: 'Enterprise applications built around your exact workflows. No compromises, no generic templates.',
      features: ['Bespoke architecture', 'Legacy system integration', 'Scalable infrastructure', 'Full ownership'],
      link: '/custom-software',
      gradient: 'from-indigo-500 to-[#1D4ED8]',
    },
    {
      icon: Cpu,
      title: 'AI Workflow Automation',
      description: 'Intelligent systems that learn your processes and automate complex operations end-to-end.',
      features: ['Smart process mining', 'Autonomous execution', 'Predictive optimization', 'Real-time adaptation'],
      link: '/solutions',
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
    },
    {
      icon: BarChart3,
      title: 'Dashboard & Analytics Systems',
      description: 'Command centers that provide real-time visibility into every aspect of your operations.',
      features: ['Custom data pipelines', 'Live visualization', 'Predictive analytics', 'Executive reporting'],
      link: '/dashboards',
      gradient: 'from-[#10B981] to-[#059669]',
    },
    {
      icon: Smartphone,
      title: 'Mobile Application Development',
      description: 'Native iOS and Android apps that extend your operational systems to field teams.',
      features: ['Native performance', 'Offline capability', 'Real-time sync', 'Enterprise security'],
      link: '/mobile-apps',
      gradient: 'from-[#F59E0B] to-[#D97706]',
    },
  ];

  const approach = [
    {
      title: 'Discovery & Strategy',
      description: 'Deep analysis of your operations, systems, and objectives to define the optimal solution architecture.',
    },
    {
      title: 'Custom Design',
      description: 'Bespoke system design tailored to your workflows, not forcing you into templates or frameworks.',
    },
    {
      title: 'Agile Development',
      description: 'Iterative building with continuous feedback, ensuring the solution evolves with your needs.',
    },
    {
      title: 'Integration & Deployment',
      description: 'Seamless connection to existing systems with zero-downtime deployment and comprehensive training.',
    },
  ];

  const whyCustom = [
    'Built for your exact workflows and requirements',
    'Full ownership of code and intellectual property',
    'Choose platform subscriptions or custom builds',
    'Scales with your business without limitations',
    'Direct integration with your existing systems',
    'Ongoing support and retainer packages available',
  ];

  return (
    <div className="pt-20">
      <Section background="gradient" className="pt-32 pb-16 relative">
        <GridPattern />
        <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <span className="text-indigo-500 font-medium text-sm">Enterprise Solutions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Complete Software Engineering Services
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            From custom enterprise applications to operational dashboards and mobile apps—we design, build, and deploy complete software systems engineered around your exact workflows and business requirements.
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={staggerItem}
              custom={index}
            >
              <Link to={service.link}>
                <Card className="h-full group cursor-pointer hover:border-indigo-500/50">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 relative`}
                  >
                    <service.icon className="w-7 h-7 text-white" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`} />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-500 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2 text-indigo-500 font-medium group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="dark">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Our Approach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            A proven methodology for delivering custom solutions that exceed expectations
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        >
          {approach.map((step, index) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              custom={index}
              className="relative"
            >
              <div className="text-6xl font-bold bg-gradient-to-r from-indigo-500 to-[#10B981] bg-clip-text text-transparent mb-4">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>

              {index < approach.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-transparent origin-left"
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="darker">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Custom Solutions?
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Off-the-shelf software forces you to adapt your business to its limitations. We build systems that adapt to you.
              </p>
              <ul className="space-y-4">
                {whyCustom.map((benefit) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-indigo-500" />
                  <h3 className="text-2xl font-bold text-white">Ready to Build?</h3>
                </div>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Schedule a consultation to discuss your project requirements and get a custom proposal.
                </p>
                <Link to="/contact">
                  <Button variant="primary" size="lg" fullWidth>
                    Start Your Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">50+</div>
                      <div className="text-xs text-slate-500">Projects Delivered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">98%</div>
                      <div className="text-xs text-slate-500">Client Satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">24/7</div>
                      <div className="text-xs text-slate-500">Support Available</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>

      <FinalCTA
        headline="Ready to Build Your Solution?"
        subtext="From custom software to enterprise dashboards and mobile apps—we engineer complete systems that solve your operational challenges."
      />
    </div>
  );
}
