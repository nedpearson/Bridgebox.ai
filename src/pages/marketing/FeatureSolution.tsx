import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Box, PlayCircle, BarChart3 } from 'lucide-react';
import { featuresData, FeatureSEO } from '../../data/marketing/features';
import { SEO } from '../../components/seo/SEO';

const FeatureSolution = () => {
  const { slug } = useParams<{ slug: string }>();

  const data: FeatureSEO | undefined = Object.values(featuresData).find(
    (i) => i.slug === slug
  );

  if (!data) {
    return <Navigate to="/platform" replace />;
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
        canonicalUrl={`/features/${data.slug}`}
        ogType="product"
        jsonLdSchema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        <section className="relative px-6 lg:px-8 max-w-7xl mx-auto py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-sm font-medium mb-6">
                <Box className="w-4 h-4" />
                <span>Core Platform Feature</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
                {data.h1}
              </h1>
              <p className="text-xl text-indigo-100/80 mb-10 leading-relaxed font-medium">
                {data.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <Link
                  to="/sales-onboarding"
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center glow-effect"
                >
                  Start Building <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="#capabilities"
                  className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center border border-slate-700"
                >
                  View Capabilities
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
               <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="w-16 h-16 rounded-full bg-indigo-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shadow-indigo-500/50">
                        <PlayCircle className="w-8 h-8 ml-1" />
                     </div>
                  </div>
                  {/* Abstract UI representation */}
                  <div className="w-full h-full p-4 flex flex-col gap-4 opacity-50">
                     <div className="w-full h-12 bg-slate-800 rounded" />
                     <div className="flex gap-4 h-full">
                        <div className="w-1/3 h-full bg-slate-800 rounded" />
                        <div className="w-2/3 h-full bg-slate-800 rounded" />
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        <section id="capabilities" className="py-24 bg-slate-900 border-y border-slate-800">
           <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-16">
                 Technical Capabilities
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                 {data.capabilities.map((cap, i) => (
                    <div key={i} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-colors shadow-lg">
                       <BarChart3 className="w-8 h-8 text-indigo-400 mb-6" />
                       <p className="text-slate-300 text-lg leading-relaxed">
                          {cap}
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

export default FeatureSolution;
