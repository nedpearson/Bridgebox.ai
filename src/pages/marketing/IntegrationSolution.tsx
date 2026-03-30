import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Puzzle, Zap, Server } from 'lucide-react';
import { integrationsData, IntegrationSEO } from '../../data/marketing/integrations';
import { SEO } from '../../components/seo/SEO';

const IntegrationSolution = () => {
  const { slug } = useParams<{ slug: string }>();

  const data: IntegrationSEO | undefined = Object.values(integrationsData).find(
    (i) => i.slug === slug
  );

  if (!data) {
    return <Navigate to="/integrations" replace />;
  }

  const schema = {
    "@type": "SoftwareApplication",
    "name": data.title,
    "description": data.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonicalUrl={`/integrations/${data.slug}`}
        ogType="product"
        jsonLdSchema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        <section className="px-6 lg:px-8 max-w-7xl mx-auto py-20 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/10 blur-[120px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <Puzzle className="w-4 h-4" />
              <span>Native Connector Library</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              {data.h1}
            </h1>
            
            <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto">
              {data.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sales-onboarding"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20 glow-effect"
              >
                Connect {data.provider} Now
              </Link>
              <Link
                to="/use-cases"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
              >
                View Use Cases
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-24 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16 px-4">
              Bridgebox + <span className="text-blue-400">{data.provider}</span> Capabilities
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {data.features.map((feature, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Server className="w-24 h-24 text-blue-500" />
                  </div>
                  <Zap className="w-8 h-8 text-blue-400 mb-6 relative z-10" />
                  <p className="text-slate-300 relative z-10 text-lg leading-relaxed">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default IntegrationSolution;
