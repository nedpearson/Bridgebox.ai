// @ts-nocheck
import { motion } from 'framer-motion';
import {
  Code,
  BarChart3,
  Smartphone,
  Link2,
  Zap,
  Search,
  Layers,
  Wrench,
  Rocket,
  Headphones,
  CheckCircle2,
  ArrowRight,
  FileText,
  Calendar,
  Gauge,
  Users,
} from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import Heading from '../components/Heading';
import GridPattern from '../components/GridPattern';
import { useLeadModal } from '../hooks/useLeadModal';

export default function Start() {
  const { openModal } = useLeadModal();

  const capabilities = [
    {
      icon: Code,
      title: 'Custom Software',
      description: 'End-to-end platforms built for your specific operational workflows',
    },
    {
      icon: BarChart3,
      title: 'Dashboards',
      description: 'Real-time operational dashboards with unified data from all systems',
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Native iOS and Android apps for field teams and customers',
    },
    {
      icon: Link2,
      title: 'Integrations',
      description: 'Connect your existing tools into unified operational workflows',
    },
    {
      icon: Zap,
      title: 'Automation Systems',
      description: 'AI-powered automation for repetitive workflows and data processing',
    },
  ];

  const process = [
    {
      icon: Search,
      step: '1',
      title: 'Discovery',
      description:
        'We analyze your current systems, workflows, and operational challenges. Identify pain points, integration needs, and automation opportunities.',
    },
    {
      icon: Layers,
      step: '2',
      title: 'System Design',
      description:
        'Design the technical architecture, integrations, and user experience. Create a detailed roadmap with milestones, timelines, and deliverables.',
    },
    {
      icon: Wrench,
      step: '3',
      title: 'Build & Integration',
      description:
        'Develop custom software, build integrations, and implement automation. Regular check-ins and demos ensure alignment throughout development.',
    },
    {
      icon: Rocket,
      step: '4',
      title: 'Deployment',
      description:
        'Deploy to production with comprehensive testing, training, and documentation. Ensure your team is ready to leverage the new system.',
    },
    {
      icon: Headphones,
      step: '5',
      title: 'Ongoing Support',
      description:
        'Continuous monitoring, optimization, and enhancements. Your system evolves as your business grows with dedicated technical support.',
    },
  ];

  const expectations = [
    {
      icon: CheckCircle2,
      title: 'Tailored Solution',
      description:
        'No generic templates or off-the-shelf limitations. Every line of code engineered specifically for your operational needs.',
    },
    {
      icon: FileText,
      title: 'Clear Roadmap',
      description:
        'Detailed project plan with phases, milestones, and timelines. You know exactly what to expect and when.',
    },
    {
      icon: Gauge,
      title: 'Scalable System',
      description:
        'Architecture designed to grow with your business. Handle increasing data volume, users, and complexity without limitations.',
    },
    {
      icon: Users,
      title: 'Ongoing Support',
      description:
        'Dedicated technical support, continuous optimization, and feature enhancements as your needs evolve.',
    },
  ];

  const projectTypes = [
    {
      icon: BarChart3,
      title: 'Dashboard Builds',
      description: 'Real-time operational dashboards consolidating data from multiple systems',
      features: [
        'Unified data from all sources',
        'Role-based views',
        'Real-time updates',
        'Custom metrics & KPIs',
      ],
      timeline: '4-8 weeks',
      price: 'Starting at $25K',
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Native mobile applications for field teams and customer-facing operations',
      features: [
        'iOS & Android native',
        'Offline capability',
        'Real-time sync',
        'Backend integration',
      ],
      timeline: '8-16 weeks',
      price: 'Starting at $50K',
    },
    {
      icon: Code,
      title: 'Full Custom Systems',
      description: 'End-to-end platforms engineered for complex operational workflows',
      features: [
        'Complete architecture',
        'All integrations',
        'Custom workflows',
        'Scalable infrastructure',
      ],
      timeline: '3-6 months',
      price: 'Starting at $100K',
    },
    {
      icon: Link2,
      title: 'Integrations',
      description: 'Connect existing tools into unified workflows with automation',
      features: [
        'API connections',
        'Data synchronization',
        'Workflow automation',
        'Error handling',
      ],
      timeline: '2-6 weeks',
      price: 'Starting at $15K',
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
              Let's Build Together
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Start Your Project with{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-[#10B981] bg-clip-text text-transparent">
              Bridgebox
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed mb-8"
          >
            Custom software, dashboards, mobile apps, and integrations engineered specifically for
            your operational needs. Let's design a solution that transforms how your business
            operates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" onClick={openModal}>
              Request Your Custom Build <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </Section>

      <Section background="dark">
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            What We Build
          </Heading>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive solutions tailored to your operational challenges
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass className="h-full text-center hover:border-indigo-500/50 transition-all duration-300">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-[#10B981]/20 flex items-center justify-center mb-4">
                    <capability.icon className="w-7 h-7 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{capability.title}</h3>
                  <p className="text-sm text-slate-400">{capability.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            How It Works
          </Heading>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A proven process from discovery to deployment and beyond
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {process.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-[#10B981]" />
                <div className="flex items-start gap-6 pl-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-[#10B981]/20 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-indigo-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full">
                        Step {step.step}
                      </span>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="dark">
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            What You Can Expect
          </Heading>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Quality, transparency, and results throughout the engagement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {expectations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card glass className="h-full">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-16">
          <Heading level={2} className="mb-4">
            Project Types
          </Heading>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Choose the engagement model that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projectTypes.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-indigo-500/50 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-[#10B981]/20 flex items-center justify-center">
                      <project.icon className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-slate-300">{project.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    {project.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Timeline</div>
                        <div className="font-semibold text-white">{project.timeline}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">Investment</div>
                        <div className="font-semibold text-[#10B981]">{project.price}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={openModal}>
                      Get Started
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section background="dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-indigo-500/10 via-[#10B981]/10 to-indigo-500/10 border-indigo-500/30">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#10B981]/20 mb-6">
                <Calendar className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Share your operational challenges and goals. We'll design a custom solution that
                transforms how your business operates. Most projects move from initial conversation
                to kickoff within 2-3 weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={openModal}>
                  Request Your Custom Build <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" to="/case-studies">
                  View Success Stories
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>
    </div>
  );
}
