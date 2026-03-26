import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Building2, StopCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { autoBuildOrchestrator } from '../../lib/ai/services/autoBuildOrchestrator';
import AiIntelligencePane from '../../components/onboarding/AiIntelligencePane';

export default function AiOnboardingWizard() {
  const navigate = useNavigate();
  const { user, currentOrganization } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessInput, setBusinessInput] = useState('');
  const [clientUrl, setClientUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setBusinessInput((prev) => prev + ' ' + finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };
  
  const mergedContext = `
    Business Description: ${businessInput}
    Client Website: ${clientUrl}
    Competitor Website: ${competitorUrl}
  `.trim();

  const parseAndSaveIntelligence = async () => {
     if (!currentOrganization || !user) return;
     
     try {
         setIsSubmitting(true);

         // Write the raw context mapped session baseline directly into the DB.
         const { data: sessionData, error } = await supabase
            .from('onboarding_sessions')
            .insert({
                organization_id: currentOrganization.id,
                client_id: user.id,
                session_title: 'AI Blueprint Architecture Run',
                raw_input: { full_context: mergedContext },
                status: 'in_review'
            })
            .select()
            .single();
            
         if (error) throw error;
         
         // Dynamically parse the telemetry into physical `onboarding_build_tasks` objects seamlessly mapping them for the Super Admin automatically.
         if (sessionData) {
             await autoBuildOrchestrator.extractTasksFromSession(sessionData.id, currentOrganization.id, mergedContext);
         }
         
         setStep(2);
         setTimeout(() => navigate('/app/onboarding-command'), 2500);
         
     } catch (err) {
         console.error("Failed to commit session", err);
     } finally {
         setIsSubmitting(false);
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
                   Bridgebox AI has successfully extracted your systems telemetry. Your dedicated Implementation Engineer is reviewing the graph.
               </p>
            </motion.div>
         </div>
      );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Input Pane */}
      <div className="w-1/2 p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12 cursor-pointer" onClick={() => navigate('/app')}>
            <Building2 className="w-8 h-8 text-[#3B82F6]" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Bridgebox.ai
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Let's blueprint your business.</h1>
            <p className="text-xl text-slate-400">
              Tell me about how you operate implicitly, and I will architect your exact system workflows instantly.
            </p>
          </motion.div>

          {/* Phase 8: Conversational UI Response */}
          <AnimatePresence>
             {businessInput.length > 20 && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   className="mb-6 flex items-start space-x-3 bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4 rounded-xl"
                >
                   <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#3B82F6]" />
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Describe what your business does, your daily workflows, and what problems you have.
              </label>
              <textarea
                rows={5}
                value={businessInput}
                onChange={(e) => setBusinessInput(e.target.value)}
                placeholder="We run a boutique real estate agency. Our biggest pain point is tracking lead conversions and making sure documents aren't lost..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors resize-none mb-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Website URL
                  </label>
                  <input
                    type="url"
                    value={clientUrl}
                    onChange={(e) => setClientUrl(e.target.value)}
                    placeholder="https://yourdomain.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Competitor URL
                  </label>
                  <input
                    type="url"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="https://competitor.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
               </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={toggleRecording}
                className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors border ${
                  isRecording 
                    ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-5 h-5 mr-2 text-red-400 animate-pulse" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2 text-[#3B82F6]" />
                    Voice Dictation (Talk it out)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <p className="text-slate-500 text-sm">Step 1 of 1</p>
          <button 
            onClick={parseAndSaveIntelligence}
            disabled={isSubmitting || businessInput.length < 10}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
              (isSubmitting || businessInput.length < 10) ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
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
    </div>
  );
}
