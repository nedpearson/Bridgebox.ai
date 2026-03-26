import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Building2, StopCircle, CheckCircle2, ArrowLeft, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BuildOrchestratorAgent } from '../../lib/ai/agents/BuildOrchestratorAgent';
import { organizationsService } from '../../lib/db/organizations';
import AiIntelligencePane from '../../components/onboarding/AiIntelligencePane';
import AiInputAssist from '../../components/onboarding/AiInputAssist';

export const INDUSTRIES = [
  "Agriculture & Forestry",
  "Automotive & Transportation",
  "Business & Consulting Services",
  "Construction & Contracting",
  "E-Commerce & Online Retail",
  "Education & E-Learning",
  "Energy & Utilities",
  "Event Planning & Hospitality",
  "Financial Services & Accounting",
  "Government & Public Sector",
  "Healthcare, Medical, & Wellness",
  "Legal Services",
  "Logistics, Supply Chain, & Travel",
  "Manufacturing & Production",
  "Marketing, Advertising, & PR",
  "Media & Entertainment",
  "Non-Profit & Philanthropy",
  "Real Estate & Property Management",
  "Retail & Consumer Goods",
  "Software & Technology (SaaS)",
  "Telecommunications",
  "Wholesale & Distribution"
];

export default function AiOnboardingWizard() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const isProjectMode = searchParams.get('type') === 'project';
  const { user, currentOrganization } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessInput, setBusinessInput] = useState('');
  const [properties, setProperties] = useState([{ name: '', url: '', category: '', location: '' }]);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [requireMobileApp, setRequireMobileApp] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualOrgName, setManualOrgName] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  const mergedContext = `
    ${isProjectMode ? `Project Name: ${projectName}` : ''}
    Industry: ${industry || 'Not Specified'}
    Business Description: ${businessInput}
    Web Properties & Locations:
    ${properties.filter(p => p.name || p.url).map(p => `- Property: ${p.name || 'Unnamed'}, URL: ${p.url || 'None'}, Category: ${p.category || 'N/A'}, Location: ${p.location || 'N/A'}`).join('\n')}
    Competitors: ${competitorUrl}
    Requires Mobile App: ${requireMobileApp ? 'Yes' : 'No'}
  `.trim();

  const parseAndSaveIntelligence = async () => {
     if (!currentOrganization || !user) return;
     
     try {
         setIsSubmitting(true);

         // Write the raw context mapped session baseline directly into the DB.
         const { data: sessionData, error } = await supabase
            .from('bb_onboarding_sessions')
            .insert({
                organization_id: currentOrganization.id,
                client_id: user.id,
                session_title: isProjectMode ? `Project Scaffold: ${projectName || 'Untitled'}` : 'AI Blueprint Architecture Run',
                raw_input: { full_context: mergedContext },
                status: 'in_review'
            })
            .select()
            .single();
            
         if (error) throw error;
         
         // Phase 12: Ensure this feature is mapped correctly throughout the program natively:
         await organizationsService.updateOrganization(currentOrganization.id, {
             industry: industry || undefined,
             metadata: {
                 ...((currentOrganization as any).metadata || {}),
                 properties: properties.filter(p => p.name.trim() || p.url.trim() || p.location.trim())
             }
         });
         
         if (sessionData) {
             await BuildOrchestratorAgent.extractTasksFromSession(sessionData.id, currentOrganization.id, mergedContext);
             
             // Phase 8: Alert Super Admins of Orchestration completion
             await supabase.from('bb_internal_dev_tasks').insert([{
               title: `[AI Architect] Scaffolding Complete: ${currentOrganization.name}`,
               description: `Blueprint generated from telemetry.\nOrg ID: ${currentOrganization.id}\nSession ID: ${sessionData.id}`,
               status: 'todo',
               priority: 'high',
               category: 'feature',
               labels: ['orchestration', 'new_client_activation']
             }]);
         }
         
         setStep(2);
         setTimeout(() => navigate(`/app/onboarding/${sessionData.id}/admin`), 2500);
         
     } catch (err) {
         console.error("Failed to commit session", err);
     } finally {
         setIsSubmitting(false);
     }
  };

  const handleManualSetup = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!manualOrgName.trim()) return;
     
     try {
         setIsManualLoading(true);
         await organizationsService.createOrganization({ 
            name: manualOrgName.trim(), 
            type: 'client' 
         });
         // Hard reload to force auth context to fetch the new organization membership natively
         window.location.href = '/app';
     } catch (err) {
         console.error("Failed manual setup", err);
     } finally {
         setIsManualLoading(false);
     }
  };
  
  if (step === 2) {
      return (
         <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="text-center"
            >
               <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
               </div>
               <h1 className="text-3xl font-bold text-white mb-4">Architecture Blueprint Generated.</h1>
               <p className="text-slate-400 max-w-md mx-auto">
                   Bridgebox AI has successfully extracted your systems telemetry. Your dedicated Implementation Engineer in the Command Center is reviewing the graph.
               </p>
            </motion.div>
         </div>
      );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Input Pane */}
      <div className="w-1/2 p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-12 flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>

        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-10 cursor-pointer" onClick={() => navigate('/app')}>
            <Building2 className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Bridgebox.ai
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
               {isProjectMode ? "Let's blueprint your initial project." : "Let's blueprint your business."}
            </h1>
            <p className="text-xl text-slate-400">
               {isProjectMode ? "Describe the scope and timeline of the workflow you are implementing, and I will scaffold the exact entity maps instantly." : "Tell me about how you operate implicitly, and I will architect your exact system workflows instantly."}
            </p>
          </motion.div>

          {/* Phase 8: Conversational UI Response */}
          <AnimatePresence>
             {businessInput.length > 20 && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   className="mb-6 flex items-start space-x-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl"
                >
                   <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                   </div>
                   <div>
                      <p className="text-slate-300 text-sm">
                         {businessInput.length < 100 
                            ? "I'm starting to see the shape of your business. Feel free to dictate exactly how a lead travels through your company." 
                            : businessInput.length < 300 
                            ? "Excellent. I'm mapping your operational graph on the right. Are there specific documents or external tools you use heavily?"
                            : "Perfect. This deep telemetry uniquely profiles your architecture. I am locking down the structural pathways now."}
                      </p>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>

           <div className="space-y-6">
            {isProjectMode && (
               <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Project Name
                  </label>
                  <AiInputAssist
                    value={projectName}
                    onChange={setProjectName}
                    placeholder="e.g. Acme Co. Migration"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
               </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Industry
              </label>
              <div className="relative">
                <AiInputAssist
                  value={industry}
                  onChange={setIndustry}
                  onFocus={() => setShowIndustryDropdown(true)}
                  onBlur={() => setShowIndustryDropdown(false)}
                  placeholder="e.g. Legal, Retail, Real Estate"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <ChevronDown className="absolute right-12 top-4 w-4 h-4 text-slate-400 pointer-events-none" />
                {showIndustryDropdown && (
                   <div className="absolute z-50 left-0 right-10 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black ring-opacity-5">
                      {INDUSTRIES.filter(i => i.toLowerCase().includes(industry.toLowerCase())).map(ind => (
                         <button
                           key={ind}
                           type="button"
                           onMouseDown={(e) => {
                             e.preventDefault();
                             setIndustry(ind);
                             setShowIndustryDropdown(false);
                           }}
                           className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                         >
                           {ind}
                         </button>
                      ))}
                      {industry && !INDUSTRIES.some(i => i.toLowerCase() === industry.toLowerCase()) && (
                         <div className="px-4 py-2 text-sm text-indigo-400 italic bg-slate-800/50">
                            Custom Industry: "{industry}"
                         </div>
                      )}
                   </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {isProjectMode ? "Describe the project constraints, goals, and necessary sub-tasks." : "Describe what your business does, your daily workflows, and what problems you have."}
              </label>
              <AiInputAssist
                multiline
                value={businessInput}
                onChange={setBusinessInput}
                placeholder={isProjectMode ? "We need to deploy a new Real Estate CRM integration over the next 4 weeks. Key tasks include..." : "We run a boutique real estate agency. Our biggest pain point is tracking lead conversions and making sure documents aren't lost..."}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div>
               <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Brands & Web Properties
                  </label>
                  <button type="button" onClick={(e) => { e.preventDefault(); setProperties(prev => [...prev, { name: '', url: '', category: '', location: '' }]) }} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center">
                     <Plus className="w-3 h-3 mr-1" /> Add Property
                  </button>
               </div>
               
               <datalist id="wizard-existing-names">
                 {Array.from(new Set(properties.filter(p => p.name.trim()).map(p => p.name))).map(name => (
                   <option key={name} value={name} />
                 ))}
               </datalist>
               <datalist id="wizard-existing-locations">
                 {Array.from(new Set(properties.filter(p => p.location.trim()).map(p => p.location))).map(loc => (
                   <option key={loc} value={loc} />
                 ))}
               </datalist>
               <datalist id="wizard-existing-categories">
                 {Array.from(new Set(properties.filter(p => p.category?.trim()).map(p => p.category))).map(cat => (
                   <option key={cat} value={cat} />
                 ))}
               </datalist>

               <div className="space-y-3 mb-4">
                  {properties.map((prop, idx) => (
                    <div key={idx} className="flex flex-col space-y-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg relative">
                       {properties.length > 1 && (
                         <button type="button" onClick={() => { const newProps = properties.filter((_, i) => i !== idx); setProperties(newProps) }} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <div className="grid grid-cols-2 gap-3 pr-6">
                         <div className="col-span-1">
                           <AiInputAssist list="wizard-existing-names" placeholder="Brand/Company Name" value={prop.name} onChange={(val) => { const newProps = [...properties]; newProps[idx].name = val; setProperties(newProps) }} className="bg-slate-900 border border-slate-700 text-sm text-white px-3 py-2 rounded focus:border-indigo-500" />
                         </div>
                         <div className="col-span-1">
                           <AiInputAssist type="url" placeholder="Website URL" value={prop.url} onChange={(val) => { const newProps = [...properties]; newProps[idx].url = val; setProperties(newProps) }} className="bg-slate-900 border border-slate-700 text-sm text-white px-3 py-2 rounded focus:border-indigo-500" />
                         </div>
                         <div className="col-span-1">
                           <AiInputAssist list="wizard-existing-categories" placeholder="Category (e.g. Retail)" value={prop.category} onChange={(val) => { const newProps = [...properties]; newProps[idx].category = val; setProperties(newProps) }} className="bg-slate-900 border border-slate-700 text-sm text-white px-3 py-2 rounded focus:border-indigo-500" />
                         </div>
                         <div className="col-span-1">
                           <AiInputAssist list="wizard-existing-locations" placeholder="Location (e.g. NYC)" value={prop.location} onChange={(val) => { const newProps = [...properties]; newProps[idx].location = val; setProperties(newProps) }} className="bg-slate-900 border border-slate-700 text-sm text-white px-3 py-2 rounded focus:border-indigo-500" />
                         </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <label className="block text-sm font-medium text-slate-300 mb-2 mt-4">
                 Competitor Websites (comma-separated)
               </label>
               <AiInputAssist
                 value={competitorUrl}
                 onChange={setCompetitorUrl}
                 placeholder="e.g. competitor.com, rival.io"
                 className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
               />
            </div>
            
            {isProjectMode && (
              <div className="mt-3 flex items-center space-x-3 bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => setRequireMobileApp(!requireMobileApp)}>
                 <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${requireMobileApp ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-slate-900'}`}>
                    {requireMobileApp && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                 </div>
                 <div className="select-none">
                    <label className="text-sm font-medium text-white block cursor-pointer">
                      Native Mobile App Required
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">We need this project built for iOS and Android.</p>
                 </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-slate-500 text-sm mb-1">Step 1 of 1</p>
            {!isProjectMode && (
              <button 
                onClick={() => setIsManualModalOpen(true)}
                className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-2"
              >
                Skip AI & setup workspace manually
              </button>
            )}
          </div>
          <button 
            onClick={parseAndSaveIntelligence}
            disabled={isSubmitting || businessInput.length < 10}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
              (isSubmitting || businessInput.length < 10) ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {isSubmitting ? 'Architecting...' : 'Submit Intelligence Target'}
            <Sparkles className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Right AI Interpreter Pane */}
      <div className="w-1/2 bg-slate-950 p-12 border-l border-slate-800 overflow-y-auto">
        <AiIntelligencePane rawContext={mergedContext} />
      </div>

      {/* Manual Setup Fallback Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2">Manual Workspace Setup</h2>
            <p className="text-slate-400 text-sm mb-6">Create an empty organization instantly without AI scaffolding.</p>
            
            <form onSubmit={handleManualSetup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name</label>
                <input
                  type="text"
                  required
                  value={manualOrgName}
                  onChange={(e) => setManualOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  disabled={isManualLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isManualLoading || !manualOrgName.trim()}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  {isManualLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : 'Create Workspace'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
