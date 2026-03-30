import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles, Building2, Terminal, Layers, Repeat, ArrowUpRight } from 'lucide-react';
import { SEO } from '../../components/seo/SEO';

const ProgrammaticSeoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract category route purely from URL parsing since this is a global route
  // e.g., /industry/foo -> category: 'industry'
  const category = location.pathname.split('/')[1] || 'industry';

  useEffect(() => {
    let mounted = true;
    const loadContent = async () => {
      try {
        setLoading(true);
        // We dynamically import the generated programmatic intent JSON at runtime.
        // Vite will automatically create static splitted chunks for these datasets!
        const payload = await import(`../../data/seo-content/${category}/${slug}.json`);
        if (mounted) {
          setData(payload.default || payload);
          setError(false);
        }
      } catch (err) {
        console.warn(`SEO Route missing: ${category}/${slug}`);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadContent();
    return () => { mounted = false; };
  }, [category, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return <Navigate to="/" replace />;
  }

  // Schema Generation for Crawlers (Phase 8)
  const schema = {
    "@context": "https://schema.org",
    "@type": data.intent === "comparison" ? "Article" : "Product",
    "name": data.metadata.title,
    "description": data.metadata.description,
    "brand": {
      "@type": "Brand",
      "name": "Bridgebox AI"
    },
    ...(data.intent !== "comparison" && {
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/OnlineOnly",
        "url": data.metadata.canonical
      }
    }),
    ...(data.content.faq && data.content.faq.length > 0 && {
      "mainEntity": data.content.faq.map((f: any) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    })
  };

  return (
    <>
      <SEO
        title={data.metadata.title}
        description={data.metadata.description}
        canonicalUrl={`/${category}/${slug}`}
        ogType={data.category === "blog" ? "article" : "website"}
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
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] uppercase tracking-widest font-bold mb-6">
                <Building2 className="w-4 h-4" />
                <span>{data.keyword}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                {data.content.heroH1}
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                {data.content.heroSubtitle}
              </p>
              
              {/* Primary Conversion Layer (Phase 9) */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  to="/sales-onboarding"
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/25 flex items-center justify-center glow-effect"
                >
                  {data.content.cta.primary || "Book a Demo"} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/platform"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center border border-slate-700 hover:border-slate-600"
                >
                  {data.content.cta.secondary || "Explore Platform"}
                </Link>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                 <Shield className="w-4 h-4 text-emerald-500" />
                 {data.content.cta.trustText || "Join innovative companies replacing legacy systems with autonomous software."}
              </p>
            </motion.div>
            
            {/* Visual Architecture Representation */}
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl lg:blur-[80px]" />
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-full">
                 <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-800">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Bridgebox Studio</h3>
                      <p className="text-sm text-slate-400 font-mono">Autonomous Pipeline Running</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 flex items-start space-x-4 border border-slate-700/50">
                      <Terminal className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Problem Identified:</p>
                        <p className="text-slate-400 text-xs mt-1">{data.content.problemStatement}</p>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-500/10 rounded-lg p-4 flex items-start space-x-4 border border-emerald-500/20">
                      <Zap className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                         <p className="text-emerald-300 text-sm font-medium">Platform Solution Running:</p>
                         <p className="text-slate-300 text-xs mt-1 leading-relaxed">{data.content.solutionExplanation}</p>
                      </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Benefits Grid */}
        {data.content.benefits && (
          <section className="bg-slate-900 border-y border-slate-800 py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Bridgebox for {capitalize(data.keyword)}?</h2>
                <p className="text-slate-400 text-lg">We architect systems that replace repetitive work with robust scalable logic entirely.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {data.content.benefits.map((benefit: any, idx: number) => (
                   <div key={idx} className="bg-slate-950 rounded-2xl p-8 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                     <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6 text-indigo-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                     <p className="text-slate-400 leading-relaxed text-sm">{benefit.description}</p>
                   </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Visual Workflow Steps (Exploiting Competitor Generics) */}
        {data.content.workflowSteps && (
          <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">How the {capitalize(data.keyword)} Pipeline Works</h2>
              <p className="text-slate-400 text-lg">A true enterprise system doesn't just trigger simple actions—it natively orchestrates complex transactional environments autonomously.</p>
            </div>
            
            <div className="relative">
              {/* Desktop Connecting Logic Line */}
              <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>
              
              <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
                 {data.content.workflowSteps.map((step: any, idx: number) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-8 relative hover:border-indigo-500/40 transition-colors">
                       <div className="absolute -top-6 left-8 lg:left-1/2 lg:-translate-x-1/2 w-12 h-12 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                         {idx + 1}
                       </div>
                       <h3 className="text-xl font-bold text-white mb-3 mt-4 lg:text-center">{step.title}</h3>
                       <p className="text-slate-400 leading-relaxed text-sm lg:text-center">{step.description}</p>
                    </div>
                 ))}
              </div>
            </div>
          </section>
        )}

        {/* SEO Internal Link Graph Mapping (Phase 5) */}
        {data.internalLinks && data.internalLinks.length > 0 && (
          <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8 border-b border-slate-800">
             <div className="mb-12 flex items-center justify-between">
               <h2 className="text-2xl font-bold">Explore Related Solutions</h2>
             </div>
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.internalLinks.map((link: any, idx: number) => (
                   <Link key={idx} to={link.url} className="px-5 py-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all flex items-center justify-between group">
                      <span className="text-sm font-semibold text-slate-300 group-hover:text-indigo-300">{link.text}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400" />
                   </Link>
                ))}
             </div>
          </section>
        )}

        {/* SEO FAQ Section */}
        {data.content.faq && data.content.faq.length > 0 && (
          <section className="py-24 max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
               {data.content.faq.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                     <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
               ))}
            </div>
          </section>
        )}
        
        {/* Bottom Conversion Bar */}
        <section className="py-20 text-center max-w-4xl mx-auto px-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl my-16">
          <h2 className="text-3xl font-bold mb-4">Start Building Automations Today</h2>
          <p className="text-lg text-slate-400 mb-8">
            Experience the true power of AI-assisted structural engineering.
          </p>
          <Link
            to="/sales-onboarding"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
             Launch {capitalize(data.keyword)} Platform <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </section>

      </div>
    </>
  );
};

// Helper inside the component
function capitalize(str: string) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export default ProgrammaticSeoPage;
