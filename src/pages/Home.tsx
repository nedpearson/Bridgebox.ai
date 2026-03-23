import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, TrendingUp, Layers, CheckCircle2, Users, Building2, Truck, Briefcase, Scale } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import DashboardMockup from '../components/DashboardMockup';
import ProductDashboard from '../components/ProductDashboard';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { fadeUp, staggerContainer, staggerItem, textReveal } from '../utils/animations';
import { useLeadModal } from '../hooks/useLeadModal';

export default function Home() {
  const { openModal } = useLeadModal();

  const features = [
    {
      icon: Zap,
      title: 'Custom Software Development',
      description: 'Enterprise applications built around your exact workflows. No templates, no compromises—just software that works the way you do.',
    },
    {
      icon: Layers,
      title: 'Dashboards & Analytics Systems',
      description: 'Operational command centers with real-time data pipelines, executive reporting, and predictive insights across your entire business.',
    },
    {
      icon: TrendingUp,
      title: 'Mobile Application Development',
      description: 'Native iOS and Android apps for field teams, operations tracking, and business workflows with offline capability and real-time sync.',
    },
    {
      icon: Shield,
      title: 'AI Integration & Automation',
      description: 'Connect fragmented systems into one intelligent layer. Automate complex workflows and gain complete operational visibility.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Systems',
      description: 'Integrate your existing tools and platforms in minutes. No coding required.',
    },
    {
      step: '02',
      title: 'Automate Processes',
      description: 'AI maps and optimizes your workflows automatically across all systems.',
    },
    {
      step: '03',
      title: 'Generate Intelligence',
      description: 'Real-time insights and predictive analytics drive smarter decisions.',
    },
  ];

  const industries = [
    { icon: Truck, name: 'Logistics', count: '200+ companies' },
    { icon: Briefcase, name: 'Finance', count: '300+ companies' },
    { icon: Scale, name: 'Legal', count: '150+ companies' },
    { icon: Building2, name: 'Operations', count: '500+ companies' },
  ];

  const testimonials = [
    {
      quote: 'Bridgebox gave us complete visibility across our operations. What used to take hours now happens automatically.',
      author: 'Sarah Chen',
      role: 'Operations Lead',
      company: 'Fortune 500',
    },
    {
      quote: 'The efficiency gains were immediate. Our team operates faster and with greater control than ever before.',
      author: 'Michael Rodriguez',
      role: 'CTO',
      company: 'Series B',
    },
    {
      quote: 'Implementation was seamless. Within days, we had full integration across our entire tech stack.',
      author: 'Emily Watson',
      role: 'VP Engineering',
      company: 'Series C',
    },
  ];

  const benefits = [
    'Faster operations with automated workflows',
    'Reduced costs through intelligent optimization',
    'Unified data across all business systems',
    'Scalable AI that grows with your needs',
    'Real-time visibility into all operations',
    'Predictive insights for strategic decisions',
  ];

  return (
    <div className="pt-20">
      <Section background="gradient" className="pb-16 pt-32 relative">
        <GridPattern />
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full text-[#3B82F6] text-sm font-medium backdrop-blur-sm">
                  The AI Integration Layer for Business
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Unify Your Systems. Automate Your Business. Scale with AI.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl text-slate-300 mb-4 leading-relaxed"
              >
                Enterprise-grade platform subscriptions meet bespoke custom development. We build custom software, operational dashboards, and mobile applications. We integrate fragmented systems, automate complex workflows, and deliver real-time intelligence—all engineered around how your business actually operates.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg text-[#3B82F6] mb-8 font-medium"
              >
                Custom Development • Enterprise Dashboards • Mobile Apps • AI Automation
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" onClick={openModal}>
                  Get a Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" to="/start">
                  Request Custom Build
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-6 text-sm text-slate-400 text-center lg:text-left"
              >
                No setup friction • Enterprise-ready • Scalable from day one
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 lg:gap-8"
              >
                {[
                  { value: '1,200+', label: 'Companies' },
                  { value: '99.9%', label: 'Uptime' },
                  { value: '$2.4B', label: 'Saved' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute -left-40 top-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DashboardMockup />
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
            Built for Modern, High-Performance Businesses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Enterprise-ready infrastructure designed for operational efficiency
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {[
            { title: 'Enterprise-ready architecture', icon: Shield },
            { title: 'Secure, scalable infrastructure', icon: TrendingUp },
            { title: 'Designed for operational efficiency', icon: Zap },
            { title: 'Built to integrate with existing systems', icon: Layers },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              variants={staggerItem}
              custom={index}
            >
              <Card glass className="h-full text-center group hover:border-[#3B82F6]/50 transition-colors duration-300">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#3B82F6]/10 mb-4"
                >
                  <item.icon className="w-6 h-6 text-[#3B82F6]" />
                </motion.div>
                <p className="text-slate-300 leading-relaxed group-hover:text-white transition-colors duration-300">{item.title}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Full-Stack Engineering Meets AI Strategy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            We combine custom software development, data engineering, mobile expertise, and AI automation to deliver complete operational systems
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            {
              icon: Layers,
              title: 'Custom Software',
              description: 'We design and build software tailored to your exact workflows',
            },
            {
              icon: TrendingUp,
              title: 'Dashboards & Analytics',
              description: 'Real-time dashboards with actionable insights and full visibility',
            },
            {
              icon: Zap,
              title: 'Mobile Applications',
              description: 'Custom mobile apps for operations, tracking, and field teams',
            },
            {
              icon: Shield,
              title: 'System Integration',
              description: 'We connect your tools into a single intelligent system',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="h-full group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-12 h-12 bg-gradient-to-br from-[#3B82F6]/20 to-[#10B981]/20 rounded-lg flex items-center justify-center mb-6 relative"
                >
                  <feature.icon className="w-6 h-6 text-[#3B82F6] group-hover:text-[#10B981] transition-colors duration-300" />
                  <div className="absolute inset-0 bg-[#3B82F6]/20 rounded-lg blur-xl group-hover:bg-[#10B981]/30 transition-all duration-300" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#3B82F6] transition-colors duration-300">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{feature.description}</p>
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
            Inside the Bridgebox System
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto mb-12"
          >
            See what enterprise-grade operational intelligence looks like in action
          </motion.p>
        </div>

        <ProductDashboard />
      </Section>

      <Section background="dark">
        <div className="text-center mb-16">
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
            Three simple steps to transform your operations
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {howItWorks.map((item, index) => (
            <motion.div
              key={item.step}
              variants={staggerItem}
              custom={index}
              whileHover={{ y: -8 }}
              className="relative group cursor-pointer"
            >
              {index < howItWorks.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                  className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#3B82F6] via-[#10B981] to-transparent origin-left"
                />
              )}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2, type: 'spring' }}
                className="text-6xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#10B981] bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                {item.step}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#3B82F6] transition-colors duration-300">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{item.description}</p>

              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-[#10B981]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                initial={false}
              />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="dark">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Bridgebox
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Transform your operations with intelligent automation that delivers measurable results.
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  variants={staggerItem}
                  custom={index}
                  whileHover={{ x: 4 }}
                  className="flex items-start space-x-3 group cursor-pointer"
                >
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-slate-300 group-hover:text-white transition-colors duration-300">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8">
              <Button size="lg" to="/platform">
                See How It Works
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/20 to-[#10B981]/20 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <Card glass className="relative overflow-hidden">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="border-b border-white/10 pb-6"
                >
                  <div className="text-sm text-slate-400 mb-4 font-medium">Before Bridgebox</div>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-3"
                  >
                    {['Multiple disconnected tools', 'Manual processes', 'Delayed insights', 'Operational inefficiencies'].map((item, index) => (
                      <motion.div
                        key={item}
                        variants={staggerItem}
                        custom={index}
                        className="flex items-start gap-3 text-slate-300"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2"
                        />
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-sm text-slate-400 mb-4 font-medium">After Bridgebox</div>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-3"
                  >
                    {['Fully unified system', 'Automated workflows', 'Real-time intelligence', 'Optimized performance'].map((item, index) => (
                      <motion.div
                        key={item}
                        variants={staggerItem}
                        custom={index}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3 text-slate-300 group cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:text-white transition-colors duration-300">{item}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Built for Forward-Thinking Teams
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Powering operational excellence across industries
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              variants={staggerItem}
              custom={index}
            >
              <Card hover glass className="text-center h-full group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="relative inline-block mb-4"
                >
                  <industry.icon className="w-12 h-12 text-[#3B82F6] mx-auto group-hover:text-[#10B981] transition-colors duration-300" />
                  <div className="absolute inset-0 bg-[#3B82F6]/20 blur-xl group-hover:bg-[#10B981]/30 transition-all duration-300 rounded-full" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#3B82F6] transition-colors duration-300">{industry.name}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">{industry.count}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={staggerItem}
              custom={index}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card glass className="h-full border-l-2 border-l-[#3B82F6]/30 hover:border-l-[#3B82F6] transition-colors duration-300">
                <div className="mb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex text-[#3B82F6] mb-4"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.svg
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + index * 0.1 + i * 0.05 }}
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </motion.svg>
                    ))}
                  </motion.div>
                  <p className="text-slate-300 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                  <div className="text-xs text-[#3B82F6] mt-1 font-medium">{testimonial.company}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <FinalCTA />
    </div>
  );
}
