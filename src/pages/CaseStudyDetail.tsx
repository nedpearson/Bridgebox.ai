import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Section from '../components/Section';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import DashboardMockup from '../components/DashboardMockup';
import GridPattern from '../components/GridPattern';
import { staggerContainer, staggerItem } from '../utils/animations';
import { getCaseStudyBySlug, getFeaturedCaseStudies } from '../data/caseStudies';

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined;
  const relatedCaseStudies = getFeaturedCaseStudies(3).filter((cs) => cs.slug !== slug);

  if (!caseStudy) {
    return <Navigate to="/case-studies" replace />;
  }

  const serviceLabels: Record<string, string> = {
    custom_software: 'Custom Software',
    dashboard: 'Dashboards & Analytics',
    mobile_app: 'Mobile Applications',
    ai_automation: 'AI Automation',
    integration: 'System Integration',
    retainer: 'Ongoing Support',
  };

  return (
    <div className="pt-20">
      <Section background="gradient" className="pt-32 pb-16 relative">
        <GridPattern />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/case-studies"
              className="inline-flex items-center text-slate-300 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Case Studies
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Badge variant="secondary">{caseStudy.industry}</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            {caseStudy.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl text-slate-300 mb-8 leading-relaxed"
          >
            {caseStudy.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2"
          >
            {caseStudy.services.map((service) => (
              <Badge key={service} variant="primary">
                {serviceLabels[service] || service}
              </Badge>
            ))}
          </motion.div>
        </div>
      </Section>

      <Section background="dark">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <DashboardMockup />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-12"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">The Challenge</h2>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed">{caseStudy.challenge}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">The Solution</h2>
                </div>
                <p className="text-lg text-slate-300 leading-relaxed mb-6">{caseStudy.solution}</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Implementation</h3>
                <div className="space-y-4">
                  {caseStudy.implementation.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-1" />
                      <p className="text-slate-300 leading-relaxed">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card glass className="sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Client Profile</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Industry</div>
                    <div className="text-slate-300">{caseStudy.industry}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Client Type</div>
                    <div className="text-slate-300">{caseStudy.client_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Services Delivered</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {caseStudy.services.map((service) => (
                        <Badge key={service} variant="secondary" size="sm">
                          {serviceLabels[service] || service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <Card className="bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 border-[#10B981]/20">
              <h2 className="text-3xl font-bold text-white mb-4">Results</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                {caseStudy.results.primary}
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {caseStudy.results.metrics.map((metric, index) => (
                  <motion.div key={metric.label} variants={staggerItem} custom={index}>
                    <Card glass className="h-full text-center">
                      <div className="text-4xl font-bold text-[#10B981] mb-2">{metric.value}</div>
                      <div className="text-sm font-medium text-white mb-2">{metric.label}</div>
                      <div className="text-xs text-slate-400">{metric.description}</div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </Card>
          </motion.div>

          {caseStudy.testimonial && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <div className="text-6xl text-[#10B981] mb-6 opacity-20">"</div>
                <blockquote className="text-xl text-slate-300 leading-relaxed mb-6 italic">
                  {caseStudy.testimonial.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    {caseStudy.testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{caseStudy.testimonial.author}</div>
                    <div className="text-sm text-slate-400">
                      {caseStudy.testimonial.role} • {caseStudy.testimonial.company}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </Section>

      {relatedCaseStudies.length > 0 && (
        <Section background="darker">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">More Success Stories</h2>
            <p className="text-xl text-slate-400">
              Explore how we've helped other clients transform their operations
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {relatedCaseStudies.map((study, index) => (
              <motion.div key={study.slug} variants={staggerItem} custom={index}>
                <Link to={`/case-studies/${study.slug}`}>
                  <Card className="h-full group cursor-pointer hover:border-[#10B981]/50 transition-all duration-300">
                    <div
                      className="h-2 w-full rounded-t-xl mb-6 -mt-6 -mx-6"
                      style={{ backgroundColor: study.thumbnail_color }}
                    />
                    <Badge variant="secondary" className="mb-4">
                      {study.industry}
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#10B981] transition-colors duration-300">
                      {study.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{study.tagline}</p>
                    <div className="flex items-center text-[#10B981] group-hover:gap-2 transition-all duration-300">
                      <span className="text-sm font-medium">Read Case Study</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      )}

      <Section background="gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready for Similar Results?
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Let's discuss how custom software, operational dashboards, mobile applications, and intelligent automation can transform your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" to="/contact">
              Start Your Project <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" to="/services">
              Explore Services
            </Button>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
