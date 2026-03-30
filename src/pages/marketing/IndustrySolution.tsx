import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles, Building2 } from 'lucide-react';
import { industriesData, IndustrySEO } from '../../data/marketing/industries';
import { SEO } from '../../components/seo/SEO';

const IndustrySolution = () => {
  const { industrySlug } = useParams<{ industrySlug: string }>();

  // Ensure slug exists in data dictionary, otherwise 404/redirect
  const data: IndustrySEO | undefined = Object.values(industriesData).find(
    (i) => i.slug === industrySlug
  );

  if (!data) {
    return <Navigate to="/solutions" replace />;
  }

  // Build pristine JSON-LD Schema for Google Service & Product
  const schema = {
    "@type": "Product",
    "name": `Bridgebox AI for ${data.slug.charAt(0).toUpperCase() + data.slug.slice(1)}`,
    "description": data.description,
    "brand": {
      "@type": "Brand",
      "name": "Bridgebox AI"
    },
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/OnlineOnly",
      "url": `https://bridgebox.ai/solutions/${data.slug}`
    }
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonicalUrl={`/solutions/${data.slug}`}
        ogType="website"
        jsonLdSchema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        {/* Elite Hero Section */}
        <section className="relative px-6 lg:px-8 max-w-7xl mx-auto py-20 overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                <span className="capitalize">{data.slug.replace('-', ' ')} Solutions</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
                {data.h1}
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                {data.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/sales-onboarding"
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center glow-effect"
                >
                  Book a Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/platform"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center"
                >
                  Explore Platform
                </Link>
              </div>
            </motion.div>
            
            {/* Visual Proof / UI Mockup placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                 <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-800">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Bridgebox Studio</h3>
                      <p className="text-sm text-slate-400">Live Architecture</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    {data.workflowAutomation.map((workflow, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4 flex items-start space-x-4 border border-slate-700/50">
                        <Zap className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{workflow}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pain Points vs Bridgebox Matrix */}
        <section className="bg-slate-900 border-y border-slate-800 py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl lg:text-5xl font-bold text-center mb-16">
              Why Universal Software Fails in <span className="text-indigo-400 capitalize">{data.slug.replace('-', ' ')}</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-2" /> Current Limitations
                </h3>
                <ul className="space-y-4">
                  {data.painPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-2 mr-3 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-indigo-500/10 rounded-2xl p-8 border border-indigo-500/20">
                <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" /> The Bridgebox Solution
                </h3>
                <ul className="space-y-4">
                  {data.workflowAutomation.map((point, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-24 text-center max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to Automate?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join the top firms leveraging Bridgebox to transform operations.
          </p>
          <Link
            to="/sales-onboarding"
            className="inline-flex items-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all"
          >
            Start Your Custom Build
          </Link>
        </section>
      </div>
    </>
  );
};

export default IndustrySolution;
