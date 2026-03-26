import { motion } from 'framer-motion';
import { Truck, DollarSign, Scale, Factory, Briefcase, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import GridPattern from '../components/GridPattern';
import FinalCTA from '../components/FinalCTA';
import { staggerContainer, staggerItem } from '../utils/animations';
import { industries } from '../data/industries';

const industryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  logistics: Truck,
  finance: DollarSign,
  legal: Scale,
  operations: Factory,
  services: Briefcase,
};

export default function Industries() {
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
            <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-500 text-sm font-medium backdrop-blur-sm">
              Industry Expertise
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Industries We Serve
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed"
          >
            Bridgebox adapts to complex industries where systems, data, and workflows must operate seamlessly. We engineer custom solutions that solve the unique challenges facing your industry.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {industries.map((industry, index) => {
            const Icon = industryIcons[industry.id] || Briefcase;
            return (
              <motion.div key={industry.id} variants={staggerItem} custom={index}>
                <Card className="h-full hover:border-[#10B981]/30 transition-all duration-300">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${industry.iconColor}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: industry.iconColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{industry.name}</h3>
                      <p className="text-slate-400">{industry.tagline}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-2">The Challenge</div>
                      <p className="text-slate-300 leading-relaxed">{industry.challenge}</p>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-2">Our Solution</div>
                      <p className="text-slate-300 leading-relaxed">{industry.solution}</p>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-500 mb-3">Key Benefits</div>
                      <div className="space-y-2">
                        {industry.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex gap-2">
                            <CheckCircle2
                              className="w-5 h-5 flex-shrink-0 mt-0.5"
                              style={{ color: industry.iconColor }}
                            />
                            <span className="text-sm text-slate-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {industry.caseStudySlugs && industry.caseStudySlugs.length > 0 && (
                      <Link
                        to={`/case-studies/${industry.caseStudySlugs[0]}`}
                        className="inline-flex items-center text-sm font-medium hover:gap-2 transition-all duration-300"
                        style={{ color: industry.iconColor }}
                      >
                        View Case Study
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Section>

      <Section background="darker">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card glass className="text-center h-full">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 mb-4">
                <Factory className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Industry Expertise</h3>
              <p className="text-slate-400 leading-relaxed">
                Deep understanding of industry-specific challenges, workflows, and regulatory requirements
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card glass className="text-center h-full">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#10B981]/10 mb-4">
                <TrendingUp className="w-7 h-7 text-[#10B981]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Proven Results</h3>
              <p className="text-slate-400 leading-relaxed">
                Track record of delivering measurable operational improvements and ROI across industries
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card glass className="text-center h-full">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#F59E0B]/10 mb-4">
                <Briefcase className="w-7 h-7 text-[#F59E0B]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Custom Solutions</h3>
              <p className="text-slate-400 leading-relaxed">
                Tailored engineering designed specifically for your industry's unique operational needs
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-indigo-500/10 to-[#10B981]/10 border-indigo-500/20">
            <div className="max-w-3xl mx-auto">
              <Badge variant="primary" className="mb-4">
                Cross-Industry Capabilities
              </Badge>
              <h2 className="text-3xl font-bold text-white mb-4">
                Common Capabilities Across All Industries
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Every solution leverages our core engineering expertise
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {[
                  'Custom software engineering',
                  'Real-time operational dashboards',
                  'Mobile applications (iOS/Android)',
                  'System integration and APIs',
                  'AI and automation workflows',
                  'Cloud infrastructure and security',
                  'Data analytics and reporting',
                  'Ongoing support and evolution',
                ].map((capability, idx) => (
                  <div key={idx} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>

      <FinalCTA
        headline="Build for Your Industry"
        subtext="Ready to transform your operations with custom software engineered specifically for your industry? Let's discuss how Bridgebox can solve your unique challenges."
      />
    </div>
  );
}
