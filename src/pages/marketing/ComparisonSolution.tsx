import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, XCircle, CheckCircle } from 'lucide-react';
import { comparisonsData, ComparisonSEO } from '../../data/marketing/comparisons';
import { SEO } from '../../components/seo/SEO';

const ComparisonSolution = () => {
  const { slug } = useParams<{ slug: string }>();

  const data: ComparisonSEO | undefined = Object.values(comparisonsData).find(
    (i) => i.slug === slug
  );

  if (!data) {
    return <Navigate to="/" replace />;
  }

  const schema = {
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "mainEntity": {
      "@type": "Product",
      "name": "Bridgebox AI",
      "description": "Enterprise Workflow and Custom Software Generation"
    }
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonicalUrl={`/compare/${data.slug}`}
        ogType="article"
        jsonLdSchema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        <section className="relative px-6 lg:px-8 max-w-7xl mx-auto py-20 overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 blur-[120px] rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm font-medium mb-8 shadow-sm">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Bridgebox vs {data.competitorName}</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
              {data.h1}
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-3xl mx-auto">
              {data.bridgeboxAdvantage}
            </p>
          </motion.div>
        </section>

        <section className="py-16 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              {/* Competitor Column */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 flex flex-col items-center">
                <h3 className="text-2xl font-bold text-slate-400 mb-8 border-b border-slate-800 pb-4 w-full text-center">
                  {data.competitorName} Limits
                </h3>
                <ul className="space-y-6 w-full">
                  {data.competitorLimitations.map((lim, idx) => (
                    <li key={idx} className="flex items-start text-slate-500 text-lg">
                      <XCircle className="w-6 h-6 text-slate-700 mr-4 flex-shrink-0 mt-0.5" />
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bridgebox Column */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
                 <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
                <h3 className="text-2xl font-bold text-white mb-8 border-b border-indigo-500/20 pb-4 w-full text-center flex items-center justify-center">
                  <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm bg-indigo-500/10 px-3 py-1 rounded-full mr-3">Bridgebox</span>
                  Advantage
                </h3>
                <ul className="space-y-6 w-full relative z-10">
                  {data.bridgeboxFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-white text-lg font-medium">
                      <CheckCircle className="w-6 h-6 text-indigo-400 mr-4 flex-shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 w-full">
                   <Link
                    to="/sales-onboarding"
                    className="w-full flex items-center justify-center px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all glow-effect shadow-lg shadow-indigo-500/30"
                  >
                    Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ComparisonSolution;
