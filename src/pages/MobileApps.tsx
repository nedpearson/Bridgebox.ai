import { motion } from 'framer-motion';
import { Smartphone, Zap, Cloud, Shield, CheckCircle2, ArrowRight, Wifi, Battery, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function MobileApps() {
  const features = [
    {
      icon: Zap,
      title: 'Native Performance',
      description: 'Built with native technologies for iOS and Android, ensuring smooth, fast experiences.',
    },
    {
      icon: Wifi,
      title: 'Offline Capability',
      description: 'Work without connectivity. Data syncs automatically when connection is restored.',
    },
    {
      icon: Cloud,
      title: 'Real-Time Sync',
      description: 'Instant synchronization with backend systems and other team members.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Biometric authentication, encrypted data storage, and secure API communication.',
    },
  ];

  const appTypes = [
    {
      title: 'Field Operations Apps',
      description: 'Equip field teams with tools to complete work, update status, and access information from anywhere.',
      useCases: ['Service ticket management', 'Equipment inspections', 'Time tracking', 'Photo documentation'],
    },
    {
      title: 'Inventory & Warehouse Apps',
      description: 'Real-time inventory tracking, barcode scanning, and warehouse operations management.',
      useCases: ['Stock counting', 'Receiving & shipping', 'Location tracking', 'Order picking'],
    },
    {
      title: 'Sales & CRM Apps',
      description: 'Give your sales team instant access to customer data, order history, and pipeline management.',
      useCases: ['Customer profiles', 'Order entry', 'Quote generation', 'Activity logging'],
    },
    {
      title: 'Operational Dashboards',
      description: 'Mobile command centers for monitoring business operations and making decisions on the go.',
      useCases: ['Real-time KPIs', 'Alert management', 'Team oversight', 'Approval workflows'],
    },
  ];

  const capabilities = [
    'iOS and Android native development',
    'Biometric authentication (Face ID, Touch ID)',
    'Offline data storage and queueing',
    'Camera integration and image processing',
    'GPS and location services',
    'Barcode and QR code scanning',
    'Push notifications and alerts',
    'Background sync and updates',
    'Device hardware integration',
    'Enterprise app distribution',
  ];

  const benefits = [
    {
      title: 'Empower Field Teams',
      description: 'Give your mobile workforce the same capabilities as office staff, regardless of location.',
    },
    {
      title: 'Eliminate Paper',
      description: 'Replace clipboards, forms, and manual data entry with digital workflows.',
    },
    {
      title: 'Real-Time Updates',
      description: 'See what is happening in the field instantly instead of waiting for end-of-day reports.',
    },
    {
      title: 'Increase Accuracy',
      description: 'Reduce errors with structured data entry, validation, and photo documentation.',
    },
  ];

  const process = [
    {
      step: 'Discovery',
      description: 'Analyze field workflows, user needs, and integration requirements',
    },
    {
      step: 'Design',
      description: 'Create intuitive interfaces optimized for mobile use and various conditions',
    },
    {
      step: 'Development',
      description: 'Build native apps with offline support and seamless backend integration',
    },
    {
      step: 'Testing',
      description: 'Rigorous testing across devices, network conditions, and real-world scenarios',
    },
    {
      step: 'Deployment',
      description: 'Enterprise distribution, team training, and ongoing support',
    },
  ];

  return (
    <div className="relative">
      <GridPattern />

      <Section background="darker" className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full mb-6"
          >
            <span className="text-[#F59E0B] font-medium text-sm">Mobile Solutions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Enterprise Mobile Applications
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Native iOS and Android apps that extend your operational systems to field teams, enabling real-time collaboration and decision-making from anywhere.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Build Your App
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
            Core Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Enterprise-grade mobile applications built for performance and reliability
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              custom={index}
            >
              <Card className="h-full text-center group hover:border-[#F59E0B]/50">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#F59E0B]/20 to-[#3B82F6]/20 rounded-xl flex items-center justify-center mx-auto mb-6"
                >
                  <feature.icon className="w-8 h-8 text-[#F59E0B]" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#F59E0B] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">Mobile Capabilities</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {capabilities.map((capability) => (
                <div key={capability} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{capability}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Application Types
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Custom mobile solutions designed for your operational needs
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {appTypes.map((type, index) => (
            <motion.div
              key={type.title}
              variants={staggerItem}
              custom={index}
            >
              <Card className="h-full group hover:border-[#F59E0B]/50">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#F59E0B] transition-colors">
                  {type.title}
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {type.description}
                </p>
                <div className="space-y-2">
                  {type.useCases.map((useCase) => (
                    <div key={useCase} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-sm text-slate-400">{useCase}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="dark">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Mobile Apps?
              </h2>
              <p className="text-xl text-slate-400 mb-6 leading-relaxed">
                Your field teams need the same real-time access to data and systems that office workers take for granted.
              </p>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Custom mobile apps eliminate delays, reduce errors, and give your entire team operational visibility regardless of location.
              </p>
              <Link to="/contact">
                <Button variant="primary" size="lg">
                  Discuss Your App
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    variants={staggerItem}
                    custom={index}
                  >
                    <Card className="h-full text-center group hover:border-[#F59E0B]/50">
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {benefit.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

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
              From concept to App Store, we handle every aspect
            </motion.p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto"
          >
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                variants={staggerItem}
                custom={index}
                className="relative"
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#3B82F6] rounded-xl flex items-center justify-center mx-auto mb-4"
                  >
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.step}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {index < process.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                    className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#F59E0B] to-transparent origin-left"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Build Your App
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </Section>

      <FinalCTA
        headline="Launch Your Mobile App"
        subtext="Native iOS and Android apps engineered for your operational workflows. Get mobile solutions that work seamlessly with your existing systems."
      />
    </div>
  );
}
