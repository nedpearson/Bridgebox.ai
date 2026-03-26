import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, ArrowRight, Wand2, ArrowLeft, RefreshCw, LayoutTemplate } from 'lucide-react';
import { templateService } from '../../lib/db/templates';
import { aiTemplateGenerator } from '../../lib/engines/aiTemplateGenerator';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TemplateInstallWizard from '../../components/app/TemplateInstallWizard';

export default function AiTemplateWizard() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || !currentOrganization) return;
    
    setIsGenerating(true);
    try {
      // Pass the previous template payload context if we are refining an existing generation
      const previousContext = generatedTemplate ? JSON.stringify(generatedTemplate) : undefined;
      const blueprint = await aiTemplateGenerator.generateFromPrompt(prompt, currentOrganization.id, previousContext);
      
      setGeneratedTemplate(blueprint);
    } catch (e: any) {
      console.error(e);
      alert(`Generation Error: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
      <div className="flex items-center space-x-4 mb-6">
        <button 
           onClick={() => navigate('/app/templates')}
           className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span>AI Template Generator</span>
          </h1>
          <p className="text-slate-400">Transform natural language into a strictly compliant Bridgebox schema mapping.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
         {!generatedTemplate ? (
            <motion.div
               key="input"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="space-y-6"
            >
               <div className="relative">
                 <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                 <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                 <textarea
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   disabled={isGenerating}
                   placeholder="Describe your perfect business operation. E.g., 'I run a local HVAC service. I need a dispatch system with a customer intake form, technician routing workflows, and an AI agent to draft quotes...'"
                   className="w-full h-64 bg-slate-900 border-y border-white/5 resize-none p-8 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                 />
                 
                 {isGenerating && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                       <Bot className="w-12 h-12 text-indigo-500 mb-4 animate-bounce" />
                       <div className="text-indigo-300 font-medium">Antigravity Intelligence Engine is designing your architecture...</div>
                       <div className="text-slate-500 text-sm mt-2">Mapping entities, chaining logic graphs, synthesizing internal models.</div>
                    </div>
                 )}
               </div>
               
               <div className="flex justify-end">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600 border-none shadow-lg shadow-indigo-500/25 text-white"
                  >
                     <Wand2 className="w-5 h-5 mr-2" />
                     {isGenerating ? 'Synthesizing Blueprint...' : 'Generate Architecture'}
                  </Button>
               </div>
            </motion.div>
         ) : (
            <motion.div
               key="result"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
               <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-900 border-indigo-500/30 md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                           <LayoutTemplate className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-white">Generative Schema Success</h2>
                           <p className="text-indigo-200 text-sm">Validating configuration payload against master OS constraints... Passed.</p>
                        </div>
                     </div>
                     <Button 
                        onClick={() => setIsInstallModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20"
                     >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        1-Click Install to Workspace
                     </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-400">{generatedTemplate.configuration_payload.entities.length}</div>
                        <div className="text-xs text-slate-400 uppercase">Entities</div>
                     </div>
                     <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-400">{generatedTemplate.configuration_payload.workflows.length}</div>
                        <div className="text-xs text-slate-400 uppercase">Workflows</div>
                     </div>
                     <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-emerald-400">{generatedTemplate.configuration_payload.forms.length}</div>
                        <div className="text-xs text-slate-400 uppercase">Forms</div>
                     </div>
                     <div className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-amber-400">{generatedTemplate.configuration_payload.ai_agents.length}</div>
                        <div className="text-xs text-slate-400 uppercase">Agents</div>
                     </div>
                  </div>
                  
                  <Button onClick={() => {
                     // Emptying prompt allows user to ask for refinement on the *same* template context
                     setPrompt(''); 
                     // We intentionally don't clear generatedTemplate so it gets used as context for the next call
                  }} variant="secondary" className="text-slate-400">
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Refine Architecture
                  </Button>
               </Card>
            </motion.div>
         )}
      </AnimatePresence>
      
      {generatedTemplate && (
         <TemplateInstallWizard 
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
            template={generatedTemplate}
            onSuccess={() => navigate('/app/tasks')}
         />
      )}
    </div>
  );
}
