import { motion } from 'framer-motion';
import { Code2, Zap, Database, Shield, CheckCircle2, ArrowRight, Layers, Cpu, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function CustomSoftware() {
  const capabilities = [
    {
      icon: Layers,
      title: 'Enterprise Applications',
      description: 'Full-stack systems designed for complex operations, high transaction volumes, and multi-team workflows.',
    },
    {
      icon: Database,
      title: 'Legacy System Integration',
      description: 'Connect and modernize existing systems without disruption, creating unified data flows across your infrastructure.',
    },
    {
      icon: Network,
      title: 'API & Microservices',
      description: 'Scalable backend architectures that power your operations and enable seamless third-party integrations.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security, compliance frameworks, and audit trails built into every layer of the system.',
    },
  ];

  const features = [
    'Built around your exact workflows',
    'No generic templates or frameworks',
    'Full source code ownership',
    'Scalable cloud infrastructure',
    'Real-time data synchronization',
    'Advanced access controls',
    'Custom reporting & analytics',
    'Comprehensive API documentation',
    'Automated testing & deployment',
    'Ongoing support & maintenance',
  ];

  const useCases = [
    {
      title: 'Operational Management Systems',
      description: 'End-to-end platforms for coordinating teams, tracking processes, and managing resources in real-time.',
      examples: ['Warehouse management', 'Fleet operations', 'Field service management'],
    },
    {
      title: 'Business Intelligence Platforms',
      description: 'Custom analytics engines that transform raw data into actionable insights for decision-makers.',
      examples: ['Executive dashboards', 'Performance tracking', 'Predictive modeling'],
    },
    {
      title: 'Customer-Facing Portals',
      description: 'Secure self-service platforms that extend your operations directly to clients and partners.',
      examples: ['Order management', 'Support ticketing', 'Document sharing'],
    },
    {
      title: 'Internal Workflow Tools',
      description: 'Purpose-built applications that eliminate manual work and streamline internal processes.',
      examples: ['Approval workflows', 'Resource scheduling', 'Compliance tracking'],
    },
  ];

  const process = [
    'Requirements analysis & system design',
    'Prototype development & user testing',
    'Iterative development with weekly reviews',
    'Integration with existing systems',
    'Security audit & performance testing',
    'Deployment & team training',
    'Ongoing support & enhancements',
  ];

  return (
    <div className="relative">
      <GridPattern />

      <Section background="darker" className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <span className="text-indigo-500 font-medium text-sm">Custom Development</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Software Built For Your Business
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            No compromises. No workarounds. No forcing your operations into someone else's vision. We build enterprise software specifically for your workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Start Your Custom Build
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
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
            Core Capabilities
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            From concept to deployment, we handle every aspect of enterprise software development
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              variants={staggerItem}
              custom={index}
            >
              <Card className="h-full text-center group hover:border-indigo-500/50">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-[#10B981]/20 rounded-xl flex items-center justify-center mx-auto mb-6 relative"
                >
                  <capability.icon className="w-8 h-8 text-indigo-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-500 transition-colors">
                  {capability.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {capability.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="darker">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Custom Software?
              </h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Off-the-shelf solutions are built for the average business. Your operations aren't average.
              </p>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Custom software gives you competitive advantages that generic tools never can: perfect workflow alignment, unlimited scalability, and complete control over your technology stack.
              </p>
              <Link to="/contact">
                <Button variant="primary" size="lg">
                  Discuss Your Project
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-xl font-bold text-white mb-6">What You Get</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-1" />
                      <span className="text-sm text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Use Cases
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 max-w-3xl mx-auto"
            >
              Custom software solutions designed for complex operational requirements
            </motion.p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                variants={staggerItem}
                custom={index}
              >
                <Card className="h-full group hover:border-indigo-500/50">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-500 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-400 mb-4 leading-relaxed">
                    {useCase.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example) => (
                      <span
                        key={example}
                        className="px-3 py-1 bg-slate-800/50 border border-white/10 rounded-full text-xs text-slate-400"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Development Process
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 max-w-3xl mx-auto"
            >
              Transparent, collaborative, and focused on delivering value at every stage
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8">
              <ul className="space-y-4">
                {process.map((step, index) => (
                  <motion.li
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-300 text-lg pt-1">{step}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Start Your Custom Build
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      <FinalCTA
        headline="Ready to Build Custom Software?"
        subtext="Get enterprise-grade custom software that solves your unique operational challenges. Let's discuss your requirements and design a solution that scales with your business."
      />
    </div>
  );
}
