import { motion } from 'framer-motion';
import { Mail, MapPin, Zap, Shield, TrendingUp } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import GridPattern from '../components/GridPattern';
import LeadForm from '../components/LeadForm';

export default function Contact() {
  const benefits = [
    {
      icon: Zap,
      text: 'Connect your systems',
    },
    {
      icon: TrendingUp,
      text: 'Automate your workflows',
    },
    {
      icon: Shield,
      text: 'Scale intelligently with Bridgebox',
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@bridgebox.ai',
      link: 'mailto:hello@bridgebox.ai',
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'San Francisco, CA',
      link: null,
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
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl text-slate-300 leading-relaxed font-light"
          >
            Ready to transform your business operations? Let's talk.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card glass>
                <h2 className="text-3xl font-bold text-white mb-4">Book a Demo</h2>
                <p className="text-slate-400 mb-8">
                  Schedule a personalized demo to see how our solutions can transform your operations.
                </p>
                <LeadForm formType="demo" />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card glass>
                <h2 className="text-3xl font-bold text-white mb-4">Request Custom Build</h2>
                <p className="text-slate-400 mb-8">
                  Tell us about your project and receive a custom proposal tailored to your needs.
                </p>
                <LeadForm formType="custom_build" />
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card glass className="h-full">
                <h3 className="text-3xl font-bold text-white mb-8 leading-tight">
                  Connect your systems. Automate your workflows. Scale intelligently with Bridgebox.
                </h3>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#3B82F6]/20">
                        <benefit.icon className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                      <span className="text-lg text-slate-300">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card glass className="h-full">
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">{info.title}</div>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-white hover:text-[#3B82F6] transition-colors font-medium text-lg"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <div className="text-white font-medium text-lg">{info.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-slate-400 leading-relaxed">
                    Our team typically responds within 24 hours. For urgent inquiries, please email us directly.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>
    </div>
  );
}
