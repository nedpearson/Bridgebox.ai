import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { faqItems } from '../data/faq';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

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
            <span className="px-4 py-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full text-[#3B82F6] text-sm font-medium backdrop-blur-sm">
              Support
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Frequently Asked Questions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed"
          >
            Find answers to common questions about Bridgebox capabilities, services, and how we work with clients.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    openId === item.id ? 'border-[#3B82F6]/50' : 'hover:border-[#3B82F6]/30'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
                        <AnimatePresence>
                          {openId === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="text-slate-300 leading-relaxed pt-2">{item.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openId === item.id ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-6 h-6 text-slate-400" />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section background="darker">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-[#3B82F6]/10 to-[#10B981]/10 border-[#3B82F6]/20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#3B82F6]/10 mb-6">
                <MessageCircle className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Our team is ready to answer any questions about how Bridgebox can solve your specific operational challenges. Schedule a call to discuss your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" to="/contact">
                  Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" to="/platform">
                  Explore Platform
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>

      <Section background="dark">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card glass className="text-center h-full">
              <h3 className="text-xl font-bold text-white mb-3">Technical Questions</h3>
              <p className="text-slate-400 mb-4">
                Learn about integrations, technical capabilities, and implementation details
              </p>
              <Button variant="outline" size="sm" to="/platform">
                View Platform
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card glass className="text-center h-full">
              <h3 className="text-xl font-bold text-white mb-3">Service Questions</h3>
              <p className="text-slate-400 mb-4">
                Discover our custom software, dashboard, and mobile app development services
              </p>
              <Button variant="outline" size="sm" to="/services">
                View Services
              </Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card glass className="text-center h-full">
              <h3 className="text-xl font-bold text-white mb-3">Success Stories</h3>
              <p className="text-slate-400 mb-4">
                See how we've solved similar challenges for clients across industries
              </p>
              <Button variant="outline" size="sm" to="/case-studies">
                View Case Studies
              </Button>
            </Card>
          </motion.div>
        </div>
      </Section>

      <FinalCTA
        headline="Still Have Questions?"
        subtext="Get direct answers from our team about custom software, dashboards, mobile apps, and how we can solve your specific operational challenges."
        primaryCTA="Contact Sales"
      />
    </div>
  );
}
