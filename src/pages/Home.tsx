import HeroSection from "../components/marketing/HeroSection";
import HowItWorksSection from "../components/marketing/HowItWorksSection";
import IndustrySelectorSection from "../components/marketing/IndustrySelectorSection";
import ProductShowcaseSection from "../components/marketing/ProductShowcaseSection";
import MobileExperienceSection from "../components/marketing/MobileExperienceSection";
import AICapabilitiesSection from "../components/marketing/AICapabilitiesSection";
import TemplateAssemblySection from "../components/marketing/TemplateAssemblySection";
import CompetitiveMatrixSection from "../components/marketing/CompetitiveMatrixSection";
import InstantDemoSection from "../components/marketing/InstantDemoSection";
import PricingClaritySection from "../components/marketing/PricingClaritySection";
import SocialProofCTASection from "../components/marketing/SocialProofCTASection";
import { SEO } from '../components/seo/SEO';

export default function Home() {
  const schema = {
    "@type": "Organization",
    "name": "Bridgebox AI",
    "url": "https://bridgebox.ai",
    "logo": "https://bridgebox.ai/image.png",
    "description": "Enterprise workflow automation and custom AI software development.",
    "sameAs": [
      "https://linkedin.com/company/bridgebox-ai",
      "https://twitter.com/bridgebox-ai"
    ]
  };

  return (
    <>
      <SEO 
        title="AI Workflow Automation & Custom Software Platform"
        description="Bridgebox seamlessly integrates disconnected SaaS tools and accelerates custom software development using secure AI automation pipelines. Start building."
        canonicalUrl="/"
        jsonLdSchema={schema}
      />
      <div className="pt-20 bg-slate-950 font-sans text-slate-300">
        {/* SECTION 1: Above The Fold */}
      <HeroSection />

      {/* SECTION 2: Explainer Logistics */}
      <HowItWorksSection />

      {/* SECTION 3: Dynamic Audience Targeting */}
      <IndustrySelectorSection />

      {/* SECTION 4: Core Software Evidence */}
      <ProductShowcaseSection />

      {/* SECTION 5: Native App Generators Evidence */}
      <MobileExperienceSection />

      {/* SECTION 6: Copilot Synapse Evidence */}
      <AICapabilitiesSection />

      {/* SECTION 7: Architecture Walkthrough */}
      <TemplateAssemblySection />

      {/* SECTION 8: Competitor Inversion */}
      <CompetitiveMatrixSection />

      {/* SECTION 9: Zero-Friction Demo Experience */}
      <InstantDemoSection />

      {/* SECTION 10: Transparent Revenue Math */}
      <PricingClaritySection />

      {/* SECTION 11-12: Closing Validation Funnel */}
      <SocialProofCTASection />
    </div>
    </>
  );
}
