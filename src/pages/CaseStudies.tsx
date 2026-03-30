import { motion } from "framer-motion";
import { ArrowRight, Briefcase, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import GridPattern from "../components/GridPattern";
import FinalCTA from "../components/FinalCTA";
import { staggerContainer, staggerItem } from "../utils/animations";
import { caseStudies } from "../data/caseStudies";

export default function CaseStudies() {
  const stats = [
    { icon: Award, label: "Average Efficiency Gain", value: "65%" },
    { icon: TrendingUp, label: "Average ROI Timeline", value: "6-8 months" },
    { icon: Briefcase, label: "Client Success Rate", value: "100%" },
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
              Client Success Stories
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Real Results with Bridgebox
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-slate-300 leading-relaxed mb-4"
          >
            See how Bridgebox transforms operations through custom software,
            operational dashboards, mobile applications, and intelligent
            automation.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-slate-400 leading-relaxed"
          >
            Enterprise-grade engineering delivering measurable operational
            advantages.
          </motion.p>
        </div>
      </Section>

      <Section background="dark">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.label} variants={staggerItem} custom={index}>
              <Card glass className="text-center h-full">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#10B981]/10 mb-4">
                  <stat.icon className="w-7 h-7 text-[#10B981]" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Case Studies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Deep-dive into how we engineer custom systems that deliver
            measurable results
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {caseStudies.map((study, index) => (
            <motion.div key={study.slug} variants={staggerItem} custom={index}>
              <Link to={`/case-studies/${study.slug}`}>
                <Card className="h-full group cursor-pointer hover:border-[#10B981]/50 transition-all duration-300">
                  <div
                    className="h-2 w-full rounded-t-xl mb-6 -mt-6 -mx-6"
                    style={{ backgroundColor: study.thumbnail_color }}
                  />

                  <div className="mb-4">
                    <Badge variant="secondary">{study.industry}</Badge>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#10B981] transition-colors duration-300">
                    {study.title}
                  </h3>

                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {study.tagline}
                  </p>

                  <div className="mb-6">
                    <div className="text-sm font-medium text-slate-500 mb-3">
                      Key Results
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {study.results.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.label}>
                          <div className="text-2xl font-bold text-[#10B981] mb-1">
                            {metric.value}
                          </div>
                          <div className="text-xs text-slate-400">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-[#10B981] group-hover:gap-2 transition-all duration-300">
                    <span className="font-medium">Read Case Study</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <FinalCTA
        headline="Start Your Transformation"
        subtext="Ready to achieve similar results? Let's discuss how custom software, operational dashboards, and intelligent automation can transform your operations."
      />
    </div>
  );
}
