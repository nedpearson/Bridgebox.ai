import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Workflow, ServerCog } from 'lucide-react';
import { useCasesData, UseCaseSEO } from '../../data/marketing/use-cases';
import { SEO } from '../../components/seo/SEO';

const UseCaseSolution = () => {
  const { slug } = useParams<{ slug: string }>();

  const data: UseCaseSEO | undefined = Object.values(useCasesData).find(
    (i) => i.slug === slug
  );

  if (!data) {
    return <Navigate to="/use-cases" replace />;
  }

  const schema = {
    "@type": "Service",
    "name": data.title,
    "description": data.description,
    "provider": {
      "@type": "Organization",
      "name": "Bridgebox AI"
    },
    "serviceType": "Software Development & Workflow Automation"
  };

  return (
    <>
      <SEO
        title={data.title}
        description={data.description}
        canonicalUrl={`/use-cases/${data.slug}`}
        ogType="website"
        jsonLdSchema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16">
        <section className="relative px-6 lg:px-8 max-w-7xl mx-auto py-20 overflow-hidden text-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <Target className="w-4 h-4" />
              <span>Enterprise Use Case</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              {data.h1}
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              {data.description}
            </p>
            <Link
              to="/sales-onboarding"
              className="inline-flex items-center px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 glow-effect"
            >
              Solve This Challenge <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        <section className="py-20 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h3 className="text-2xl font-bold mb-8 flex items-center text-slate-300">
                  <Workflow className="w-6 h-6 mr-3 text-red-400" /> The Chaos
                </h3>
                <div className="space-y-6">
                  {data.challenges.map((challenge, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-6 rounded-xl shadow-md">
                      <p className="text-slate-400">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-8 flex items-center text-slate-300">
                  <ServerCog className="w-6 h-6 mr-3 text-indigo-400" /> The Bridgebox Solution
                </h3>
                <div className="space-y-6">
                  {data.solutions.map((solution, idx) => (
                    <div key={idx} className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-xl shadow-md">
                      <p className="text-indigo-100">{solution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default UseCaseSolution;
