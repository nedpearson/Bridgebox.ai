import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, MapPin, Zap, Bot, Link as LinkIcon, 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Copy 
} from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { calculatePricing, PricingConfig } from '../../lib/pricingEngine';

const INDUSTRIES = ['Legal', 'Accounting', 'Retail', 'Logistics', 'Med Spa', 'Consulting', 'Real Estate', 'Healthcare'];
const MODELS = ['B2B Services', 'B2C Services', 'E-Commerce / Hybrid', 'Enterprise / Wholesale'];
const INTEGRATIONS = ['stripe', 'quickbooks', 'slack', 'gmail', 'hubspot', 'salesforce'];

export default function PricingSimulator() {
  const [config, setConfig] = useState<PricingConfig>({
    industry: 'Legal',
    model: 'B2B Services',
    integrations: ['stripe'],
    aiUsage: 'standard',
    mobile: false,
    users: 5,
    locations: 1
  });

  const [copiedLink, setCopiedLink] = useState(false);

  const pricing = calculatePricing(config);

  const generateProposalLink = () => {
    // Generates a mock URL that could be emailed to a prospect to drop them into a pre-filled cart/onboarding
    const payload = btoa(JSON.stringify(config));
    const url = `${window.location.origin}/sales-onboarding?proposal=${payload}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleIntegration = (id: string) => {
     setConfig(prev => ({
        ...prev,
        integrations: prev.integrations.includes(id) 
            ? prev.integrations.filter(i => i !== id)
            : [...prev.integrations, id]
     }));
  };

  return (
    <>
      <AppHeader title="Pricing & Margin Simulator" subtitle="Internal Sales quoting tool and revenue modeler" />
      
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Configuration Engine */}
          <div className="lg:col-span-2 space-y-6">
            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-indigo-400" />
                Prospect Identity
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Industry</label>
                  <select 
                    value={config.industry} 
                    onChange={e => setConfig({...config, industry: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500"
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">Business Model</label>
                  <select 
                    value={config.model} 
                    onChange={e => setConfig({...config, model: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500"
                  >
                    {MODELS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" /> Initial Team Size
                  </label>
                  <input 
                    type="number" min="1" max="10000"
                    value={config.users}
                    onChange={e => setConfig({...config, users: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Number of Locations
                  </label>
                  <input 
                    type="number" min="1" max="500"
                    value={config.locations}
                    onChange={e => setConfig({...config, locations: parseInt(e.target.value) || 1})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500"
                  />
                </div>
              </div>
            </Card>

            <Card glass className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-indigo-400" />
                Technical Parameters
              </h3>
              
              <div className="mb-6">
                 <label className="text-sm font-medium text-slate-400 mb-3 block">Generative AI Quota</label>
                 <div className="grid grid-cols-3 gap-3">
                   {(['standard', 'high', 'unlimited'] as const).map(tier => (
                      <button key={tier} onClick={() => setConfig({...config, aiUsage: tier})}
                         className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${config.aiUsage === tier ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                         {tier}
                      </button>
                   ))}
                 </div>
              </div>

              <div className="mb-6">
                 <label className="text-sm font-medium text-slate-400 mb-3 block">Premium Integrations</label>
                 <div className="grid grid-cols-3 gap-2">
                   {INTEGRATIONS.map(i => (
                     <button key={i} onClick={() => toggleIntegration(i)}
                       className={`p-2 rounded border text-xs font-bold uppercase transition-all flex items-center justify-between ${config.integrations.includes(i) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                       {i}
                       {config.integrations.includes(i) && <CheckCircle2 className="w-3 h-3" />}
                     </button>
                   ))}
                 </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <input type="checkbox" checked={config.mobile} onChange={(e) => setConfig({...config, mobile: e.target.checked})} className="form-checkbox h-5 w-5 text-indigo-500 bg-slate-800 border-slate-700 rounded" />
                  <div>
                    <span className="block text-white font-medium">Native Mobile App (IOS/Android)</span>
                    <span className="block text-sm text-slate-400">Provisions a compiled field-app alongside the web dashboard.</span>
                  </div>
                </label>
              </div>

            </Card>
          </div>

          {/* Right Column: Output Metrics */}
          <div className="space-y-6">
             <Card glass className="p-6 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Recommended Tier</h3>
               <div className="text-3xl font-black text-white mb-8">{pricing.tier}</div>

               <div className="space-y-4">
                 <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                   <span className="text-slate-400 font-medium">Monthly MSRP</span>
                   <div className="text-right">
                     <span className="text-3xl font-bold text-white">${pricing.monthlyMsrp.toLocaleString()}</span>
                     <span className="text-slate-500 text-sm block">/ mo</span>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                   <span className="text-slate-400 font-medium">Billed Annually</span>
                   <div className="text-right">
                     <span className="text-xl font-bold text-emerald-400">${pricing.annualMsrp.toLocaleString()}</span>
                     <span className="text-slate-500 text-sm block">/ yr (-20%)</span>
                   </div>
                 </div>

                 {pricing.setupFee > 0 && (
                   <div className="flex justify-between items-center text-amber-400 font-medium pt-2">
                     <span>One-Time Setup</span>
                     <span>${pricing.setupFee.toLocaleString()}</span>
                   </div>
                 )}
               </div>

               <Button onClick={generateProposalLink} className="w-full mt-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500">
                 {copiedLink ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                 {copiedLink ? 'Copied to Clipboard' : 'Copy Proposal Link'}
               </Button>
             </Card>

             {/* COGS & MARGIN ANALYSIS - INTERNAL ONLY */}
             <Card className="p-6 bg-slate-900/80 border-slate-700">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                 <TrendingUp className="w-4 h-4 mr-2" /> Internal Margin Analysis
               </h3>

               <div className="space-y-4">
                 <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                   <div className="flex justify-between mb-1">
                     <span className="text-slate-400 text-sm">Estimated COGS</span>
                     <span className="text-white font-bold">${pricing.monthlyCogs.toLocaleString()} / mo</span>
                   </div>
                   <div className="text-xs text-slate-500">Includes Infra, Integrations, and AI Tokens</div>
                 </div>

                 <div className={`rounded-lg p-4 border ${pricing.marginStatus === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/30' : pricing.marginStatus === 'Warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                   <div className="flex justify-between items-center mb-1">
                     <span className={`text-sm font-black uppercase ${pricing.marginStatus === 'Healthy' ? 'text-emerald-400' : pricing.marginStatus === 'Warning' ? 'text-amber-400' : 'text-red-400'}`}>
                       Gross Margin
                     </span>
                     <span className={`text-2xl font-black ${pricing.marginStatus === 'Healthy' ? 'text-emerald-400' : pricing.marginStatus === 'Warning' ? 'text-amber-400' : 'text-red-400'}`}>
                       {pricing.grossMarginPercentage}%
                     </span>
                   </div>
                   {pricing.marginStatus !== 'Healthy' && (
                     <div className="flex items-start mt-2 text-xs text-red-300">
                       <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                       This configuration is dangerously close to unprofitable due to high COGS limits.
                     </div>
                   )}
                 </div>
               </div>
             </Card>
          </div>

        </div>
      </div>
    </>
  );
}
