import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Database,
  Eye,
  CheckCircle2,
  ArrowRight,
  Activity,
  PieChart,
  LineChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../components/Section";
import Card from "../components/Card";
import Button from "../components/Button";
import ProductDashboard from "../components/ProductDashboard";
import GridPattern from "../components/GridPattern";
import FinalCTA from "../components/FinalCTA";
import { staggerContainer, staggerItem } from "../utils/animations";

export default function Dashboards() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Data",
      description:
        "Live updates from all your systems, aggregated and visualized the moment events occur.",
    },
    {
      icon: PieChart,
      title: "Custom Visualizations",
      description:
        "Charts, graphs, and metrics designed specifically for your business KPIs and decision-making needs.",
    },
    {
      icon: Database,
      title: "Unified Data Sources",
      description:
        "Connect all your systems into a single view. CRM, ERP, databases, APIs, and third-party tools.",
    },
    {
      icon: Eye,
      title: "Operational Visibility",
      description:
        "See exactly what is happening across your entire business at any given moment.",
    },
  ];

  const dashboardTypes = [
    {
      title: "Executive Dashboards",
      description:
        "High-level strategic metrics for leadership teams to monitor business performance and make data-driven decisions.",
      metrics: [
        "Revenue tracking",
        "Growth indicators",
        "Market trends",
        "Team performance",
      ],
    },
    {
      title: "Operations Command Centers",
      description:
        "Real-time monitoring of operational processes, resource allocation, and workflow status across teams.",
      metrics: [
        "Active workflows",
        "Task completion",
        "Resource utilization",
        "Bottleneck detection",
      ],
    },
    {
      title: "Sales & Revenue Analytics",
      description:
        "Track pipeline health, conversion rates, customer acquisition, and revenue forecasts in real-time.",
      metrics: [
        "Pipeline value",
        "Conversion rates",
        "Customer lifetime value",
        "Revenue forecasts",
      ],
    },
    {
      title: "Performance Monitoring",
      description:
        "System health, application performance, and infrastructure metrics for technical teams.",
      metrics: [
        "System uptime",
        "Response times",
        "Error rates",
        "Resource usage",
      ],
    },
  ];

  const capabilities = [
    "Custom data pipelines from any source",
    "Real-time updates and live streaming",
    "Role-based access controls",
    "Mobile-responsive design",
    "Automated alerts and notifications",
    "Export to PDF, Excel, and more",
    "Historical data and trend analysis",
    "Predictive analytics and forecasting",
    "Drill-down capabilities",
    "Customizable layouts per user",
  ];

  const benefits = [
    {
      title: "Faster Decisions",
      description:
        "Make informed decisions immediately with real-time data instead of waiting for reports.",
    },
    {
      title: "Identify Issues Early",
      description:
        "Spot problems and bottlenecks before they impact operations or revenue.",
    },
    {
      title: "Increase Efficiency",
      description:
        "Optimize resource allocation and workflows based on actual performance data.",
    },
    {
      title: "Align Teams",
      description:
        "Give everyone visibility into shared goals, progress, and organizational priorities.",
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
            className="inline-block px-4 py-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full mb-6"
          >
            <span className="text-[#10B981] font-medium text-sm">
              Business Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Custom Dashboard & Analytics Systems
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Command centers that provide real-time visibility into every aspect
            of your operations. See what is happening now, predict what is
            coming next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/contact">
              <Button variant="primary" size="lg">
                See Dashboard Examples
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
            Live Dashboard Preview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto mb-12"
          >
            This is what enterprise-grade operational intelligence looks like
          </motion.p>
        </div>

        <ProductDashboard />
      </Section>

      <Section background="darker">
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
            Everything you need to turn data into actionable insights
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
              <Card className="h-full text-center group hover:border-[#10B981]/50">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-[#10B981]/20 to-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-6"
                >
                  <feature.icon className="w-8 h-8 text-[#10B981]" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#10B981] transition-colors">
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
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Dashboard Capabilities
            </h3>
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

      <Section background="dark">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Dashboard Types
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Custom-built for your specific operational needs
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {dashboardTypes.map((type, index) => (
            <motion.div key={type.title} variants={staggerItem} custom={index}>
              <Card className="h-full group hover:border-[#10B981]/50">
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#10B981] transition-colors">
                  {type.title}
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {type.description}
                </p>
                <div className="space-y-2">
                  {type.metrics.map((metric) => (
                    <div key={metric} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span className="text-sm text-slate-400">{metric}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Why Custom Dashboards?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Generic BI tools force you to adapt. Custom dashboards adapt to you.
          </motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={staggerItem}
              custom={index}
              className="text-center"
            >
              <div className="text-5xl font-bold bg-gradient-to-r from-[#10B981] to-indigo-500 bg-clip-text text-transparent mb-4">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/contact">
            <Button variant="primary" size="lg">
              Request Dashboard Examples
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </Section>

      <FinalCTA
        headline="Build Your Operational Dashboard"
        subtext="Get real-time insights across your entire business with custom dashboards engineered for your data sources and decision-making needs."
      />
    </div>
  );
}
